from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage
from django.db.models import Sum
from django.db import transaction
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date, datetime
import uuid
from .models import ActivityLog, Farm, Harvest, InventoryItem, Order, Profile, Sale


DEMO_PASSWORD = "Password123!"


def build_mpesa_details(farm, order_reference):
    method = (farm.mpesa_method or "").strip().lower()
    number = (farm.mpesa_number or "").strip()
    account_name = (farm.mpesa_account_name or "").strip()

    if not number:
        return {
            "method": None,
            "number": None,
            "label": "Payment details not configured for this farm.",
            "accountReference": None,
            "accountName": account_name or None,
        }

    if method == Farm.MPESA_BUY_GOODS:
        return {
            "method": Farm.MPESA_BUY_GOODS,
            "number": number,
            "label": f"M-Pesa Buy Goods: Till {number}",
            "accountReference": None,
            "accountName": account_name or None,
        }

    return {
        "method": Farm.MPESA_PAYBILL,
        "number": number,
        "label": f"M-Pesa Paybill: Business No. {number}",
        "accountReference": order_reference,
        "accountName": account_name or None,
    }


def serialize_profile(profile):
    return {
        "id": profile.user.id,
        "email": profile.user.email,
        "fullName": profile.full_name,
        "role": profile.role,
        "farmId": profile.farm_id,
        "farmName": profile.farm.name if profile.farm else None,
        "phone": profile.phone,
        "smsOptIn": profile.sms_opt_in,
    }


def send_order_approval_email(order, receipt_url):
    subject = f"Order {order.reference_code} approved - Receipt attached"
    total_price = order.quantity * order.inventory_item.unit_price
    mpesa = build_mpesa_details(order.farm, order.reference_code)
    payment_lines = [mpesa["label"]] if mpesa.get("label") else []

    if mpesa.get("accountReference"):
        payment_lines.append(f"Account/Reference: {mpesa['accountReference']}")

    if mpesa.get("accountName"):
        payment_lines.append(f"Account Name: {mpesa['accountName']}")

    payment_instructions = "\n".join(payment_lines)

    body = (
        f"Hello {order.customer.first_name or 'Buyer'},\n\n"
        f"Your order {order.reference_code} has been approved and is ready for pickup.\n"
        f"Farm: {order.farm.name}\n"
        f"Produce: {order.inventory_item.produce_type}\n"
        f"Quantity: {order.quantity}\n"
        f"Collection date: {order.collection_date.strftime('%d %b %Y')}\n"
        f"Total: KES {total_price:.2f}\n\n"
        f"Payment Details:\n{payment_instructions}\n\n"
        f"Download your receipt: {receipt_url}\n\n"
        "Thank you for buying from Shamba360."
    )

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@shamba360.local"),
        to=[order.customer.email],
    )
    email.send(fail_silently=False)

    return {
        "sent": True,
        "to": order.customer.email,
    }


