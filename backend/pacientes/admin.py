from django.contrib import admin

from .models import Paciente


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "usuario",
        "nombre",
        "tipo_diabetes",
        "objetivo_glucosa_min",
        "objetivo_glucosa_max",
        "creado_en",
    )
    search_fields = ("nombre", "usuario__username")
