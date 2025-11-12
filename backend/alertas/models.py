from django.db import models


# modelo de la alerta
class Alerta(models.Model):
    TIPOS = (("stock_bajo", "Stock bajo"),)
    paciente = models.ForeignKey(
        "pacientes.Paciente", on_delete=models.CASCADE, related_name="alertas"
    )
    tipo = models.CharField(max_length=20, choices=TIPOS)
    mensaje = models.TextField()
    activa = models.BooleanField(default=True)
    creada_en = models.DateTimeField(auto_now_add=True)
    atendida_en = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.get_tipo_display()} — {self.paciente}"
