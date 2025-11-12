from django.contrib import admin

from .models import Alerta


@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "tipo", "activa", "creada_en")
    list_filter = ("tipo", "activa")
