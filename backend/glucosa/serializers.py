from rest_framework import serializers

from .models import GlucosaRegistro


# el serializer del registro de la glucosa del paciente
class GlucosaRegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlucosaRegistro
        fields = ["id", "valor_mg_dl", "medido_en", "fuente", "notas"]

    def validate_valor_mg_dl(self, v: int):
        if not 20 <= v <= 600:
            raise serializers.ValidationError("Valor fuera de rango (20-600 mg/dL).")
        return v
