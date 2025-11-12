from rest_framework import serializers

from .models import Insumo, MovimientoInsumo


class InsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumo
        fields = [
            "id",
            "nombre",
            "tipo",
            "stock_actual",
            "stock_minimo",
            "unidad",
            "caduca_en",
            "creado_en",
        ]
        read_only_fields = ["creado_en"]


class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoInsumo
        fields = ["id", "cantidad", "motivo", "nota", "fecha"]
        read_only_fields = ["fecha"]

    def validate(self, data):
        insumo = self.context["insumo"]
        if insumo.stock_actual + data["cantidad"] < 0:
            raise serializers.ValidationError("El stock no puede quedar en negativo.")
        return data
