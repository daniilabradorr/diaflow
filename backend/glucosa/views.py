from django.utils.dateparse import parse_datetime
from rest_framework import permissions, viewsets

from .models import GlucosaRegistro
from .serializers import GlucosaRegistroSerializer


# el view set del refgtistro de la glucosa
class GlucosaRegistroViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GlucosaRegistroSerializer

    def get_queryset(self):
        qs = GlucosaRegistro.objects.filter(
            paciente__usuario=self.request.user
        ).order_by("-medido_en")
        # Filtros ?desde=&hasta=
        d = self.request.query_params.get("desde")
        h = self.request.query_params.get("hasta")
        if d:
            d_dt = parse_datetime(d) or d
            qs = qs.filter(medido_en__gte=d_dt)
        if h:
            h_dt = parse_datetime(h) or h
            qs = qs.filter(medido_en__lte=h_dt)
        return qs

    def perform_create(self, serializer):
        paciente = self.request.user.paciente
        serializer.save(paciente=paciente)
