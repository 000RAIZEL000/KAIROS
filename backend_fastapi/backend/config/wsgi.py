import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Auto-run pending migrations on every worker startup.
# django migrate is idempotent: no-op when all migrations are already applied.
# This ensures tables exist even if the build command never ran migrate.
try:
    from django.core.management import call_command
    call_command('migrate', '--no-input', verbosity=1)
    print('[kairos] Migrations OK', flush=True)
except Exception as exc:
    print(f'[kairos] migrate error: {exc}', file=sys.stderr, flush=True)

try:
    from django.core.management import call_command as _cc
    _cc('seed_data')
    print('[kairos] Seed OK', flush=True)
except Exception as exc:
    print(f'[kairos] seed error: {exc}', file=sys.stderr, flush=True)

try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    _email = 'admin@kairos.com'
    if not User.objects.filter(email=_email).exists():
        _u = User(
            email=_email,
            username=_email,
            nombre='Admin Kairos',
            role='admin',
            activo=True,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        _u.set_password('Admin2026')
        _u.save()
        print(f'[kairos] {_email} creado con role=admin', flush=True)
    else:
        print(f'[kairos] {_email} ya existe', flush=True)
except Exception as exc:
    print(f'[kairos] create admin error: {exc}', file=sys.stderr, flush=True)
