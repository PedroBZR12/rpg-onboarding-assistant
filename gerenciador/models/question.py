from django.db import models


class Question(models.Model):
    system = models.ForeignKey('System', on_delete=models.CASCADE, related_name='questions')
    statement = models.TextField(help_text="Enunciado ou texto da pergunta do quiz")
