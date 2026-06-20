from django.db import models
from .system import System

class RPGClass(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='classes')
    name = models.CharField(max_length=100) # Ex: Mago, Guerreiro, Combatente
    
    
    base_hp_lvl1 = models.IntegerField(help_text="Vida no nível 1 (Ex: 6 para Mago, 10 para Guerreiro)")
    hp_per_lvl_after = models.IntegerField(help_text="Vida por nível seguinte (Ex: 4 para Mago, 6 para Guerreiro)")
    base_pm_lvl1 = models.IntegerField(help_text="PM no nível 1")
    pm_per_lvl_after = models.IntegerField(help_text="PM por nível seguinte")


    def __str__(self):
        return f"[{self.system.name}] {self.name}"