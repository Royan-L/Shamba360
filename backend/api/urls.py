from django.urls import path
from .views import dashboard_summary, demo_credentials, health_check, login

urlpatterns = [
    path('health/', health_check),
    path('auth/login/', login),
    path('demo-credentials/', demo_credentials),
    path('dashboard/', dashboard_summary),
]
