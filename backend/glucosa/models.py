from django.db import models


# modelo del registro de la glucosa del paciente
class GlucosaRegistro(models.Model):
    paciente = models.ForeignKey(
        "pacientes.Paciente", on_delete=models.CASCADE, related_name="glucemias"
    )
    valor_mg_dl = models.PositiveSmallIntegerField()
    medido_en = models.DateTimeField()
    fuente = models.CharField(
        max_length=20, default="manual"
    )  # manual(sangre), sensor, etc
    notas = models.CharField(max_length=255, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-medido_en"]  # ordenado
