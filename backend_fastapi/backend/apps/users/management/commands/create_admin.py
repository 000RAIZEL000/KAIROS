import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Elimina y recrea el superusuario admin."

    def handle(self, *args, **kwargs):
        User = get_user_model()
        email = os.environ.get("ADMIN_EMAIL", "velemanuel100@gmail.com")
        password = os.environ.get("ADMIN_PASSWORD", "Kairos2026")
        nombre = os.environ.get("ADMIN_NOMBRE", "Manuel Vele")

        deleted, _ = User.objects.filter(email=email).delete()
        if deleted:
            self.stdout.write(f"[kairos] Usuario '{email}' eliminado.")

        user = User(
            email=email,
            username=email,
            nombre=nombre,
            role="admin",
            activo=True,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(
            f"[kairos] Superusuario '{email}' creado con role=admin, is_active=True."
        ))
