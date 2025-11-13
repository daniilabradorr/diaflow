from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APITestCase


class GlucosaValidationTest(APITestCase):
    def setUp(self):
        User.objects.create_user("val", password="val1234")
        r = self.client.post(
            "/api/auth/token/",
            {"username": "val", "password": "val1234"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.client.get("/api/paciente/me/")

    def test_valor_fuera_rango(self):
        bad = self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 5, "fecha": timezone.now().isoformat()},
            format="json",
        )
        assert bad.status_code == 400

        bad2 = self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 650, "fecha": timezone.now().isoformat()},
            format="json",
        )
        assert bad2.status_code == 400

    def test_fecha_futura(self):
        fut = timezone.now() + timezone.timedelta(hours=1)
        r = self.client.post(
            "/api/glucemias/",
            {"valor_mg_dl": 120, "fecha": fut.isoformat()},
            format="json",
        )
        assert r.status_code == 400
