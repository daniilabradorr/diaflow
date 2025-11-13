from drf_spectacular.utils import OpenApiExample, extend_schema
from pacientes.models import Paciente
from rest_framework import decorators, permissions, response, status, viewsets

from .models import Insumo, MovimientoInsumo
from .serializers import InsumoSerializer, MovimientoSerializer


@extend_schema(
    tags=["Insumos"],
    examples=[
        OpenApiExample(
            "Crear insumo",
            value={
                "nombre": "Tiras",
                "tipo": "TIR",
                "stock_actual": 0,
                "stock_minimo": 2,
                "unidad": "u",
            },
            request_only=True,
        )
    ],
)
class InsumoViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InsumoSerializer

    def get_queryset(self):
        return Insumo.objects.filter(paciente__usuario=self.request.user).order_by("id")

    def _get_or_create_paciente(self, user):
        paciente, _ = Paciente.objects.get_or_create(
            usuario=user, defaults={"nombre": user.username}
        )
        return paciente

    def perform_create(self, serializer):
        serializer.save(paciente=self._get_or_create_paciente(self.request.user))

    @decorators.action(detail=True, methods=["get", "post"], url_path="movimientos")
    def movimientos(self, request, pk=None):
        insumo = self.get_queryset().get(pk=pk)
        if request.method.lower() == "get":
            qs = insumo.movimientos.all()
            ser = MovimientoSerializer(qs, many=True)
            return response.Response(ser.data)
        ser = MovimientoSerializer(data=request.data, context={"insumo": insumo})
        ser.is_valid(raise_exception=True)
        mov = MovimientoInsumo.objects.create(insumo=insumo, **ser.validated_data)
        return response.Response(
            MovimientoSerializer(mov).data, status=status.HTTP_201_CREATED
        )
