from django.db import models

class Tips(models.Model):
   
    PROFILE_CHOICES = [
        ('FOR', 'Combatente / Direto'),
        ('DEX', 'Furtivo / Especialista'),
        ('INT', 'Erudito / Analítico'),
        ('CHA', 'Social / Diplomata'),
    ]

    system = models.ForeignKey('System', on_delete=models.CASCADE, related_name='tips')
    target_profile = models.CharField(
        max_length=3, 
        choices=PROFILE_CHOICES,
        help_text="Perfil psicológico do jogador detectado no quiz"
    )
    suggested_class = models.CharField(max_length=150, help_text="Ex: Mago, Combatente, Ocultista")
    roleplay_text = models.TextField(help_text="O conselho prático de como o iniciante pode interpretar esse personagem")