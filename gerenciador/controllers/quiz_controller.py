from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from ..models import Question
from serializers.questions_serializers import QuestionSerializer

"""
    Controlador responsável por entregar as perguntas e alternativas do quiz.
"""
class QuizViewSet(viewsets.ViewSet):
    
    """
        GET /api/quiz/
    """
    def list(self, request):
        
        queryset = Question.objects.all()
        serializer = QuestionSerializer(queryset, many=True)
        return Response(serializer.data)


    """
        GET /api/quiz/by-system/<system_id>/
        Filtragem inteligente: Retorna apenas as perguntas de um sistema específico
        (Ex: Apenas perguntas do sistema de ID 2 - Ordem Paranormal).
    """
    @action(detail=False, methods=['get'], url_path='by-system/(?P<system_id>[0-9]+)')
    def by_system(self, request, system_id=None):
        
        try:
            queryset = Question.objects.filter(system_id=system_id)
            
            if not queryset.exists():
                return Response(
                    {"message": "Nenhuma pergunta encontrada para este sistema de RPG."}, 
                    status=404
                )
                
            serializer = QuestionSerializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({"error": f"Erro ao filtrar quiz: {str(e)}"}, status=400)