from django.contrib.auth.models import User
from rest_framework.test import APITestCase


def _as_list(data):
    """
    Normaliza la respuesta para poder iterarla como lista tanto si
    viene paginada (dict con 'results') como si es lista directa.
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("results", [])
    return []


class InsumoAPITestCase(APITestCase):
    def setUp(self):
        # Crea usuario de pruebas
        self.user = User.objects.create_user("demo", password="demo1234")

        # Login para obtener JWT
        r = self.client.post(
            "/api/auth/token/",
            {"username": "demo", "password": "demo1234"},
            format="json",
        )
        # Asegúrate de que el login va bien
        assert r.status_code == 200, r.content
        token = r.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Garantiza que exista Paciente (el endpoint lo crea si no está)
        self.client.get("/api/paciente/me/")

    def crear_insumo_api(self, **kwargs):
        """
        Crea un insumo vía API y devuelve su ID.
        OJO: 'tipo' es obligatorio (usar TIR/INS/AGU/SEN/OTR).
        """
        data = {
            "nombre": "Tiras",
            "tipo": "TIR",  # obligatorio en el serializer
            "stock_actual": 0,
            "stock_minimo": 2,
            "unidad": "u",
        }
        data.update(kwargs)
        r = self.client.post("/api/insumos/", data, format="json")
        self.assertEqual(r.status_code, 201, r.content)
        return r.data["id"]

    def test_crear_insumo(self):
        """Verifica que se pueda crear un insumo correctamente."""
        insumo_id = self.crear_insumo_api()
        self.assertTrue(insumo_id)

    def test_movimiento_entrada_sube_stock(self):
        """Verifica que un movimiento positivo aumente el stock."""
        insumo_id = self.crear_insumo_api()
        r = self.client.post(
            f"/api/insumos/{insumo_id}/movimientos/",
            {"cantidad": 5, "motivo": "compra"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.content)
        d = self.client.get(f"/api/insumos/{insumo_id}/").data
        assert d["stock_actual"] == 5

    def test_movimiento_salida_baja_stock(self):
        """Verifica que un movimiento negativo disminuya el stock."""
        insumo_id = self.crear_insumo_api(stock_actual=5)
        r = self.client.post(
            f"/api/insumos/{insumo_id}/movimientos/",
            {"cantidad": -3, "motivo": "uso"},
            format="json",
        )
        self.assertEqual(r.status_code, 201, r.content)
        d = self.client.get(f"/api/insumos/{insumo_id}/").data
        assert d["stock_actual"] == 2

    def test_bloquea_stock_negativo(self):
        """Verifica que no se permita un movimiento que deje el stock negativo."""
        insumo_id = self.crear_insumo_api(stock_actual=1)
        r = self.client.post(
            f"/api/insumos/{insumo_id}/movimientos/",
            {"cantidad": -2, "motivo": "uso"},
            format="json",
        )
        self.assertEqual(r.status_code, 400, r.content)  # error de validación
        d = self.client.get(f"/api/insumos/{insumo_id}/").data
        assert d["stock_actual"] == 1  # sin cambios

    def test_crea_alerta_stock_bajo(self):
        """Crea alerta cuando el stock cae por debajo del mínimo."""
        insumo_id = self.crear_insumo_api(stock_actual=2, stock_minimo=3)
        self.client.post(
            f"/api/insumos/{insumo_id}/movimientos/",
            {"cantidad": -1, "motivo": "uso"},
            format="json",
        )
        r = self.client.get("/api/alertas/?activas=true")
        self.assertEqual(r.status_code, 200, r.content)

        items = _as_list(r.data)
        self.assertGreaterEqual(len(items), 1, f"Sin alertas: {r.data}")
        self.assertTrue(
            any((item.get("tipo") == "stock_bajo") for item in items),
            f"Respuesta sin 'stock_bajo': {r.data}",
        )
