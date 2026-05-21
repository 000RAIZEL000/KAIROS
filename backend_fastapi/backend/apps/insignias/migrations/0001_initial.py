from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('jugadores', '0001_initial'),
        ('torneos', '0001_initial'),
        ('partidos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Insignia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[
                    ('goleador', 'Goleador'),
                    ('mejor_jugador', 'Mejor Jugador'),
                    ('fair_play', 'Fair Play'),
                    ('portero_menos_goleado', 'Portero Menos Goleado'),
                    ('capitan', 'Capitán'),
                    ('mvp_partido', 'MVP del Partido'),
                ], max_length=30)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('fecha', models.DateField(auto_now_add=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('jugador', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='insignias',
                    to='jugadores.jugador',
                )),
                ('torneo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='insignias',
                    to='torneos.torneo',
                )),
                ('partido', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='insignias',
                    to='partidos.partido',
                )),
            ],
            options={
                'db_table': 'insignias',
                'ordering': ['-fecha', '-created_at'],
            },
        ),
    ]
