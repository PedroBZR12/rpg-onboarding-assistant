from django.db import models
from .system import System

class Race(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='races')
    name = models.CharField(max_length=100) # Ex: Anão, Elfo, Humano
    
    # Bônus ou penalidades de atributos que a raça concede
    str_bonus = models.IntegerField(default=0)
    dex_bonus = models.IntegerField(default=0)
    con_bonus = models.IntegerField(default=0)
    int_bonus = models.IntegerField(default=0)
    wis_bonus = models.IntegerField(default=0)
    cha_bonus = models.IntegerField(default=0)

    def __str__(self):
        return f"[{self.system.name}] {self.name}"