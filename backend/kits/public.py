from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Kit, VerificacionKit
from .views import QRAnonRateThrottle  # 10/min por IP


class PublicKitView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [QRAnonRateThrottle]

    def get(self, request, token):
        kit = get_object_or_404(Kit, token_publico=token, activo=True)
        elementos = list(
            kit.elementos.values("etiqueta", "cantidad_requerida", "unidad")
        )
        return Response(
            {
                "kit": {"nombre": kit.nombre, "descripcion": kit.descripcion},
                "elementos": elementos,
            }
        )


class PublicKitVerifyView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [QRAnonRateThrottle]

    def post(self, request, token):
        """
        Body (ejemplo):
        {
          "items": [
            {"etiqueta": "Tiras", "cantidad": 2},
            {"etiqueta": "Lancetas", "cantidad": 1}
          ]
        }
        """
        kit = get_object_or_404(Kit, token_publico=token, activo=True)

        payload = request.data or {}
        items = payload.get("items", [])

        # Suma cantidades por etiqueta (maneja líneas repetidas y valores no válidos)
        provistos = {}
        for i in items:
            etiqueta = i.get("etiqueta")
            if not etiqueta:
                continue
            try:
                cantidad = int(i.get("cantidad", 0))
            except (TypeError, ValueError):
                cantidad = 0
            if cantidad < 0:
                cantidad = 0
            provistos[etiqueta] = provistos.get(etiqueta, 0) + cantidad

        # Calcula faltantes
        faltantes = {}
        for e in kit.elementos.all():
            req = e.cantidad_requerida
            got = provistos.get(e.etiqueta, 0)
            falt = max(0, req - got)
            if falt:
                faltantes[e.etiqueta] = falt

        ok = not faltantes

        VerificacionKit.objects.create(
            kit=kit,
            origen="qr",
            resultado_ok=ok,
            faltantes_json=faltantes,
        )

        return Response(
            {"resultado_ok": ok, "faltantes": faltantes},
            status=status.HTTP_200_OK,
        )
