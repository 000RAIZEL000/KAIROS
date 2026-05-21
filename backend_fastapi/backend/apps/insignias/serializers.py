from rest_framework import serializers
from .models import Insignia


class InsigniaSerializer(serializers.ModelSerializer):
    jugador_nombre = serializers.SerializerMethodField()
    torneo_nombre = serializers.SerializerMethodField()
    tipo_display = serializers.SerializerMethodField()

    class Meta:
        model = Insignia
        fields = [
            'id', 'jugador', 'jugador_nombre',
            'tipo', 'tipo_display',
            'torneo', 'torneo_nombre',
            'partido', 'descripcion', 'fecha',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'fecha', 'created_at', 'updated_at']

    def get_jugador_nombre(self, obj):
        return f"{obj.jugador.nombre} {obj.jugador.apellido}"

    def get_torneo_nombre(self, obj):
        return obj.torneo.nombre

    def get_tipo_display(self, obj):
        return obj.get_tipo_display()
