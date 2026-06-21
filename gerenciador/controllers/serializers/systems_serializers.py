from rest_framework import serializers

from gerenciador.models import RPGClass, Race, System


class RaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Race
        fields = [
            "id",
            "name",
            "str_bonus",
            "dex_bonus",
            "con_bonus",
            "int_bonus",
            "wis_bonus",
            "cha_bonus",
        ]


class RPGClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = RPGClass
        fields = [
            "id",
            "name",
            "base_hp_lvl1",
            "hp_per_lvl_after",
            "base_pm_lvl1",
            "pm_per_lvl_after",
        ]


class SystemSerializer(serializers.ModelSerializer):
    races = RaceSerializer(many=True, read_only=True)
    classes = RPGClassSerializer(many=True, read_only=True)

    class Meta:
        model = System
        fields = ["id", "name", "description", "races", "classes"]
