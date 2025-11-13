import gzip
import io
import os
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

BACKUP_DIR = Path(settings.BASE_DIR) / "backups"
BACKUP_DIR.mkdir(exist_ok=True)


def _rotate_keep_n(dirpath: Path, n: int = 7):
    files = sorted(dirpath.glob("*.gz"), key=lambda p: p.stat().st_mtime, reverse=True)
    for f in files[n:]:
        f.unlink(missing_ok=True)


class Command(BaseCommand):
    help = "Crea backup comprimido de la base de datos (pg_dump o dumpdata)."

    def handle(self, *args, **opts):
        engine = settings.DATABASES["default"]["ENGINE"]
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")

        # PostgreSQL → pg_dump
        if "postgresql" in engine:
            url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL") or ""
            if not url:
                db = settings.DATABASES["default"]
                user = db.get("USER", "")
                pwd = db.get("PASSWORD", "")
                host = db.get("HOST", "localhost")
                port = db.get("PORT", "5432")
                name = db.get("NAME", "")
                url = f"postgres://{user}:{pwd}@{host}:{port}/{name}"

            out_file = BACKUP_DIR / f"pg_{timestamp}.sql.gz"

            # Password para pg_dump
            m = re.match(r"^postgres://([^:]+):([^@]+)@([^:]+):?(\d+)?/(.+)$", url)
            if not m:
                raise CommandError("No se pudo parsear DATABASE_URL para pg_dump.")
            env = os.environ.copy()
            env["PGPASSWORD"] = m.group(2)

            cmd = ["pg_dump", "--no-owner", "--format=plain", "--dbname", url]
            self.stdout.write(f"Ejecutando: {' '.join(cmd)}")

            with subprocess.Popen(
                cmd, stdout=subprocess.PIPE, env=env
            ) as proc, gzip.open(out_file, "wb") as gz:
                shutil.copyfileobj(proc.stdout, gz)
                ret = proc.wait()
                if ret != 0:
                    out_file.unlink(missing_ok=True)
                    raise CommandError(f"pg_dump retornó código {ret}")

            _rotate_keep_n(BACKUP_DIR, 7)
            self.stdout.write(self.style.SUCCESS(f"Backup PostgreSQL OK → {out_file}"))
            return

        # SQLite / otros → dumpdata
        out_file = BACKUP_DIR / f"dump_{timestamp}.json.gz"
        buf = io.StringIO()
        call_command(
            "dumpdata", exclude=["admin.logentry", "contenttypes"], indent=2, stdout=buf
        )
        payload = buf.getvalue()
        with gzip.open(out_file, "wt", encoding="utf-8") as gz:
            gz.write(payload)
        _rotate_keep_n(BACKUP_DIR, 7)
        self.stdout.write(self.style.SUCCESS(f"Backup JSON OK → {out_file}"))
