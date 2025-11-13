from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class AccessScopeTest(APITestCase):
    def setUp(self):
        # user A
        self.u1 = User.objects.create_user("a", password="a1234")
        r = self.client.post(
            "/api/auth/token/", {"username": "a", "password": "a1234"}, format="json"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.client.get("/api/paciente/me/")  # crea/asegura paciente

        # crea datos de A (ajusta a un recurso, p.ej. insumos)
        r = self.client.post(
            "/api/insumos/",
            {
                "nombre": "Tiras",
                "tipo": "TIR",
                "stock_actual": 0,
                "stock_minimo": 1,
                "unidad": "u",
            },
            format="json",
        )
        self.insumo_id = r.data["id"]

        # user B
        self.client.credentials()  # limpia
        self.u2 = User.objects.create_user("b", password="b1234")
        r = self.client.post(
            "/api/auth/token/", {"username": "b", "password": "b1234"}, format="json"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.client.get("/api/paciente/me/")

    def test_b_no_ve_insumo_de_a(self):
        r = self.client.get("/api/insumos/")
        # ninguno debe ser de A
        items = r.data if isinstance(r.data, list) else r.data.get("results", [])
        assert all(x["id"] != self.insumo_id for x in items)

        r2 = self.client.get(f"/api/insumos/{self.insumo_id}/")
        assert r2.status_code == 404  # no pertenece a B
