from django.contrib import admin
from .models import ActivityLog, Farm, Harvest, InventoryItem, Order, Profile, Sale

admin.site.register(ActivityLog)
admin.site.register(Farm)
admin.site.register(Harvest)
admin.site.register(InventoryItem)
admin.site.register(Order)
admin.site.register(Profile)
admin.site.register(Sale)
