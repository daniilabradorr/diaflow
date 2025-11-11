from django.contrib.auth.models import User
from pacientes.models import Paciente
from rest_framework.test import APITestCase


# prueba de la api del modelo de la glucosa
class GlucosaApiTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("demo", password="demo1234")
        Paciente.objects.create(usuario=self.user, nombre="Demo")
        r = self.client.post(
            "/api/auth/token/",
            {"username": "demo", "password": "demo1234"},
            format="json",
        )
        self.token = r.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_crear_y_listar(self):
        r = self.client.post(
            "/api/glucemias/",
            {
                "valor_mg_dl": 123,
                "medido_en": "2025-11-11T08:35:00Z",
                "fuente": "manual",
                "notas": "ok",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        r2 = self.client.get("/api/glucemias/")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.data["count"], 1)

    def test_validacion_fuera_de_rango(self):
        r = self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 5, "medido_en": "2025-11-11T08:35:00Z"},
            format="json",
        )
        self.assertEqual(r.status_code, 400)

    def test_filtro_por_rango_fechas(self):
        # Crea dos registros en fechas diferentes
        self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 100, "medido_en": "2025-11-10T08:00:00Z"},
            format="json",
        )
        self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 110, "medido_en": "2025-11-12T08:00:00Z"},
            format="json",
        )
        r = self.client.get(
            "/api/glucemias/?desde=2025-11-11T00:00:00Z&hasta=2025-11-12T23:59:59Z"
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["count"], 1)
