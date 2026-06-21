from rest_framework import viewsets

from gerenciador.controllers.serializers.systems_serializers import SystemSerializer
from gerenciador.models import System


class SystemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exposes the available RPG systems and the data needed to start character creation.
    """

    queryset = System.objects.prefetch_related("races", "classes").all()
    serializer_class = SystemSerializer
