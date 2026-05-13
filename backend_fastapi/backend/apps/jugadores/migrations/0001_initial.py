from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('equipos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Jugador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=80)),
                ('apellido', models.CharField(max_length=80)),
                ('dni', models.CharField(blank=True, max_length=20, null=True)),
                ('fecha_nacimiento', models.DateField(blank=True, null=True)),
                ('posicion', models.CharField(blank=True, max_length=50, null=True)),
                ('numero_camiseta', models.IntegerField(blank=True, null=True)),
                ('foto_url', models.TextField(blank=True, null=True)),
                ('activo', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('equipo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='jugadores',
                    to='equipos.equipo',
                )),
            ],
            options={
                'db_table': 'jugadores',
                'ordering': ['nombre', 'apellido'],
            },
        ),
    ]
