"""
Shamba360 seed script.
Run from backend/ with venv active:

    python manage.py shell < scripts/seed_demo_data.py

This method is used because manage.py shell already sets up Django's
sys.path correctly on all platforms including Windows.
"""

# ── All imports work here because manage.py shell has already
#    configured sys.path and django.setup() before running this file.

from apps.accounts.repository import create_user_profile
from apps.farms.repository import create_farm
from apps.harvests.repository import record_harvest
from apps.inventory.repository import create_inventory_item
from apps.orders.repository import place_order
from apps.sales.repository import record_sale
from core.firebase.client import get_auth

DEMO_PASSWORD = "Password123!"


def get_or_create_firebase_user(email, display_name):
    auth = get_auth()
    try:
        user = auth.get_user_by_email(email)
        print(f"  Already exists: {email} ({user.uid})")
        return user
    except Exception:
        user = auth.create_user(
            email=email, password=DEMO_PASSWORD, display_name=display_name
        )
        print(f"  Created: {email} ({user.uid})")
        return user


print("Seeding Shamba360 demo data...\n")

print("1. Creating Firebase Auth accounts...")
manager_user  = get_or_create_firebase_user("manager@shamba360.test",  "Wanjiku Kamau")
operator_user = get_or_create_firebase_user("operator@shamba360.test", "Otieno Onyango")
customer_user = get_or_create_firebase_user("customer@shamba360.test", "Achieng Wafula")

print("\n2. Creating farm...")
farm = create_farm(
    name="Green Valley Farm",
    location="Kiambu County, Kenya",
    manager_uid=manager_user.uid,
)
print(f"   Farm created: {farm['name']} ({farm['id']})")

print("\n3. Creating user profiles in Firestore...")
create_user_profile(uid=manager_user.uid,  email="manager@shamba360.test",
    full_name="Wanjiku Kamau",  role="manager",   farm_id=farm["id"], phone="+254700111222")
create_user_profile(uid=operator_user.uid, email="operator@shamba360.test",
    full_name="Otieno Onyango", role="operator",  farm_id=farm["id"], phone="+254700333444")
create_user_profile(uid=customer_user.uid, email="customer@shamba360.test",
    full_name="Achieng Wafula", role="customer",  farm_id=None,       phone="+254700555666")
print("   Done.")

print("\n4. Creating inventory items...")
maize    = create_inventory_item(farm_id=farm["id"], produce_type="Maize",    unit="90kg bag", unit_price=4500, low_stock_threshold=5,  initial_quantity=0)
eggs     = create_inventory_item(farm_id=farm["id"], produce_type="Eggs",     unit="tray",     unit_price=420,  low_stock_threshold=10, initial_quantity=0)
tomatoes = create_inventory_item(farm_id=farm["id"], produce_type="Tomatoes", unit="crate",    unit_price=2800, low_stock_threshold=3,  initial_quantity=0)
print(f"   Created: {maize['produce_type']}, {eggs['produce_type']}, {tomatoes['produce_type']}")

print("\n5. Recording harvests (auto-updates inventory)...")
record_harvest(farm_id=farm["id"], recorded_by_uid=operator_user.uid, produce_type="Maize",    quantity=40, unit="90kg bag", harvest_date="2026-06-10", notes="First harvest")
record_harvest(farm_id=farm["id"], recorded_by_uid=operator_user.uid, produce_type="Eggs",     quantity=85, unit="tray",     harvest_date="2026-06-18")
record_harvest(farm_id=farm["id"], recorded_by_uid=operator_user.uid, produce_type="Tomatoes", quantity=22, unit="crate",    harvest_date="2026-06-19")
print("   3 harvest records added; stock levels updated.")

print("\n6. Recording a sale...")
record_sale(farm_id=farm["id"], recorded_by_uid=operator_user.uid, inventory_item_id=maize["id"],
    quantity=5, unit_price=4500, customer_name="Local Trader - Jane W.",
    sale_date="2026-06-19", payment_method="mpesa")
print("   Sale recorded: 5 bags of Maize.")

print("\n7. Placing a customer order...")
order = place_order(farm_id=farm["id"], customer_uid=customer_user.uid,
    inventory_item_id=eggs["id"], quantity=10, collection_date="2026-06-25")
print(f"   Order: {order['reference_code']} — 10 trays Eggs (status: {order['status']})")

print("\n" + "="*50)
print("Seeding complete!")
print("="*50)
print("\nDemo credentials (password: Password123!)")
print("  Manager:  manager@shamba360.test")
print("  Operator: operator@shamba360.test")
print("  Customer: customer@shamba360.test")