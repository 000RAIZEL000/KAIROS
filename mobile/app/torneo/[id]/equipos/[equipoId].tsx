import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getJugadoresByEquipo } from '@/src/api/jugadores';
import type { Jugador } from '@/src/api/jugadores';

export default function JugadoresScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId: string }>();

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarJugadores = async () => {
    if (!equipoId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getJugadoresByEquipo(equipoId);
      console.log('JUGADORES:', data);
      setJugadores(data);
    } catch (err: any) {
      console.log('ERROR jugadores:', err?.message);
      console.log('STATUS jugadores:', err?.response?.status);
      console.log('DATA jugadores:', err?.response?.data);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.helper}>Cargando jugadores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores</Text>

      <FlatList
        data={jugadores}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.numero_camiseta ? `#${item.numero_camiseta} ` : ''}
              {item.nombre}
            </Text>

            {item.posicion ? (
              <Text style={styles.meta}>{item.posicion}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay jugadores registrados.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F8FA',
  },
  helper: {
    marginTop: 10,
    color: '#6B7280',
  },
  error: {
    color: '#B91C1C',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  meta: {
    color: '#6B7280',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  },
});