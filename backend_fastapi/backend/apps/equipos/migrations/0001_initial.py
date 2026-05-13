from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('torneos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Equipo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('grupo', models.CharField(blank=True, max_length=50, null=True)),
                ('color_principal', models.CharField(blank=True, max_length=50, null=True)),
                ('color_secundario', models.CharField(blank=True, max_length=50, null=True)),
                ('escudo_url', models.TextField(blank=True, null=True)),
                ('activo', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('torneo', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='equipos',
                    to='torneos.torneo',
                )),
            ],
            options={
                'db_table': 'equipos',
                'ordering': ['nombre'],
            },
        ),
    ]
