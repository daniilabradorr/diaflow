from django.db import models
from django.utils import timezone
from pacientes.models import Paciente


# modelo de comida
class Comida(models.Model):
    paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, related_name="comidas"
    )
    fecha = models.DateTimeField(default=timezone.now)
    carbohidratos_g = models.PositiveIntegerField(default=0)
    descripcion = models.CharField(max_length=255, blank=True)

    class Meta:
        # lo ordeno por fecha
        ordering = ["-fecha"]

    def __str__(self):
        return (
            f"comida {self.id} ({self.carbohidratos_g}g) - {self.fecha:%Y-%m-%d %H:%M}"
        )


# modelo de la dosis de insulina en la comida especifica
class DosisInsulina(models.Model):
    TIPO_BOLO = "bolo"  # insulina rapida
    TIPO_BASAL = "basal"  # insulina lenta/prolongada
    TIPO_CORR = "corr"  # Inuslina de correcion

    TIPO_CHOICES = [
        (TIPO_BOLO, "Bolo"),
        (TIPO_BASAL, "Basal"),
        (TIPO_CORR, "Correción"),
    ]

    paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, related_name="dosis"
    )
    fecha = models.DateTimeField(default=timezone.now)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    # Decimal para permitir 0.5U, 1.5U, etc. Rango validado en serializer (0–100)
    unidades = models.DecimalField(max_digits=5, decimal_places=1)
    comida = models.ForeignKey(
        Comida, on_delete=models.SET_NULL, null=True, blank=True, related_name="dosis"
    )
    notas = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-fecha"]

    def __str__(self):
        return (
            f"Dosis {self.id} {self.tipo} {self.unidades}U — "
            f"{self.fecha:%Y-%m-%d %H:%M}"
        )
