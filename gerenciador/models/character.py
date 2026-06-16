from django.db import models

from gerenciador.models.system import System

class Character(models.Model):

    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='character')

    name = models.CharField(max_length=150)
    strength = models.IntegerField()
    dextery = models.IntegerField()
    constitution = models.IntegerField()
    intelligence = models.IntegerField()
    wisdom = models.IntegerField()
    charisma = models.IntegerField()

    suggested_class = models.CharField(max_length=200, blank=True, null=True)
    generated_profile = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)