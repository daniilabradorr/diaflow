from django.contrib import admin

from .models import Insumo, MovimientoInsumo


@admin.register(Insumo)
class InsumoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "paciente",
        "nombre",
        "tipo",
        "stock_actual",
        "stock_minimo",
        "unidad",
    )
    list_filter = ("tipo",)


@admin.register(MovimientoInsumo)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ("id", "insumo", "cantidad", "motivo", "fecha")
    list_filter = ("motivo",)
