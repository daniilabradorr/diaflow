import base64
import io

import qrcode
from django.urls import reverse
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from .models import ElementoKit, Kit
from .serializers import ElementoKitSerializer, KitSerializer, VerificacionSerializer


# -------- Throttle público QR (lo usa kits/public.py) --------
class QRAnonRateThrottle(SimpleRateThrottle):
    scope = "qr"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


# -------- Helpers --------
def _paciente(request):
    return request.user.paciente


# -------- ViewSet privado --------
class KitViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = KitSerializer

    def get_queryset(self):
        return Kit.objects.filter(paciente=_paciente(self.request)).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(paciente=_paciente(self.request))

    @action(detail=True, methods=["post"])
    def elementos(self, request, pk=None):
        """
        Bulk upsert de elementos. Cuerpo:
        {"items":[{"etiqueta":"Tiras","cantidad_requerida":2,"unidad":"u"}, ...]}
        """
        kit = self.get_object()
        items = request.data.get("items", [])
        if not isinstance(items, list):
            return Response({"detail": "items debe ser lista"}, status=400)

        # MVP: reemplazo sencillo (borro y creo)
        kit.elementos.all().delete()
        objs = [
            ElementoKit(kit=kit, **{**it, "unidad": it.get("unidad", "u")})
            for it in items
        ]
        if objs:
            ElementoKit.objects.bulk_create(objs)

        return Response(
            ElementoKitSerializer(kit.elementos.all(), many=True).data, status=200
        )

    @action(detail=True, methods=["get"])
    def verificaciones(self, request, pk=None):
        kit = self.get_object()
        qs = kit.verificaciones.all().order_by("-id")[:100]
        return Response(VerificacionSerializer(qs, many=True).data)

    @action(detail=True, methods=["post"])
    def rotate_token(self, request, pk=None):
        kit = self.get_object()
        kit.token_publico = Kit._meta.get_field("token_publico").default()
        kit.save(update_fields=["token_publico"])
        return Response({"token_publico": kit.token_publico})

    @action(detail=True, methods=["get"])
    def qr(self, request, pk=None):
        """
        Devuelve JSON con datos del QR:
        - token
        - url pública (sin auth)
        - png (base64 crudo)
        - data_url (data:image/png;base64,...)
        """
        kit = self.get_object()

        # URL pública (ruta anónima definida en kits/urls_public.py)
        public_url = request.build_absolute_uri(
            reverse("kits_public_get", kwargs={"token": kit.token_publico})
        )

        # Generar PNG del QR -> base64
        img = qrcode.make(public_url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

        return Response(
            {
                "token": kit.token_publico,
                "url": public_url,
                "png": png_b64,
                "data_url": f"data:image/png;base64,{png_b64}",
            },
            status=status.HTTP_200_OK,
        )
