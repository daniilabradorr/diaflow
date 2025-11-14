from datetime import datetime, timedelta
from typing import Optional

from django.db.models import Avg, Count, F, Max, Min
from django.utils import timezone
from glucosa.models import GlucosaRegistro
from insumos.models import Insumo
from pacientes.models import Paciente
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


# funcion del paciente para obtener
def _paciente(request) -> Paciente:
    return request.user.paciente


# la funion para pasear las fechas a mi gusto
def _parse_yyyy_mm_dd(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    return datetime.strptime(s, "%Y-%m-%d").replace(
        tzinfo=timezone.get_current_timezone()
    )


# vista del resumen de la fglucosa
class GlucosaResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        p = _paciente(request)

        # fechas por defecto ddejo el default en los ultimos 30 dias
        hoy = timezone.localdate()
        desde = _parse_yyyy_mm_dd(
            request.query_params.get("desde")
        ) or datetime.combine(
            hoy - timedelta(days=30),
            datetime.min.time(),
            tzinfo=timezone.get_current_timezone(),
        )
        hasta = _parse_yyyy_mm_dd(
            request.query_params.get("hasta")
        ) or datetime.combine(
            hoy, datetime.max.time(), tzinfo=timezone.get_current_timezone()
        )

        # objetivos: query → paciente → defaults
        obj_min_q = request.query_params.get("objetivo_min")
        obj_max_q = request.query_params.get("objetivo_max")
        objetivo_min = (
            float(obj_min_q) if obj_min_q else float(getattr(p, "objetivo_min", 70))
        )
        objetivo_max = (
            float(obj_max_q) if obj_max_q else float(getattr(p, "objetivo_max", 180))
        )

        # CORRECCIÓN 1: 'fecha' cambiado a 'medido_en'
        qs = GlucosaRegistro.objects.filter(
            paciente=p, medido_en__gte=desde, medido_en__lte=hasta
        )

        # gagregados
        agg = qs.aggregate(
            # CORRECCIÓN 2: 'valor' cambiado a 'valor_mg_dl'
            promedio=Avg("valor_mg_dl"),
            minimo=Min("valor_mg_dl"),
            maximo=Max("valor_mg_dl"),
            total=Count("id"),
        )
        total = int(agg["total"] or 0)

        # % en rango
        if total == 0:
            en_rango_pct = None
        else:
            # CORRECCIÓN 2: 'valor' cambiado a 'valor_mg_dl'
            en_rango = qs.filter(
                valor_mg_dl__gte=objetivo_min, valor_mg_dl__lte=objetivo_max
            ).count()
            en_rango_pct = round(100.0 * en_rango / total, 2)

        data = {
            "promedio": (
                round(float(agg["promedio"]), 2)
                if agg["promedio"] is not None
                else None
            ),
            "min": agg["minimo"],
            "max": agg["maximo"],
            "en_rango_pct": en_rango_pct,
            "total": total,
            "desde": desde.date().isoformat(),
            "hasta": hasta.date().isoformat(),
            "objetivo_min": objetivo_min,
            "objetivo_max": objetivo_max,
        }
        return Response(data)


# vista del resumen del inventaruio del paciente
class InventarioResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        p = _paciente(request)
        bajos = (
            Insumo.objects.filter(paciente=p, stock_actual__lt=F("stock_minimo"))
            .values("id", "nombre", "tipo", "stock_actual", "stock_minimo", "unidad")
            .order_by("nombre")
        )

        # totales por tipo (de todos los insumos del paciente)
        # CORRECCIÓN 3: ELIMINADA la importación local de F (estaba en la línea 86)

        totales = (
            Insumo.objects.filter(paciente=p)
            .values("tipo")
            .annotate(c=Count("id"))
            .order_by("tipo")
        )

        return Response(
            {
                "bajo_minimo": list(bajos),
                "totales_por_tipo": list(totales),
            }
        )
