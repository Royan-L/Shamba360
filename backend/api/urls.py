from django.urls import path
from .views import dashboard_summary, demo_credentials, health_check, login, signup

urlpatterns = [
    path('health/', health_check),
    path('auth/login/', login),
    path('auth/signup/', signup),
    path('demo-credentials/', demo_credentials),
    path('dashboard/', dashboard_summary),
]
