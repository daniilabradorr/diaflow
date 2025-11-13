from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from glucosa.models import GlucosaRegistro
from insumos.models import Insumo
from rest_framework.test import APITestCase


class ReportesAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("demo", password="demo1234")
        r = self.client.post(
            "/api/auth/token/",
            {"username": "demo", "password": "demo1234"},
            format="json",
        )
        assert r.status_code == 200, r.content
        token = r.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        # fuerza creación/obtención de paciente
        self.client.get("/api/paciente/me/")
        self.paciente = self.user.paciente

    # helpers
    def _g(self, valor, dias_offset=0):
        # *** CORRECCIÓN APLICADA AQUÍ ***
        GlucosaRegistro.objects.create(
            paciente=self.paciente,
            medido_en=timezone.now() + timedelta(days=dias_offset),
            valor_mg_dl=valor,  # <--- CAMBIO: de 'valor' a 'valor_mg_dl'
        )

    def _insumo(self, nombre, tipo, stock_actual, stock_minimo, unidad="u"):
        Insumo.objects.create(
            paciente=self.paciente,
            nombre=nombre,
            tipo=tipo,
            stock_actual=stock_actual,
            stock_minimo=stock_minimo,
            unidad=unidad,
        )

    # --- Glucosa
    def test_glucosa_resumen_sin_datos(self):
        r = self.client.get("/api/reportes/glucosa_resumen/")
        assert r.status_code == 200
        assert r.data["total"] == 0
        assert r.data["en_rango_pct"] is None

    def test_glucosa_resumen_en_rango(self):
        # valores: 50 (fuera), 100 (dentro), 200 (fuera)
        self._g(50)
        self._g(100)
        self._g(200)

        q = "/api/reportes/glucosa_resumen/?objetivo_min=70&objetivo_max=180"
        r = self.client.get(q)
        assert r.status_code == 200
        assert r.data["total"] == 3
        assert r.data["min"] == 50
        assert r.data["max"] == 200
        # promedio 116.67 → redondeado a 2
        assert abs(r.data["promedio"] - 116.67) < 0.01
        assert abs(r.data["en_rango_pct"] - 33.33) < 0.01

    # --- Inventario
    def test_inventario_resumen_bajo_minimo(self):
        # 2 bajos, 1 OK
        self._insumo("Tiras", "TIR", 1, 3)
        self._insumo("Agujas", "AGU", 0, 1)
        self._insumo("Insulina", "INS", 5, 2)

        r = self.client.get("/api/reportes/inventario_resumen/")
        assert r.status_code == 200
        bajos = r.data["bajo_minimo"]
        assert len(bajos) == 2
        tipos = {t["tipo"]: t["c"] for t in r.data["totales_por_tipo"]}
        # solo compruebo que existan al menos los tipos que metimos
        for t in ["TIR", "AGU", "INS"]:
            assert t in tipos
