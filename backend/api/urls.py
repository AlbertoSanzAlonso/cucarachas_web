from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ContactSubmissionViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'contacts', ContactSubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
