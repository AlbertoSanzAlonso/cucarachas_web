from django.db import models
from pgvector.django import VectorField

class TechnicalKnowledge(models.Model):
    """
    Base de datos de conocimiento técnico para RAG.
    Almacena fragmentos de protocolos, manuales y normativas.
    """
    title = models.CharField(max_length=255)
    content = models.TextField()
    source = models.CharField(max_length=255, blank=True, null=True) # Ej: Protocolo_Paneroles_V1.pdf
    category = models.CharField(max_length=100, default='general')
    
    # Embedding de 3072 dimensiones (para Gemini gemini-embedding-001)
    embedding = VectorField(dimensions=3072)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Coneixement Tècnic"
        verbose_name_plural = "Base de Coneixement"

    def __str__(self):
        return self.title
