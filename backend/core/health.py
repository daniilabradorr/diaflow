from django.db import connections
from django.http import JsonResponse


def health_view(_request):
    db_ok = True
    try:
        with connections["default"].cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()
    except Exception:
        db_ok = False

    return JsonResponse(
        {
            "status": "ok" if db_ok else "degraded",
            "db_ok": db_ok,
        },
        status=200 if db_ok else 503,
    )
