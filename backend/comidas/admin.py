from django.contrib import admin

from .models import Comida, DosisInsulina


@admin.register(Comida)
class ComidaAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "fecha", "carbohidratos_g", "descripcion")
    list_filter = ("fecha",)
    search_fields = ("descripcion",)


@admin.register(DosisInsulina)
class DosisInsulinaAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "fecha", "tipo", "unidades", "comida")
    list_filter = ("tipo", "fecha")
    search_fields = ("notas",)
