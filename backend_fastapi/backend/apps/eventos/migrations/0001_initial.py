from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('partidos', '0001_initial'),
        ('jugadores', '0001_initial'),
        ('equipos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventoPartido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo_evento', models.CharField(max_length=30)),
                ('minuto', models.IntegerField(blank=True, null=True)),
                ('valor', models.IntegerField(blank=True, null=True)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('partido', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='eventos',
                    to='partidos.partido',
                )),
                ('jugador', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='eventos',
                    to='jugadores.jugador',
                )),
                ('equipo', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='eventos',
                    to='equipos.equipo',
                )),
            ],
            options={
                'db_table': 'eventos_partido',
                'ordering': ['id'],
            },
        ),
    ]
