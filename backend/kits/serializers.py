from rest_framework import serializers

from .models import ElementoKit, Kit, VerificacionKit


# serializo el kitsus elementos y su verificacion
class ElementoKitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElementoKit
        fields = ("id", "etiqueta", "cantidad_requerida", "unidad")


class KitSerializer(serializers.ModelSerializer):
    elementos = ElementoKitSerializer(many=True, read_only=True)
    token_publico = serializers.CharField(read_only=True)

    class Meta:
        model = Kit
        fields = ("id", "nombre", "descripcion", "activo", "token_publico", "elementos")


class VerificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificacionKit
        fields = ("id", "origen", "resultado_ok", "faltantes_json", "creado_en")
