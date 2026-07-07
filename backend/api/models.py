from django.conf import settings
from django.db import models


class Farm(models.Model):
    MPESA_PAYBILL = "paybill"
    MPESA_BUY_GOODS = "buygoods"

    MPESA_METHOD_CHOICES = [
        (MPESA_PAYBILL, "Paybill"),
        (MPESA_BUY_GOODS, "Buy Goods"),
    ]

    name = models.CharField(max_length=120)
    location = models.CharField(max_length=180)
    mpesa_method = models.CharField(max_length=20, choices=MPESA_METHOD_CHOICES, default=MPESA_PAYBILL)
    mpesa_number = models.CharField(max_length=30, blank=True)
    mpesa_account_name = models.CharField(max_length=80, blank=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="managed_farms",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    ROLE_MANAGER = "manager"
    ROLE_OPERATOR = "operator"
    ROLE_CUSTOMER = "customer"

    ROLE_CHOICES = [
        (ROLE_MANAGER, "Farm Manager"),
        (ROLE_OPERATOR, "Farm Operator"),
        (ROLE_CUSTOMER, "Customer"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=120)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    farm = models.ForeignKey(
        Farm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="profiles",
    )
    phone = models.CharField(max_length=30, blank=True)
    sms_opt_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class InventoryItem(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="inventory")
    produce_type = models.CharField(max_length=80)
    unit = models.CharField(max_length=40)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("farm", "produce_type", "unit")

    def __str__(self):
        return f"{self.produce_type} - {self.quantity} {self.unit}"


class Harvest(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="harvests")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    produce_type = models.CharField(max_length=80)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=40)
    harvest_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Sale(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="sales")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    customer_name = models.CharField(max_length=120)
    sale_date = models.DateField()
    payment_method = models.CharField(max_length=40)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_amount(self):
        return self.quantity * self.unit_price


class Order(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_READY = "ready"
    STATUS_REJECTED = "rejected"
    STATUS_COLLECTED = "collected"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_READY, "Ready for Pickup"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_COLLECTED, "Collected"),
    ]

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="orders")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    collection_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    reference_code = models.CharField(max_length=30, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ActivityLog(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="activity_logs")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    action = models.CharField(max_length=140)
    created_at = models.DateTimeField(auto_now_add=True)
