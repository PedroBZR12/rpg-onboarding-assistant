from django.db import models
from .question import Question

class Option(models.Model):
   
    TARGET_ATTRIBUTES = [
        ('STR', 'Strength / Força'),
        ('DEX', 'Dexterity / Destreza'),
        ('CON', 'Constitution / Constituição'),
        ('INT', 'Intelligence / Inteligência'),
        ('WIS', 'Wisdom / Sabedoria'),
        ('CHA', 'Charisma / Carisma'),
    ]

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    
    target_attribute = models.CharField(
        max_length=3, 
        choices=TARGET_ATTRIBUTES,
        help_text="Atributo que receberá ponto se esta opção for escolhida"
    )

    def __str__(self):
        return f"{self.text} (+1 {self.target_attribute})"