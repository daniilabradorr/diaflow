from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.test import APITestCase


@override_settings(
    REST_FRAMEWORK={
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "rest_framework_simplejwt.authentication.JWTAuthentication",
        ),
        "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
        "DEFAULT_THROTTLE_CLASSES": (
            "rest_framework.throttling.UserRateThrottle",
            "rest_framework.throttling.AnonRateThrottle",
        ),
        "DEFAULT_THROTTLE_RATES": {"user": "3/min", "anon": "2/min", "qr": "10/min"},
        "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    }
)
class ThrottlingTest(APITestCase):
    def setUp(self):
        User.objects.create_user("rate", password="rate1234")
        r = self.client.post(
            "/api/auth/token/",
            {"username": "rate", "password": "rate1234"},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}")
        self.client.get("/api/paciente/me/")

    def test_user_rate_limit(self):
        # 3 OK
        for _ in range(3):
            _ = self.client.get("/api/insumos/")
            assert _.status_code in (200, 204)
        # 4º → 429
        r = self.client.get("/api/insumos/")
        assert r.status_code == 429
