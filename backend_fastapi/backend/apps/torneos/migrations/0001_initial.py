from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Torneo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('deporte', models.CharField(blank=True, max_length=50, null=True)),
                ('modalidad', models.CharField(blank=True, max_length=50, null=True)),
                ('direccion', models.TextField(blank=True, null=True)),
                ('fecha_inicio', models.DateField(blank=True, null=True)),
                ('fecha_fin', models.DateField(blank=True, null=True)),
                ('estado', models.CharField(default='Pendiente', max_length=50)),
                ('imagen_url', models.TextField(blank=True, null=True)),
                ('activo', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='torneos',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'torneos',
                'ordering': ['-id'],
            },
        ),
    ]
