from django.contrib import admin

from .models import GlucosaRegistro


@admin.register(GlucosaRegistro)
class GlucosaRegistroAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "valor_mg_dl", "medido_en", "fuente")
    list_filter = ("fuente",)
    search_fields = ("paciente__nombre",)
