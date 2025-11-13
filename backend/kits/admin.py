from django.contrib import admin

from .models import ElementoKit, Kit, VerificacionKit


class ElementoInline(admin.TabularInline):
    model = ElementoKit
    extra = 0


# registro los kits y sus verificaciones
@admin.register(Kit)
class KitAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "nombre", "activo", "token_publico")
    search_fields = ("nombre", "token_publico")
    inlines = [ElementoInline]


@admin.register(VerificacionKit)
class VerificacionAdmin(admin.ModelAdmin):
    list_display = ("id", "kit", "origen", "resultado_ok", "creado_en")
