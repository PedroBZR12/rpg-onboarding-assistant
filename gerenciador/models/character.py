from django.db import models

class Character(models.Model):

    system = models.ForeignKey('System', on_delete=models.CASCADE, related_name='character')

    name = models.CharField(max_length=150)
    age = models.IntegerField(blank=True, null=True)
    movement = models.IntegerField(help_text="Deslocamento em metros ou quadrados")
    size = models.CharField(max_length=50, help_text="Ex: Médio, Pequeno")
    level = models.IntegerField(default=1)

    pvs = models.IntegerField(help_text="Pontos de vida (PV)")
    armor_class = models.IntegerField(help_text="Classe de armadura ou defesa (CA)")
    damage_reduction = models.IntegerField(help_text="Redução de dano (RD)")

    suggested_class = models.ForeignKey('RPGClass', on_delete=models.SET_NULL, null=True, blank=True)
    race = models.ForeignKey('Race', on_delete=models.SET_NULL, null=True, blank=True)
    generated_profile = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class TormentaCharacterSpecs(models.Model):

    character = models.OneToOneField('Character', on_delete=models.CASCADE, related_name="tormenmta_spec")

    mana_points = models.IntegerField(default=0, help_text="PM para conjuradores arcanos/divinos")
    
    strength = models.IntegerField(default=10)
    dextery = models.IntegerField(default=10)
    constitution = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)
    wisdom = models.IntegerField(default=10)
    charisma = models.IntegerField(default=10)

class DeDCharacterSpecs(models.Model):

    character = models.OneToOneField('Character', on_delete=models.CASCADE, related_name="ded_spec")

    mana_points = models.IntegerField(default=0, help_text="PM para conjuradores arcanos/divinos")
    
    strength = models.IntegerField(default=10)
    dextery = models.IntegerField(default=10)
    constitution = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)
    wisdom = models.IntegerField(default=10)
    charisma = models.IntegerField(default=10)

class OrdemCharacterSpecs(models.Model):

    character = models.OneToOneField('Character', on_delete=models.CASCADE, related_name="ordem_spec")

    strength = models.IntegerField(default=1)
    agility = models.IntegerField(default=1)
    constitution = models.IntegerField(default=1)
    intelligence = models.IntegerField(default=1)
    presence = models.IntegerField(default=1)

    effort_points = models.IntegerField(default=0, help_text="Pontos de esforço para utilizar as habilidades")
    sanity = models.IntegerField(help_text="Pontos de sanidade")

