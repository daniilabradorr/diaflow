from datetime import datetime, time

from django.utils import timezone
from django.utils.dateparse import parse_date
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import permissions, viewsets

from .models import Comida, DosisInsulina
from .serializers import ComidaSerializer, DosisInsulinaSerializer


def _scoped_paciente_qs(request, qs):
    """Restringe por el paciente del usuario autenticado."""
    paciente = getattr(request.user, "paciente", None)
    if paciente is None:
        return qs.none()
    return qs.filter(paciente=paciente)


def _filter_rango_fechas(request, qs, field="fecha"):
    """Filtra por ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD (inclusive)."""
    desde = request.query_params.get("desde")
    hasta = request.query_params.get("hasta")

    if desde:
        d = parse_date(desde)
        if d:
            dt = timezone.make_aware(datetime.combine(d, time.min))
            qs = qs.filter(**{f"{field}__gte": dt})

    if hasta:
        d = parse_date(hasta)
        if d:
            dt = timezone.make_aware(datetime.combine(d, time.max))
            qs = qs.filter(**{f"{field}__lte": dt})

    return qs


@extend_schema(tags=["Comidas"])
class ComidaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ComidaSerializer
    queryset = Comida.objects.none()  # p``ara el content check de DRF

    def get_queryset(self):
        qs = _scoped_paciente_qs(self.request, Comida.objects.all()).order_by("-fecha")
        return _filter_rango_fechas(self.request, qs, field="fecha")

    def perform_create(self, serializer):
        paciente = getattr(self.request.user, "paciente", None)
        serializer.save(paciente=paciente)


@extend_schema(
    tags=["Dosis"],
    parameters=[
        OpenApiParameter(
            name="tipo", description="bolo|basal|corr", required=False, type=str
        ),
        OpenApiParameter(
            name="desde", description="YYYY-MM-DD", required=False, type=str
        ),
        OpenApiParameter(
            name="hasta", description="YYYY-MM-DD", required=False, type=str
        ),
    ],
)
class DosisInsulinaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DosisInsulinaSerializer
    queryset = DosisInsulina.objects.none()

    def get_queryset(self):
        qs = _scoped_paciente_qs(
            self.request, DosisInsulina.objects.select_related("comida")
        ).order_by("-fecha")
        # filtro por tipo
        tipo = self.request.query_params.get("tipo")
        if tipo:
            qs = qs.filter(tipo=tipo.lower())
        # rango defechas
        qs = _filter_rango_fechas(self.request, qs, field="fecha")
        return qs

    def perform_create(self, serializer):
        paciente = getattr(self.request.user, "paciente", None)
        serializer.save(paciente=paciente)
