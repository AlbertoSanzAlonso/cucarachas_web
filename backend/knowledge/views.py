from rest_framework import viewsets
from .models import TechnicalKnowledge
from knowledge.serializers import TechnicalKnowledgeSerializer

class TechnicalKnowledgeViewSet(viewsets.ModelViewSet):
    queryset = TechnicalKnowledge.objects.all()
    serializer_class = TechnicalKnowledgeSerializer
