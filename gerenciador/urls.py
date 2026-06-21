from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from controllers.character_controller import CharacterViewSet
from controllers.quiz_controller import QuizViewSet
from controllers.system_controller import SystemViewSet

router = DefaultRouter()
router.register(r"characters", CharacterViewSet, basename="character")
router.register(r"quiz", QuizViewSet, basename="quiz")
router.register(r"systems", SystemViewSet, basename="system")

urlpatterns = [
    path("", TemplateView.as_view(template_name="ficha.html"), name="home"),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]