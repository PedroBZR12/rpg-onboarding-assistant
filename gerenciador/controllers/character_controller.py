from rest_framework import viewsets, status
from rest_framework.response import Response
from ..models import Character, DeDCharacterSpecs, OrdemCharacterSpecs, System

class CharacterViewSet(viewsets.ViewSet):
    

    def create(self, request):
        
        data = request.data

        try:
            
            system_name = data.get('system_name')
            system = System.objects.get(name=system_name)

            
            character_base = Character.objects.create(
                system=system,
                name=data.get('name'),
                age=data.get('age'),
                movement=data.get('movement'),
                size=data.get('size'),
                level=data.get('level', 1),
                pvs=data.get('pvs'),
                armor_class=data.get('armor_class'),
                damage_reduction=data.get('damage_reduction', 0),
                suggested_class=data.get('suggested_class'),
                generated_profile=data.get('generated_profile')
            )

            specs_enviadas = data.get('specs', {})

            if system.name.lower() in ['d&d', 'dnd', 'd&d 5e']:
                DeDCharacterSpecs.objects.create(
                    character=character_base,
                    mana_points=specs_enviadas.get('mana_points', 0),
                    strength=specs_enviadas.get('strength', 10),
                    dextery=specs_enviadas.get('dextery', 10),
                    constitution=specs_enviadas.get('constitution', 10),
                    intelligence=specs_enviadas.get('intelligence', 10),
                    wisdom=specs_enviadas.get('wisdom', 10),
                    charisma=specs_enviadas.get('charisma', 10)
                )
                perfil_retorno = "D&D Specs criadas com sucesso."

            elif system.name.lower() in ['ordem', 'ordem paranormal']:
                OrdemCharacterSpecs.objects.create(
                    character=character_base,
                    strength=specs_enviadas.get('strength', 1) ,
                    agility=specs_enviadas.get('agility', 1),
                    constitution=specs_enviadas.get('constitution', 1),
                    intelligence=specs_enviadas.get('intelligence', 1),
                    presence=specs_enviadas.get('presence', 1),
                    effort_points=specs_enviadas.get('effort_points', 0),
                    sanity=specs_enviadas.get('sanity')
                )
                perfil_retorno = "Ordem Paranormal Specs criadas com sucesso."
            
            else:
                
                character_base.delete()
                return Response(
                    {"error": f"O sistema '{system.name}' não possui especificações configuradas."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response({
                "message": "Personagem gerado com sucesso!",
                "character_id": character_base.id,
                "name": character_base.name,
                "system": system.name,
                "detail": perfil_retorno
            }, status=status.HTTP_201_CREATED)

        except System.DoesNotExist:
            return Response({"error": "Sistema de RPG não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Falha ao criar personagem: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)