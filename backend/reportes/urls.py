from django.urls import path

from .views import GlucosaResumenView, InventarioResumenView

urlpatterns = [
    path(
        "glucosa_resumen/",
        GlucosaResumenView.as_view(),
        name="reportes_glucosa_resumen",
    ),
    path(
        "inventario_resumen/",
        InventarioResumenView.as_view(),
        name="reportes_inventario_resumen",
    ),
]
