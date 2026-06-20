from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .controllers.character_controller import CharacterViewSet
from .controllers.quiz_controller import QuizViewSet

router = DefaultRouter()

router.register(r'characters', CharacterViewSet, basename='character')
router.register(r'quiz', QuizViewSet, basename='quiz')

urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]