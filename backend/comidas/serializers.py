from decimal import Decimal, InvalidOperation

from rest_framework import serializers

from .models import Comida, DosisInsulina


class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ["id", "fecha", "carbohidratos_g", "descripcion"]
        read_only_fields = ["id"]

    def validate_carbohidratos_g(self, value):
        if value < 0:
            raise serializers.ValidationError("Los carbohidratos deben ser >= 0.")
        return value


class DosisInsulinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DosisInsulina
        fields = ["id", "fecha", "tipo", "unidades", "comida", "notas"]
        read_only_fields = ["id"]

    def validate_tipo(self, value):
        value = (value or "").lower()
        tipos = {c[0] for c in DosisInsulina.TIPO_CHOICES}
        if value not in tipos:
            raise serializers.ValidationError(
                f"Tipo inválido. Use uno de: {', '.join(sorted(tipos))}."
            )
        return value

    def validate_unidades(self, value):
        # Aceptar str/num → Decimal
        try:
            dec = Decimal(value)
        except (InvalidOperation, TypeError):
            raise serializers.ValidationError("Unidades inválidas.")
        if dec < Decimal("0") or dec > Decimal("100"):
            raise serializers.ValidationError("Las unidades deben estar entre 0 y 100.")
        # Normaliza a 1 decimal
        return dec.quantize(Decimal("0.1"))

    def validate(self, attrs):
        # Si hay comida, debe pertenecer al mismo paciente
        comida = attrs.get("comida")
        request = self.context.get("request")
        if comida and request:
            paciente = getattr(getattr(request.user, "paciente", None), "id", None)
            if not paciente or comida.paciente_id != paciente:
                raise serializers.ValidationError(
                    "La comida no pertenece a este paciente."
                )
        return attrs
