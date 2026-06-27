from django.contrib import admin
from django.urls import path, include
from api.views import backend_root

urlpatterns = [
    path('', backend_root),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
