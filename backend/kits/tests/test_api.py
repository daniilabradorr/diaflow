from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class KitsQRAPITest(APITestCase):
    def setUp(self):
        User.objects.create_user("daniel", password="daniel 1234")
        r = self.client.post(
            "/api/auth/token/",
            {"username": "daniel", "password": "daniel 1234"},
            format="json",
        )
        assert r.status_code == 200, r.content
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.client.get("/api/paciente/me/")

    # helpers
    def crear_kit_con_elementos(self):
        k = self.client.post(
            "/api/kits/", {"nombre": "Kit Cole", "descripcion": "clase"}, format="json"
        ).data
        kid = k["id"]
        elems = {
            "items": [
                {"etiqueta": "Tiras", "cantidad_requerida": 2, "unidad": "u"},
                {"etiqueta": "Agujas", "cantidad_requerida": 3, "unidad": "u"},
            ]
        }
        r = self.client.post(f"/api/kits/{kid}/elementos/", elems, format="json")
        assert r.status_code == 200, r.content
        # obtener token
        k = self.client.get(f"/api/kits/{kid}/").data
        return k

    def test_crud_y_elementos(self):
        k = self.crear_kit_con_elementos()
        assert k["token_publico"]

        lst = self.client.get("/api/kits/").data
        assert len(lst) >= 1

    def test_qr_png_y_dataurl(self):
        k = self.crear_kit_con_elementos()
        kid = k["id"]

        r = self.client.get(f"/api/kits/{kid}/qr")
        assert r.status_code == 200
        assert r.get("Content-Type") == "image/png"

        r = self.client.get(f"/api/kits/{kid}/qr?as=dataurl=true")
        assert r.status_code == 200
        assert r.data["dataurl"].startswith("data:image/png;base64,")

    def test_public_get_por_token(self):
        k = self.crear_kit_con_elementos()
        tok = k["token_publico"]
        r = self.client.get(f"/qr/{tok}")
        assert r.status_code == 200
        assert len(r.data["elementos"]) == 2

    def test_public_post_verify_ok(self):
        k = self.crear_kit_con_elementos()
        tok = k["token_publico"]
        r = self.client.post(
            f"/qr/{tok}/verify",
            {
                "items": [
                    {"etiqueta": "Tiras", "cantidad": 2},
                    {"etiqueta": "Agujas", "cantidad": 3},
                ]
            },
            format="json",
        )
        assert r.status_code == 200
        assert r.data["resultado_ok"] is True
        assert r.data["faltantes"] == {}

    def test_public_post_verify_falta(self):
        k = self.crear_kit_con_elementos()
        tok = k["token_publico"]
        r = self.client.post(
            f"/qr/{tok}/verify",
            {"items": [{"etiqueta": "Tiras", "cantidad": 1}]},
            format="json",
        )
        assert r.status_code == 200
        assert r.data["resultado_ok"] is False
        assert r.data["faltantes"].get("Tiras") == 1
