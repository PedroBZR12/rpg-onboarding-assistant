from rest_framework import viewsets, status
from rest_framework.response import Response

from gerenciador.models.character import TormentaCharacterSpecs
from gerenciador.models.race import Race
from ..models import Character, DeDCharacterSpecs, OrdemCharacterSpecs, System, Option, Tips

class CharacterViewSet(viewsets.ViewSet):

    def create(self, request):
        dados = request.data
        try:
            system_id = dados.get('system_id')
            system = System.objects.get(id=system_id)

            chosen_option_ids = dados.get('chosen_options', [])
            score, target_profile = self._calculate_profile(chosen_option_ids)
            matching_tip, suggested_class, profile_name = self._get_matching_tip(system, target_profile)

            character_base = Character.objects.create(
                system=system,
                name=dados.get('name'),
                age=dados.get('age'),
                movement=dados.get('movement'),
                size=dados.get('size'),
                level=dados.get('level', 1),
                pvs=0,
                armor_class=10,
                damage_reduction=0,
                suggested_class=suggested_class,
                generated_profile=profile_name
            )

            specs_enviadas = dados.get('specs', {})
            self._create_system_specs(system, character_base, score, specs_enviadas)

            return Response({
                "message": "Ficha gerada e mapeada com sucesso!",
                "character_id": character_base.id,
                "suggested_class": suggested_class,
                "profile": profile_name,
                "roleplay_tip": matching_tip.roleplay_text if matching_tip else "Jogue livremente!"
            }, status=status.HTTP_201_CREATED)

        except System.DoesNotExist:
            return Response({"error": "Sistema não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

   
    def _calculate_profile(self, chosen_option_ids):
        options = Option.objects.filter(id__in=chosen_option_ids)
        score = {'STR': 0, 'DEX': 0, 'INT': 0, 'CON': 0, 'WIS': 0, 'CHA': 0}
        
        for option in options:
            score[option.target_attribute] += 1

        winning_attribute = max(score, key=score.get)

        
        profile_mapping = {
            'STR': 'FOR', 'CON': 'FOR',
            'DEX': 'DEX',
            'INT': 'INT', 'WIS': 'INT',
            'CHA': 'CHA'
        }
        target_profile = profile_mapping.get(winning_attribute, 'FOR')
        
        return score, target_profile

    def _get_matching_tip(self, system, target_profile):
        matching_tip = Tips.objects.filter(system=system, target_profile=target_profile).first()

        if matching_tip:
            return matching_tip, matching_tip.suggested_class, matching_tip.get_target_profile_display()
        
        return None, "Aventureiro", "Equilibrado"

    def _create_system_specs(self, system, character_base, score, specs_enviadas, chosen_race_id):
        import math
        system_name = system.name.lower()
        level = character_base.level

        try:
            race = Race.objects.get(id=chosen_race_id)
            character_base.race = race
        except Race.DoesNotExist:
            race = None

        rpg_class = character_base.suggested_class

        if system_name in ['d&d', 'dnd', 'd&d 5e', 'trpg','tormenta', 'tormenta rpg']:
            str_final = score['STR'] + 10 + (race.str_bonus if race else 0)
            dex_final = score['DEX'] + 10 + (race.dex_bonus if race else 0)
            con_final = score['CON'] + 10 + (race.con_bonus if race else 0)
            int_final = score['INT'] + 10 + (race.int_bonus if race else 0)
            wis_final = score['WIS'] + 10 + (race.wis_bonus if race else 0)
            cha_final = score['CHA'] + 10 + (race.cha_bonus if race else 0)

            con_mod = math.floor((con_final - 10) / 2)
            dex_mod = math.floor((dex_final - 10) / 2)

            if rpg_class:
                hp_lvl1 = rpg_class.base_hp_lvl1 + con_mod
                hp_next_lvls = (rpg_class.hp_per_lvl_after + con_mod) * (level - 1)
                calculated_pvs = hp_lvl1 + hp_next_lvls
                if rpg_class in ['mago']:
                    int_mod = math.floor((int_final - 10) / 2)
                    pm_lvl1 = rpg_class.base_pm_lvl1 + int_mod
                    pm_next_lvls = (rpg_class.pm_per_lvl_after + int_mod) * (level - 1)
                    calculated_pms = pm_lvl1 + pm_next_lvls

            
            calculated_ca = 10 + dex_mod
            calculated_rd = 0

            DeDCharacterSpecs.objects.create(
                character=character_base,
                mana_points=specs_enviadas.get('mana_points', 0),
                strength=str_final,
                dextery=dex_final,
                constitution=con_final,
                intelligence=int_final,
                wisdom=wis_final,
                charisma=cha_final,
                mana_points=calculated_pms
            )
        elif system_name in ['ordem', 'ordem paranormal']:

            str_final = score['STR'] + 1 + (race.str_bonus if race else 0)
            agi_final = score['DEX'] + 1 + (race.dex_bonus if race else 0)  # DEX = Agilidade
            vig_final = score['CON'] + 1 + (race.con_bonus if race else 0)  # CON = Vigor
            int_final = score['INT'] + 1 + (race.int_bonus if race else 0)  # INT = Intelecto
            pre_final = score['CHA'] + 1 + (race.cha_bonus if race else 0)

            if rpg_class:
                hp_lvl1 = rpg_class.base_hp_lvl1 + vig_final
                hp_next_lvls = (rpg_class.hp_per_lvl_after + vig_final) * (level - 1)
                calculated_pvs = hp_lvl1 + hp_next_lvls
                calculated_pe = (rpg_class.hp_per_lvl_after // 4 + pre_final) * level
            
            calculated_ca = 10 + agi_final
            calculated_rd = 0

            OrdemCharacterSpecs.objects.create(
                character=character_base,
                strength=str_final,
                agility=agi_final,
                constitution=vig_final,
                intelligence=int_final,
                presence=pre_final,
                effort_points=calculated_pe,
                sanity=specs_enviadas.get('sanity', 20)
            )
        
        else:
            raise Exception(f"O sistema '{system.name}' não possui especificações de atributos configuradas.")
        
        character_base.pvs = calculated_pvs
        character_base.armor_class = calculated_ca
        character_base.damage_reduction = calculated_rd
        character_base.save()