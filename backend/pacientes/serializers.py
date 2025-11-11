from rest_framework import serializers

from .models import Paciente


# serializer del modelo PACIENTE
class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            "id",
            "nombre",
            "fecha_nacimiento",
            "tipo_diabetes",
            "objetivo_glucosa_min",
            "objetivo_glucosa_max",
        ]
