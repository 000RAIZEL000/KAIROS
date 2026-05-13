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
