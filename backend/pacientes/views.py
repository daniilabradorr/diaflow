from rest_framework import decorators, permissions, response, status, viewsets

from .models import Paciente
from .serializers import PacienteSerializer


# vista del set de paciente
class PacienteViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PacienteSerializer

    # Api del paciente para el get
    @decorators.action(detail=False, methods=["get"])
    def me(self, request):
        paciente, _ = Paciente.objects.get_or_create(
            usuario=request.user,
            defaults={"nombre": request.user.username},
        )
        return response.Response(self.get_serializer(paciente).data)

    # api del paciente para la actualizacion con put y pacth
    @decorators.action(detail=False, methods=["put", "patch"])
    def update_me(self, request):
        paciente, _ = Paciente.objects.get_or_create(
            usuario=request.user,
            defaults={"nombre": request.user.username},
        )
        partial = request.method.lower() == "patch"
        ser = self.get_serializer(paciente, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        ser.save()
        return response.Response(ser.data, status=status.HTTP_200_OK)
