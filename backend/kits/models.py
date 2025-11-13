import secrets

from django.conf import settings
from django.db import models


# funcion para obtener el token
def gen_token():
    # 22-24 chars URL-safe
    return secrets.token_urlsafe(18)


# modelo del kit
class Kit(models.Model):
    paciente = models.ForeignKey(
        "pacientes.Paciente", on_delete=models.CASCADE, related_name="kits"
    )
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, default="")
    token_publico = models.CharField(max_length=64, unique=True, default=gen_token)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.nombre} ({self.paciente_id})"


# modelo de los elemnentos del kit
class ElementoKit(models.Model):
    kit = models.ForeignKey(Kit, on_delete=models.CASCADE, related_name="elementos")
    etiqueta = models.CharField(max_length=120)
    cantidad_requerida = models.PositiveIntegerField(default=1)
    unidad = models.CharField(max_length=16, default="u")

    class Meta:
        unique_together = [("kit", "etiqueta")]
        ordering = ["id"]

    def __str__(self):
        return f"{self.etiqueta} x{self.cantidad_requerida}{self.unidad}"


# modelo de verificacion del kit
class VerificacionKit(models.Model):
    ORIGENES = (("privado", "privado"), ("qr", "qr"))

    kit = models.ForeignKey(
        Kit, on_delete=models.CASCADE, related_name="verificaciones"
    )
    origen = models.CharField(max_length=10, choices=ORIGENES, default="qr")
    verificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
    resultado_ok = models.BooleanField(default=False)
    faltantes_json = models.JSONField(default=dict)  # {"Tiras": 1, "Agujas": 2}
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]
