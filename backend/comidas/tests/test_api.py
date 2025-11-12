from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase


class DosisComidasAPITestCase(APITestCase):
    def setUp(self):
        # Usuario de pruebas
        User.objects.create_user("daniel", password="daniel 1234")

        # Login (JWT)
        r = self.client.post(
            "/api/auth/token/",
            {"username": "daniel", "password": "daniel 1234"},
            format="json",
        )
        assert r.status_code == 200, r.content
        token = r.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Garantiza Paciente
        self.client.get("/api/paciente/me/")

    # Helpers
    def crear_comida(self, **kwargs):
        data = {
            "fecha": timezone.now().isoformat(),
            "carbohidratos_g": 45,
            "descripcion": "desayuno",
        }
        data.update(kwargs)
        r = self.client.post("/api/comidas/", data, format="json")
        assert r.status_code == 201, r.content
        return r.data

    def crear_dosis(self, **kwargs):
        data = {
            "fecha": timezone.now().isoformat(),
            "tipo": "bolo",
            "unidades": "4.0",
            "notas": "",
            "comida": None,
        }
        data.update(kwargs)
        r = self.client.post("/api/dosis/", data, format="json")
        assert r.status_code == 201, r.content
        return r.data

    # Tests
    def test_crear_comida(self):
        c = self.crear_comida()
        assert c["carbohidratos_g"] == 45

    def test_crear_dosis_con_y_sin_comida(self):
        c = self.crear_comida()
        d1 = self.crear_dosis(comida=c["id"])
        d2 = self.crear_dosis(comida=None)
        assert d1["comida"] == c["id"]
        assert d2["comida"] is None

    def test_filtro_por_tipo(self):
        self.crear_dosis(tipo="basal", unidades="12.0")
        self.crear_dosis(tipo="bolo", unidades="3.0")
        self.crear_dosis(tipo="corr", unidades="2.0")

        r = self.client.get("/api/dosis/?tipo=basal")
        assert r.status_code == 200
        items = r.data if isinstance(r.data, list) else r.data.get("results", [])
        assert all(x["tipo"] == "basal" for x in items)

    def test_filtro_por_rango_fechas(self):
        hoy = timezone.now()
        ayer = hoy - timedelta(days=1)
        maniana = hoy + timedelta(days=1)

        # Tres dosis en fechas distintas
        self.crear_dosis(fecha=ayer.isoformat(), tipo="bolo", unidades="2.0")
        self.crear_dosis(fecha=hoy.isoformat(), tipo="bolo", unidades="2.0")
        self.crear_dosis(fecha=maniana.isoformat(), tipo="bolo", unidades="2.0")

        # rango: solo hoy
        q = f"/api/dosis/?desde={hoy.date().isoformat()}&hasta={hoy.date().isoformat()}"
        r = self.client.get(q)
        assert r.status_code == 200
        items = r.data if isinstance(r.data, list) else r.data.get("results", [])
        # deben entrar solo las dosis del día de 'hoy'
        for x in items:
            assert x["fecha"][:10] == hoy.date().isoformat()

    def test_validacion_unidades_fuera_de_rango(self):
        r = self.client.post(
            "/api/dosis/",
            {"fecha": timezone.now().isoformat(), "tipo": "bolo", "unidades": "150.0"},
            format="json",
        )
        assert r.status_code == 400, r.content