def serialize_order(order):
    collection_date = order.collection_date
    if hasattr(collection_date, "isoformat"):
        collection_date_value = collection_date.isoformat()
    else:
        collection_date_value = str(collection_date)

    mpesa = build_mpesa_details(order.farm, order.reference_code)

    return {
        "reference_code": order.reference_code,
        "quantity": str(order.quantity),
        "collection_date": collection_date_value,
        "status": order.status,
        "customer__email": order.customer.email,
        "inventory_item__produce_type": order.inventory_item.produce_type,
        "farm_name": order.farm.name,
        "farm_mpesa_method": mpesa["method"],
        "farm_mpesa_number": mpesa["number"],
        "farm_mpesa_label": mpesa["label"],
        "farm_mpesa_account_reference": mpesa["accountReference"],
        "farm_mpesa_account_name": mpesa["accountName"],
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
    phone = (request.data.get("phone") or "").strip()
    sms_opt_in = bool(request.data.get("smsOptIn", False))

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
            phone=phone,
            sms_opt_in=sms_opt_in,
        )

    return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def update_notification_preferences(request):
    email = (request.data.get("email") or "").strip().lower()
    phone = (request.data.get("phone") or "").strip()
    sms_opt_in = bool(request.data.get("smsOptIn", False))

    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = Profile.objects.select_related("user").get(user__email=email)
    except Profile.DoesNotExist:
        return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if sms_opt_in and not phone:
        return Response(
            {"detail": "Phone number is required when SMS alerts are enabled."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile.phone = phone
    profile.sms_opt_in = sms_opt_in
    profile.save(update_fields=["phone", "sms_opt_in"])

    return Response({"user": serialize_profile(profile)})


@api_view(["POST"])
def approve_order(request, reference_code):
    approver_email = (request.data.get("approverEmail") or "").strip().lower()
    if not approver_email:
        return Response({"detail": "Approver email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        approver_profile = Profile.objects.select_related("user", "farm").get(user__email=approver_email)
    except Profile.DoesNotExist:
        return Response({"detail": "Approver profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if approver_profile.role not in {Profile.ROLE_MANAGER, Profile.ROLE_OPERATOR}:
        return Response({"detail": "Only manager or operator can approve orders."}, status=status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.select_related("customer", "inventory_item", "farm").get(
            reference_code=reference_code
        )
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if not approver_profile.farm_id or approver_profile.farm_id != order.farm_id:
        return Response({"detail": "You can only approve orders for your farm."}, status=status.HTTP_403_FORBIDDEN)

    if order.status in {Order.STATUS_READY, Order.STATUS_COLLECTED}:
        return Response({"detail": "Order already progressed beyond approval."}, status=status.HTTP_200_OK)

    order.status = Order.STATUS_READY
    order.save(update_fields=["status"])

    total_price = order.quantity * order.inventory_item.unit_price
    receipt_url = request.build_absolute_uri(f"/api/orders/{order.reference_code}/receipt/")
    email_result = {"sent": False, "reason": "Unable to send approval email."}

    try:
        email_result = send_order_approval_email(order, receipt_url)
    except Exception as exc:
        email_result = {"sent": False, "reason": str(exc)}

    ActivityLog.objects.create(
        farm=order.farm,
        actor=approver_profile.user,
        action=f"Approved order {order.reference_code} at {timezone.now().strftime('%Y-%m-%d %H:%M')}",
    )

    return Response(
        {
            "message": "Order approved successfully.",
            "order": {
                "referenceCode": order.reference_code,
                "status": order.status,
                "totalPrice": str(total_price),
            },
            "email": email_result,
            "receiptUrl": receipt_url,
        }
    )


@api_view(["POST"])
def dispatch_order(request, reference_code):
    approver_email = (request.data.get("approverEmail") or "").strip().lower()
    if not approver_email:
        return Response({"detail": "Approver email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        approver_profile = Profile.objects.select_related("user", "farm").get(user__email=approver_email)
    except Profile.DoesNotExist:
        return Response({"detail": "Approver profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if approver_profile.role not in {Profile.ROLE_MANAGER, Profile.ROLE_OPERATOR}:
        return Response({"detail": "Only manager or operator can dispatch orders."}, status=status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.select_related("farm").get(reference_code=reference_code)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if not approver_profile.farm_id or approver_profile.farm_id != order.farm_id:
        return Response({"detail": "You can only dispatch orders for your farm."}, status=status.HTTP_403_FORBIDDEN)

    if order.status not in {Order.STATUS_READY, Order.STATUS_APPROVED}:
        return Response({"detail": "Only ready orders can be marked collected."}, status=status.HTTP_400_BAD_REQUEST)

    confirm_collected = bool(request.data.get("confirmCollected", False))
    if not confirm_collected:
        return Response(
            {"detail": "Set confirmCollected=true to complete collection."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = Order.STATUS_COLLECTED
    order.save(update_fields=["status"])

    ActivityLog.objects.create(
        farm=order.farm,
        actor=approver_profile.user,
        action=f"Dispatched order {order.reference_code} at {timezone.now().strftime('%Y-%m-%d %H:%M')}",
    )

    return Response(
        {
            "message": "Order dispatched successfully.",
            "order": {
                "referenceCode": order.reference_code,
                "status": order.status,
            },
        }
    )


@api_view(["POST"])
def create_order(request):
    customer_email = (request.data.get("customerEmail") or "").strip().lower()
    quantity = request.data.get("quantity")
    collection_date_raw = request.data.get("collectionDate")
    inventory_item_id = request.data.get("inventoryItemId")

    if not customer_email:
        return Response({"detail": "Customer email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not quantity or not collection_date_raw or not inventory_item_id:
        return Response({"detail": "inventoryItemId, quantity, and collectionDate are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        collection_date = datetime.strptime(collection_date_raw, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return Response({"detail": "collectionDate must be in YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        customer_profile = Profile.objects.select_related("user").get(user__email=customer_email)
    except Profile.DoesNotExist:
        return Response({"detail": "Customer profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if customer_profile.role != Profile.ROLE_CUSTOMER:
        return Response({"detail": "Only buyer accounts can place orders here."}, status=status.HTTP_403_FORBIDDEN)

    try:
        item = InventoryItem.objects.select_related("farm").get(id=inventory_item_id)
    except InventoryItem.DoesNotExist:
        return Response({"detail": "Inventory item not found."}, status=status.HTTP_404_NOT_FOUND)

    ref_suffix = uuid.uuid4().hex[:6].upper()
    reference_code = f"ORD-{timezone.now().strftime('%d%H%M')}{ref_suffix}"

    order = Order.objects.create(
        farm=item.farm,
        customer=customer_profile.user,
        inventory_item=item,
        quantity=quantity,
        collection_date=collection_date,
        status=Order.STATUS_PENDING,
        reference_code=reference_code,
    )

    return Response({"order": serialize_order(order)}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def download_receipt(request, reference_code):
    try:
        order = Order.objects.select_related("customer", "inventory_item", "farm").get(reference_code=reference_code)
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    mpesa = build_mpesa_details(order.farm, order.reference_code)
    total_price = order.quantity * order.inventory_item.unit_price
    content = (
        "Shamba360 Receipt\n"
        f"Reference: {order.reference_code}\n"
        f"Buyer: {order.customer.email}\n"
        f"Farm: {order.farm.name}\n"
        f"Produce: {order.inventory_item.produce_type}\n"
        f"Quantity: {order.quantity}\n"
        f"Unit price: KES {order.inventory_item.unit_price}\n"
        f"Total: KES {total_price}\n"
        f"Collection date: {order.collection_date}\n"
        f"Status: {order.status}\n"
        f"Payment method: {mpesa['label']}\n"
        f"Payment reference: {mpesa['accountReference'] or '-'}\n"
        f"Payment account name: {mpesa['accountName'] or '-'}\n"
    )

    response = HttpResponse(content, content_type="text/plain")
    response["Content-Disposition"] = f'attachment; filename="receipt-{order.reference_code}.txt"'
    return response


@api_view(["GET"])
def dashboard_summary(request):
    farms = list(
        Farm.objects.select_related("manager")
        .order_by("name")
        .values("id", "name", "location", "manager__email", "mpesa_method", "mpesa_number", "mpesa_account_name")
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
        Order.objects.select_related("customer", "inventory_item", "farm")
        .order_by("-created_at")
        .values(
            "reference_code",
            "quantity",
            "collection_date",
            "status",
            "customer__email",
            "inventory_item__produce_type",
            "farm__name",
            "farm__mpesa_method",
            "farm__mpesa_number",
            "farm__mpesa_account_name",
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
