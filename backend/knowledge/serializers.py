from rest_framework import serializers
from .models import TechnicalKnowledge

class TechnicalKnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicalKnowledge
        fields = ['id', 'title', 'content', 'source', 'category', 'created_at', 'updated_at']
