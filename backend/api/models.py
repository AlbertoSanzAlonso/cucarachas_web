from django.db import models

class Species(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    details = models.JSONField(default=list) # List of strings
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Service(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.title
