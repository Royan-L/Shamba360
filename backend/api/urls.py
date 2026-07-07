from django.urls import path
from .views import (
    approve_order,
    create_order,
    dashboard_summary,
    demo_credentials,
    dispatch_order,
    download_receipt,
    health_check,
    login,
    signup,
    update_notification_preferences,
)

urlpatterns = [
    path('health/', health_check),
    path('auth/login/', login),
    path('auth/signup/', signup),
    path('auth/profile/notifications/', update_notification_preferences),
    path('demo-credentials/', demo_credentials),
    path('dashboard/', dashboard_summary),
    path('orders/create/', create_order),
    path('orders/<str:reference_code>/approve/', approve_order),
    path('orders/<str:reference_code>/dispatch/', dispatch_order),
    path('orders/<str:reference_code>/receipt/', download_receipt),
]
