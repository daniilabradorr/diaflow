from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.test import Client, TestCase


class OpsTests(TestCase):
    def test_health(self):
        c = Client()
        r = c.get("/health")
        self.assertEqual(r.status_code, 200)
        self.assertIn("db_ok", r.json())

    def test_seed_idempotente(self):
        call_command("seed_demo")
        call_command("seed_demo")  # de esta manera no duplica ni rompe

    def test_backup_crea_fichero(self):
        call_command("backup_db")
        p = Path(settings.BASE_DIR) / "backups"
        files = list(p.glob("*.gz"))
        self.assertTrue(len(files) >= 1)
