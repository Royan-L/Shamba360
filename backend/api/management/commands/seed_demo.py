from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from api.models import ActivityLog, Farm, Harvest, InventoryItem, Order, Profile, Sale


DEMO_PASSWORD = "Password123!"


class Command(BaseCommand):
    help = "Create Shamba360 demo users and sample farm data."

    def handle(self, *args, **options):
        User = get_user_model()

        manager = self.get_or_create_user(
            User, "manager@shamba360.test", "Wanjiku", "Kamau"
        )
        operator = self.get_or_create_user(
            User, "operator@shamba360.test", "Otieno", "Onyango"
        )
        customer = self.get_or_create_user(
            User, "customer@shamba360.test", "Achieng", "Wafula"
        )

        farm, _ = Farm.objects.get_or_create(
            name="Green Valley Farm",
            defaults={
                "location": "Kiambu County, Kenya",
                "manager": manager,
            },
        )

        Profile.objects.update_or_create(
            user=manager,
            defaults={
                "full_name": "Wanjiku Kamau",
                "role": Profile.ROLE_MANAGER,
                "farm": farm,
                "phone": "+254700111222",
            },
        )
        Profile.objects.update_or_create(
            user=operator,
            defaults={
                "full_name": "Otieno Onyango",
                "role": Profile.ROLE_OPERATOR,
                "farm": farm,
                "phone": "+254700333444",
            },
        )
        Profile.objects.update_or_create(
            user=customer,
            defaults={
                "full_name": "Achieng Wafula",
                "role": Profile.ROLE_CUSTOMER,
                "farm": None,
                "phone": "+254700555666",
            },
        )

        maize = self.get_or_create_inventory(farm, "Maize", "90kg bag", 35, 4500, 5)
        eggs = self.get_or_create_inventory(farm, "Eggs", "tray", 75, 420, 10)
        tomatoes = self.get_or_create_inventory(farm, "Tomatoes", "crate", 22, 2800, 3)

        self.get_or_create_harvest(farm, operator, "Maize", 40, "90kg bag", date(2026, 6, 10))
        self.get_or_create_harvest(farm, operator, "Eggs", 85, "tray", date(2026, 6, 18))
        self.get_or_create_harvest(farm, operator, "Tomatoes", 22, "crate", date(2026, 6, 19))

        Sale.objects.get_or_create(
            farm=farm,
            inventory_item=maize,
            customer_name="Local Trader - Jane W.",
            sale_date=date(2026, 6, 19),
            defaults={
                "recorded_by": operator,
                "quantity": Decimal("5"),
                "unit_price": Decimal("4500"),
                "payment_method": "mpesa",
            },
        )

        Order.objects.get_or_create(
            reference_code="ORD-1001",
            defaults={
                "farm": farm,
                "customer": customer,
                "inventory_item": eggs,
                "quantity": Decimal("10"),
                "collection_date": date(2026, 6, 25),
                "status": Order.STATUS_PENDING,
            },
        )

        ActivityLog.objects.get_or_create(
            farm=farm,
            actor=operator,
            action="Recorded harvest entries for maize, eggs, and tomatoes",
        )
        ActivityLog.objects.get_or_create(
            farm=farm,
            actor=manager,
            action="Reviewed pending customer order ORD-1001",
        )

        self.stdout.write(self.style.SUCCESS("Demo data is ready."))
        self.stdout.write("Manager:  manager@shamba360.test / Password123!")
        self.stdout.write("Operator: operator@shamba360.test / Password123!")
        self.stdout.write("Customer: customer@shamba360.test / Password123!")

    def get_or_create_user(self, User, email, first_name, last_name):
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
            },
        )
        if created or not user.check_password(DEMO_PASSWORD):
            user.set_password(DEMO_PASSWORD)
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        return user

    def get_or_create_inventory(self, farm, produce_type, unit, quantity, unit_price, threshold):
        item, _ = InventoryItem.objects.update_or_create(
            farm=farm,
            produce_type=produce_type,
            unit=unit,
            defaults={
                "quantity": Decimal(str(quantity)),
                "unit_price": Decimal(str(unit_price)),
                "low_stock_threshold": Decimal(str(threshold)),
            },
        )
        return item

    def get_or_create_harvest(self, farm, user, produce_type, quantity, unit, harvest_date):
        return Harvest.objects.get_or_create(
            farm=farm,
            recorded_by=user,
            produce_type=produce_type,
            harvest_date=harvest_date,
            defaults={
                "quantity": Decimal(str(quantity)),
                "unit": unit,
            },
        )
