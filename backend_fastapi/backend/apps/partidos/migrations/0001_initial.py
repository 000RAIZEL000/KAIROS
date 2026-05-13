from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('torneos', '0001_initial'),
        ('equipos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Partido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(blank=True, null=True)),
                ('estado', models.CharField(default='Pendiente', max_length=30)),
                ('goles_local', models.IntegerField(default=0)),
                ('goles_visitante', models.IntegerField(default=0)),
                ('cancha', models.CharField(blank=True, max_length=255, null=True)),
                ('jornada', models.IntegerField(blank=True, null=True)),
                ('fase', models.CharField(blank=True, max_length=100, null=True)),
                ('arbitro', models.CharField(blank=True, max_length=255, null=True)),
                ('observaciones', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('torneo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='partidos',
                    to='torneos.torneo',
                )),
                ('equipo_local', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='partidos_local',
                    to='equipos.equipo',
                )),
                ('equipo_visitante', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='partidos_visitante',
                    to='equipos.equipo',
                )),
            ],
            options={
                'db_table': 'partidos',
                'ordering': ['fecha'],
            },
        ),
    ]
