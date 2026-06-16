from django.db import models
from .system import System

class Question(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE, related_name='questions')
    statement = models.TextField(help_text="Enunciado ou texto da pergunta do quiz")
