from django.contrib.auth.models import User
from django.db import models


# modelo paciente
class Paciente(models.Model):
    TIPOS = [("T1", "Tipo 1"), ("T2", "Tipo 2"), ("G", "Gestacional"), ("O", "Otra")]
    usuario = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="paciente"
    )
    nombre = models.CharField(max_length=120)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    tipo_diabetes = models.CharField(max_length=2, choices=TIPOS, default="T1")
    objetivo_glucosa_min = models.PositiveSmallIntegerField(default=80)
    objetivo_glucosa_max = models.PositiveSmallIntegerField(default=140)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.nombre
