from django.db import models

class System(models.Model):
    """
    Representa o sistema de RPG (Ex: D&D 5e, Tormenta RPG, T20).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
