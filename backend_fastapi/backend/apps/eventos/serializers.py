from rest_framework import serializers
from .models import EventoPartido, TIPOS_EVENTO


class EventoPartidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoPartido
        fields = [
            'id', 'partido', 'jugador', 'equipo',
            'tipo_evento', 'minuto', 'valor', 'descripcion',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_tipo_evento(self, value):
        if value not in TIPOS_EVENTO:
            raise serializers.ValidationError(
                f'tipo_evento inválido. Usa uno de: {", ".join(sorted(TIPOS_EVENTO))}'
            )
        return value

    def validate_minuto(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('El minuto no puede ser negativo')
        return value

    def validate_valor(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('El valor no puede ser negativo')
        return value

    def validate(self, data):
        partido = data.get('partido') or getattr(self.instance, 'partido', None)
        jugador = data.get('jugador') or getattr(self.instance, 'jugador', None)
        equipo = data.get('equipo') or getattr(self.instance, 'equipo', None)

        if not partido:
            return data

        equipos_partido = {partido.equipo_local_id, partido.equipo_visitante_id}

        if equipo and equipo.id not in equipos_partido:
            raise serializers.ValidationError('El equipo no pertenece a este partido')

        if jugador:
            if jugador.equipo_id not in equipos_partido:
                raise serializers.ValidationError(
                    'El jugador no pertenece a ninguno de los equipos del partido'
                )
            if equipo and jugador.equipo_id != equipo.id:
                raise serializers.ValidationError('El jugador no pertenece al equipo enviado')

        return data
