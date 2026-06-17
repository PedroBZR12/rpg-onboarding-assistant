from rest_framework import serializers
from models import Question
from serializers.options_serializers import OptionSerializer

class QuestionSerializer(serializers.ModelSerializer):
    
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'statement', 'options']