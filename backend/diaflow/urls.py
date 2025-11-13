from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from alertas.views import AlertaViewSet
from comidas.views import ComidaViewSet, DosisInsulinaViewSet
from glucosa.views import GlucosaRegistroViewSet
from insumos.views import InsumoViewSet
from kits.views import KitViewSet
from pacientes.views import PacienteViewSet

router = DefaultRouter()
router.register(r"glucemias", GlucosaRegistroViewSet, basename="glucosa")
router.register(r"insumos", InsumoViewSet, basename="insumo")
router.register(r"alertas", AlertaViewSet, basename="alerta")
router.register("comidas", ComidaViewSet, basename="comidas")
router.register("dosis", DosisInsulinaViewSet, basename="dosis")
router.register(r"kits", KitViewSet, basename="kits")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Core
    path("", include("core.urls")),

    # Rutas públicas de QR de kits (sin auth)
    path("", include("kits.urls_public")),

    # Autenticación (JWT)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Paciente (endpoints especiales)
    path("api/paciente/me/", PacienteViewSet.as_view({"get": "me"}), name="paciente_me"),
    path(
        "api/paciente/update_me/",
        PacienteViewSet.as_view({"put": "update_me", "patch": "update_me"}),
        name="paciente_update_me",
    ),

    # API REST principal
    path("api/", include(router.urls)),

    # Reportes
    path("api/reportes/", include("reportes.urls")),

    # Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
