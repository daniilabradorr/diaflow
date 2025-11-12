from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from .models import Alerta
from .serializers import AlertaSerializer


class AlertaViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AlertaSerializer

    def get_queryset(self):
        qs = Alerta.objects.filter(paciente__usuario=self.request.user).order_by(
            "-creada_en"
        )
        activas = self.request.query_params.get("activas")
        if activas is not None:
            val = str(activas).lower()
            if val in ("true", "1", "yes", "y"):
                qs = qs.filter(activa=True)
            elif val in ("false", "0", "no", "n"):
                qs = qs.filter(activa=False)
        return qs

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_queryset().get(
            pk=kwargs["pk"]
        )  # DE ESTA MANERA ASEGHURO PROPIEDAD
        activa = request.data.get("activa")
        if activa is not None:
            if isinstance(activa, str):
                activa = activa.lower() in ("true", "1", "yes", "y")
            instance.activa = bool(activa)
            if not instance.activa and instance.atendida_en is None:
                instance.atendida_en = timezone.now()
            instance.save(update_fields=["activa", "atendida_en"])
            return Response(
                self.get_serializer(instance).data, status=status.HTTP_200_OK
            )
        return super().partial_update(request, *args, **kwargs)
