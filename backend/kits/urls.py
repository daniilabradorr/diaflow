from django.urls import path

from .public import PublicKitVerifyView, PublicKitView

urlpatterns = [
    path("qr/<str:token>", PublicKitView.as_view(), name="kits_public_get"),
    path(
        "qr/<str:token>/verify",
        PublicKitVerifyView.as_view(),
        name="kits_public_verify",
    ),
]
