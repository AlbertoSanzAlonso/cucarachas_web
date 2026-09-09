from datetime import date

from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from ..models import BlogArticle
from ..serializers import BlogArticleSerializer


class BlogArticleViewSet(viewsets.ModelViewSet):
    """
    Blog público + CRUD admin.
    GET list/retrieve: AllowAny (solo publicados si anónimo).
    Escritura: IsAuthenticated.
    """

    serializer_class = BlogArticleSerializer
    lookup_field = "slug"
    lookup_value_regex = r"[-a-zA-Z0-9_]+"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = BlogArticle.objects.all().order_by("-published_at", "-id")
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_published=True)
        elif self.action == "list" and self.request.query_params.get("all") != "1":
            qs = qs.filter(is_published=True)

        category = (self.request.query_params.get("category") or "").strip().lower()
        valid = {c.value for c in BlogArticle.Category}
        if category in valid:
            qs = qs.filter(category=category)

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(excerpt__icontains=search))

        return qs

    def perform_create(self, serializer):
        if not serializer.validated_data.get("published_at"):
            serializer.save(published_at=date.today())
        else:
            serializer.save()
