from django.db import models


# modeo del insumo del paciente
class Insumo(models.Model):
    TIPOS = (
        ("INS", "Insulina"),
        ("TIR", "Tiras"),
        ("AGU", "Agujas"),
        ("SEN", "Sensor"),
        ("OTR", "Otro"),
    )

    paciente = models.ForeignKey(
        "pacientes.Paciente", on_delete=models.CASCADE, related_name="insumos"
    )
    nombre = models.CharField(max_length=120)
    tipo = models.CharField(max_length=3, choices=TIPOS)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    unidad = models.CharField(max_length=20, default="u")
    caduca_en = models.DateField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.stock_actual}{self.unidad})"


# modelo del movimiento del insumoi del paciente
class MovimientoInsumo(models.Model):
    MOTIVOS = (
        ("compra", "Compra"),
        ("uso", "Uso"),
        ("ajuste", "Ajuste"),
        ("caducidad", "Caducidad"),
    )

    insumo = models.ForeignKey(
        Insumo, on_delete=models.CASCADE, related_name="movimientos"
    )
    fecha = models.DateTimeField(auto_now_add=True)
    cantidad = models.IntegerField()  # +entrada / -salida
    motivo = models.CharField(max_length=20, choices=MOTIVOS, default="uso")
    nota = models.CharField(max_length=200, blank=True)

    # ordeno por fecha
    class Meta:
        ordering = ("-fecha",)
