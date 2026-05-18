import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../../../src/context/ThemeContext';
import { getJugadoresByEquipo } from '../../../../src/api/jugadores';
import type { Jugador } from '../../../../src/api/jugadores';

export default function JugadoresScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>();
  const { colors } = useAppTheme();

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarJugadores = async () => {
    if (!equipoId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getJugadoresByEquipo(equipoId);
      setJugadores(data);
    } catch (err: any) {
      console.log('ERROR jugadores:', err?.message);
      setError('No se pudieron cargar los jugadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarJugadores();
  }, [equipoId]);

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
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.numero_camiseta ? `#${item.numero_camiseta} ` : ''}
              {item.nombre}
            </Text>

            {item.posicion ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.posicion}</Text>
            ) : null}
          </View>
        )}
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
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
