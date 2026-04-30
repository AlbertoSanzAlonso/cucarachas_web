from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpeciesViewSet, ServiceViewSet

router = DefaultRouter()
router.register(r'species', SpeciesViewSet)
router.register(r'services', ServiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
