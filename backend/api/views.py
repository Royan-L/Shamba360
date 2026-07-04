from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ActivityLog, Farm, Harvest, InventoryItem, Order, Profile, Sale


DEMO_PASSWORD = "Password123!"


def serialize_profile(profile):
    return {
        "id": profile.user.id,
        "email": profile.user.email,
        "fullName": profile.full_name,
        "role": profile.role,
        "farmId": profile.farm_id,
        "farmName": profile.farm.name if profile.farm else None,
    }


@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "running",
        "message": "Shamba360 API is working"
    })


@api_view(["GET"])
def backend_root(request):
    return Response({
        "name": "Shamba360 API",
        "message": "Backend is running. Use /api/health/ for health checks.",
        "frontend": "http://127.0.0.1:5173/",
    })


@api_view(["GET"])
def demo_credentials(request):
    return Response({
        "password": DEMO_PASSWORD,
        "users": [
            {"role": "manager", "portal": "staff", "email": "manager@shamba360.test"},
            {"role": "operator", "portal": "staff", "email": "operator@shamba360.test"},
            {"role": "customer", "portal": "customer", "email": "customer@shamba360.test"},
        ],
    })


@api_view(["POST"])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    user = authenticate(username=email, password=password)
    if not user:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return Response(
            {"detail": "This user does not have a Shamba360 role profile."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response({"user": serialize_profile(profile)})


@api_view(["POST"])
def signup(request):
    User = get_user_model()

    full_name = (request.data.get("fullName") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    role = (request.data.get("role") or "").strip().lower()

    if not full_name:
        return Response({"detail": "Full name is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response(
            {"detail": "Password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role not in {Profile.ROLE_MANAGER, Profile.ROLE_OPERATOR, Profile.ROLE_CUSTOMER}:
        return Response({"detail": "Select a valid role."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
        return Response({"detail": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    farm = None
    if role in {Profile.ROLE_MANAGER, Profile.ROLE_OPERATOR}:
        farm = Farm.objects.order_by("id").first()
        if not farm:
            return Response(
                {"detail": "No farm is configured yet. Contact an administrator."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    first_name, _, last_name = full_name.partition(" ")

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        Profile.objects.create(
            user=user,
            full_name=full_name,
            role=role,
            farm=farm,
        )

    return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def dashboard_summary(request):
    farms = list(
        Farm.objects.select_related("manager")
        .order_by("name")
        .values("id", "name", "location", "manager__email")
    )
    inventory = list(
        InventoryItem.objects.select_related("farm")
        .order_by("produce_type")
        .values("id", "farm_id", "farm__name", "produce_type", "unit", "quantity", "unit_price", "low_stock_threshold")
    )
    harvests = list(
        Harvest.objects.order_by("-harvest_date")
        .values("produce_type", "quantity", "unit", "harvest_date")[:8]
    )
    sales = list(
        Sale.objects.order_by("-sale_date")
        .values("customer_name", "quantity", "unit_price", "sale_date", "inventory_item__produce_type")[:8]
    )
    orders = list(
        Order.objects.select_related("customer", "inventory_item")
        .order_by("-created_at")
        .values(
            "reference_code",
            "quantity",
            "collection_date",
            "status",
            "customer__email",
            "inventory_item__produce_type",
        )[:8]
    )
    activity = list(
        ActivityLog.objects.select_related("actor")
        .order_by("-created_at")
        .values("actor__email", "action", "created_at")[:8]
    )

    return Response({
        "metrics": {
            "inventoryItems": InventoryItem.objects.count(),
            "pendingOrders": Order.objects.filter(status=Order.STATUS_PENDING).count(),
            "harvestQuantity": Harvest.objects.aggregate(total=Sum("quantity"))["total"] or 0,
            "salesTransactions": Sale.objects.count(),
        },
        "farms": [
            {
                "id": farm["id"],
                "name": farm["name"],
                "manager": farm["manager__email"],
                "county": farm["location"].split(",")[-1].strip() if "," in farm["location"] else farm["location"],
                "area": farm["location"].split(",")[0].strip(),
                "distance_km": 10 + index * 6,
                "health_status": "Good",
                "produce_ready_days": 3 + index,
                "produce": [],
                "soil_focus": "Review soil nutrients and irrigation records before the next planting cycle.",
                "market_tip": "Use recent orders to decide which produce to prioritize this week.",
            }
            for index, farm in enumerate(farms)
        ],
        "inventory": inventory,
        "harvests": harvests,
        "sales": sales,
        "orders": orders,
        "activity": activity,
    })
