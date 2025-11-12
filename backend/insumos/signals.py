from alertas.models import Alerta
from django.db.models import F
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import MovimientoInsumo


@receiver(post_save, sender=MovimientoInsumo)
def actualizar_stock_y_alerta(sender, instance, created, **kwargs):
    if not created:
        return

    insumo = instance.insumo
    # Sumar/restar de forma atómica
    type(insumo).objects.filter(pk=insumo.pk).update(
        stock_actual=F("stock_actual") + instance.cantidad
    )
    insumo.refresh_from_db(
        fields=["stock_actual", "stock_minimo", "paciente_id", "nombre", "unidad"]
    )

    if insumo.stock_actual < insumo.stock_minimo:
        Alerta.objects.create(
            paciente=insumo.paciente,
            tipo="stock_bajo",
            mensaje=(
                f"Stock bajo en {insumo.nombre}: {insumo.stock_actual}{insumo.unidad} "
                f"(<{insumo.stock_minimo})"
            ),
        )
