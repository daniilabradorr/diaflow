import importlib

from django.apps import AppConfig


class InsumosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "insumos"

    def ready(self):
        # cargo las señales al iniciar la app, sin gatillar F401
        importlib.import_module("insumos.signals")
