import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Crea el superusuario admin si no existe."

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = os.environ.get("ADMIN_EMAIL", "velemanuel100@gmail.com")
        password = os.environ.get("ADMIN_PASSWORD", "Kairos2026")
        nombre = os.environ.get("ADMIN_NOMBRE", "Manuel Vele")

        if User.objects.filter(email=email).exists():
            self.stdout.write(f"[kairos] Admin '{email}' ya existe, sin cambios.")
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            nombre=nombre,
            role="admin",
        )
        self.stdout.write(self.style.SUCCESS(f"[kairos] Superusuario '{email}' creado."))
