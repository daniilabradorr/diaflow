import importlib

from django.apps import AppConfig


class PacientesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pacientes"

    def ready(self):
        importlib.import_module("pacientes.signals")
