import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../../../src/context/ThemeContext';
import { getJugadoresByEquipo } from '../../../../src/api/jugadores';
import { getInsignias, INSIGNIA_CONFIG } from '../../../../src/api/insignias';
import type { Jugador } from '../../../../src/api/jugadores';
import type { Insignia } from '../../../../src/api/insignias';

export default function JugadoresScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>();
  const { colors } = useAppTheme();

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [insigniasByJugador, setInsigniasByJugador] = useState<Record<number, Insignia[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    if (!equipoId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getJugadoresByEquipo(equipoId);
      setJugadores(data);
      if (data.length > 0) {
        const insPromises = data.map(j => getInsignias({ jugador_id: j.id }));
        const results = await Promise.all(insPromises);
        const map: Record<number, Insignia[]> = {};
        data.forEach((j, i) => { map[j.id] = results[i]; });
        setInsigniasByJugador(map);
      }
    } catch (err: any) {
      console.log('ERROR jugadores:', err?.message);
      setError('No se pudieron cargar los jugadores.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarDatos(); }, [equipoId]));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.helper, { color: colors.textMuted }]}>Cargando jugadores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Jugadores</Text>

      <FlatList
        data={jugadores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const playerInsignias = insigniasByJugador[item.id] ?? [];
          return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.numero_camiseta ? `#${item.numero_camiseta} ` : ''}
                {item.nombre} {item.apellido}
              </Text>

              {item.posicion ? (
                <Text style={[styles.meta, { color: colors.textMuted }]}>{item.posicion}</Text>
              ) : null}

              {playerInsignias.length > 0 && (
                <View style={styles.insigniasRow}>
                  {playerInsignias.map(ins => {
                    const cfg = INSIGNIA_CONFIG[ins.tipo];
                    return (
                      <View
                        key={ins.id}
                        style={[styles.insigniaBadge, { backgroundColor: cfg.color + "22", borderColor: cfg.color }]}
                      >
                        <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                        <Text style={[styles.insigniaLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>No hay jugadores registrados.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  helper: {
    marginTop: 10,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
  insigniasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  insigniaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  insigniaLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
