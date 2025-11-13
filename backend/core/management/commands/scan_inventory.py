# para que si una señal falló re-crea alertas stock_bajo coherentes
from alertas.models import Alerta
from django.core.management.base import BaseCommand
from insumos.models import Insumo


class Command(BaseCommand):
    help = "Escanea inventario y asegura alertas de stock_bajo activas (idempotente)."

    def handle(self, *args, **opts):
        creadas = 0
        for ins in Insumo.objects.select_related("paciente").all():
            if ins.stock_actual < ins.stock_minimo:
                if not Alerta.objects.filter(
                    paciente=ins.paciente,
                    tipo="stock_bajo",
                    activa=True,
                    mensaje__icontains=ins.nombre,
                ).exists():
                    Alerta.objects.create(
                        paciente=ins.paciente,
                        tipo="stock_bajo",
                        mensake=f"Stock bajo de {ins.nombre}",
                        detalle=f"{ins.stock_actual} < mínimo {ins.stock_minimo}",
                        activa=True,
                    )
                    creadas += 1
        self.stdout.write(
            self.style.SUCCESS(f"Scan inventario OK. Alertas creadas: {creadas}")
        )
