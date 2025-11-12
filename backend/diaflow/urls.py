from alertas.views import AlertaViewSet
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from glucosa.views import GlucosaRegistroViewSet
from insumos.views import InsumoViewSet
from pacientes.views import PacienteViewSet
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# el router
router = DefaultRouter()
router.register(r"glucemias", GlucosaRegistroViewSet, basename="glucosa")
router.register(r"insumos", InsumoViewSet, basename="insumo")
router.register(r"alertas", AlertaViewSet, basename="alerta")

urlpatterns = [
    path("admin/", admin.site.urls),
    # Core
    path("", include("core.urls")),
    # autenticacion(JWT)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Paciente
    path(
        "api/paciente/me/", PacienteViewSet.as_view({"get": "me"}), name="paciente_me"
    ),
    path(
        "api/paciente/update_me/",
        PacienteViewSet.as_view({"put": "update_me", "patch": "update_me"}),
        name="paciente_update_me",
    ),
    # la api rest
    path("api/", include(router.urls)),
    # Schema y los Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
