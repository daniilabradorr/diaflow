import random
from datetime import timedelta

from alertas.models import Alerta
from comidas.models import Comida, DosisInsulina
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone
from glucosa.models import GlucosaRegistro
from insumos.models import Insumo, MovimientoInsumo
from kits.models import ElementoKit, Kit, VerificacionKit
from pacientes.models import Paciente


class Command(BaseCommand):
    help = "Crea datos demo de manera idempotente"

    def handle(self, *args, **opts):
        user, _ = User.objects.get_or_create(
            username="demo", defaults={"email": "demo@example.com"}
        )
        user.set_password("demo1234")
        user.save()

        paciente, _ = Paciente.objects.get_or_create(usuario=user)

        # Glucosa (últimos 7 días, 4 lecturas/día)
        base = timezone.now().replace(minute=0, second=0, microsecond=0)
        for i in range(0, 7 * 4):
            ts = base - timedelta(hours=i * 6)
            GlucosaRegistro.objects.get_or_create(
                paciente=paciente,
                medido_en=ts,
                defaults={"valor_mg_dl": random.randint(70, 220), "notas": ""},
            )

        # Insumos + movimientos (provoca posible alerta)
        tiras, _ = Insumo.objects.get_or_create(
            paciente=paciente,
            nombre="Tiras",
            tipo="TIR",
            defaults={"stock_actual": 2, "stock_minimo": 5, "unidad": "u"},
        )
        if not MovimientoInsumo.objects.filter(insumo=tiras).exists():
            MovimientoInsumo.objects.create(insumo=tiras, cantidad=+5, motivo="compra")
            MovimientoInsumo.objects.create(insumo=tiras, cantidad=-4, motivo="uso")

        # Comidas & dosis
        hoy = timezone.now()
        c, _ = Comida.objects.get_or_create(
            paciente=paciente,
            fecha=hoy - timedelta(hours=2),
            defaults={"carbohidratos_g": 60, "descripcion": "Comida demo"},
        )
        DosisInsulina.objects.get_or_create(
            paciente=paciente,
            fecha=hoy - timedelta(hours=1),
            defaults={"tipo": "bolo", "unidades": "4.0", "comida": c},
        )

        # Kit + elementos + verificación
        kit, _ = Kit.objects.get_or_create(
            paciente=paciente, nombre="Kit colegio", defaults={"descripcion": "Mochila"}
        )
        if not kit.elementos.exists():
            ElementoKit.objects.bulk_create(
                [
                    ElementoKit(
                        kit=kit, etiqueta="Tiras", cantidad_requerida=5, unidad="u"
                    ),
                    ElementoKit(
                        kit=kit, etiqueta="Lancetas", cantidad_requerida=3, unidad="u"
                    ),
                    ElementoKit(
                        kit=kit, etiqueta="Zumo", cantidad_requerida=1, unidad="ud"
                    ),
                ]
            )
        if not kit.verificaciones.exists():
            VerificacionKit.objects.create(
                kit=kit,
                origen="privado",
                resultado_ok=False,
                faltantes_json={"Tiras": 2},
            )

        # Alerta stock_bajo si aplica
        if (
            tiras.stock_actual < tiras.stock_minimo
            and not Alerta.objects.filter(
                paciente=paciente, tipo="stock_bajo", activa=True
            ).exists()
        ):
            Alerta.objects.create(
                paciente=paciente,
                tipo="stock_bajo",
                titulo="Stock bajo de Tiras",
                detalle="Por debajo del mínimo",
                activa=True,
            )

        self.stdout.write(self.style.SUCCESS("Seed demo ejecutado (idempotente)."))
