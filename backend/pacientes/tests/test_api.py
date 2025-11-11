from django.contrib.auth.models import User
from django.urls import reverse
from pacientes.models import Paciente
from rest_framework.test import APITestCase


# prueba de la api de paciente
class PacienteApiTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("demo", password="demo1234")
        Paciente.objects.create(usuario=self.user, nombre="Demo")
        r = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "demo", "password": "demo1234"},
            format="json",
        )
        self.token = r.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_get_me(self):
        r = self.client.get(reverse("paciente_me"))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["nombre"], "Demo")

    def test_update_me(self):
        r = self.client.patch(
            reverse("paciente_update_me"),
            {"objetivo_glucosa_min": 90, "objetivo_glucosa_max": 150},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["objetivo_glucosa_min"], 90)
        self.assertEqual(r.data["objetivo_glucosa_max"], 150)
