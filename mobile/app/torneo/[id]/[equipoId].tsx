import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/src/context/AuthContext";
import {
  getJugadoresByEquipo,
  deleteJugador,
} from "@/src/api/jugadores";
import type { Jugador } from "@/src/api/jugadores";

export default function JugadoresScreen() {
  const { id, equipoId } = useLocalSearchParams<{
    id: string;
    equipoId: string;
  }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarJugadores = async () => {
    try {
      const data = await getJugadoresByEquipo(String(equipoId));
      setJugadores(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log("ERROR jugadores:", err?.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarJugadores().finally(() => setLoading(false));
    }, [equipoId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarJugadores();
    setRefreshing(false);
  };

  const handleDelete = (jugadorId: number, nombre: string, apellido: string) => {
    Alert.alert(
      "Eliminar Jugador",
      `¿Seguro que deseas eliminar a ${nombre} ${apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJugador(String(jugadorId));
              Alert.alert("¡Éxito!", "Tu jugador ha sido eliminado correctamente.");
              cargarJugadores();
            } catch (err: any) {
              const msg = err?.response?.data?.detail || "No se pudo eliminar el jugador. Revisa si tiene goles o tarjetas registradas.";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
  };

  const renderJugador = ({ item }: { item: Jugador }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.nombre[0]}{item.apellido[0]}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.playerName}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.playerInfo}>
            {item.posicion || "Sin posición"} • #{item.numero_camiseta ?? "—"}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.activo ? "#22c55e" : "#ef4444" }]} />
      </View>

      {isAdmin && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              router.push({
                pathname: "/jugador/[jugadorId]/editar",
                params: {
                  jugadorId: String(item.id),
                  equipoId: String(equipoId),
                  torneoId: String(id),
                },
              })
            }
          >
            <Ionicons name="create-outline" size={16} color="#3b82f6" />
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.nombre, item.apellido)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Jugadores</Text>
            <Text style={styles.headerSub}>{jugadores.length} jugador(es)</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={jugadores}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderJugador}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No hay jugadores en este equipo.</Text>
                {isAdmin && (
                  <Text style={styles.emptyHint}>Toca "+" para añadir un jugador.</Text>
                )}
              </View>
            }
          />
        )}
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push({
              pathname: "/jugador/crear",
              params: { equipoId: String(equipoId), torneoId: String(id) },
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={22} color="#0f172a" style={{ marginRight: 6 }} />
          <Text style={styles.fabText}>Jugador</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 10,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  listContainer: { paddingBottom: 100 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#38bdf8", fontWeight: "800", fontSize: 16 },
  playerName: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  playerInfo: { fontSize: 13, color: "#64748b", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
  },
  editBtnText: { color: "#3b82f6", fontWeight: "700", marginLeft: 4 },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
  },
  deleteBtnText: { color: "#ef4444", fontWeight: "700", marginLeft: 4 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#94a3b8", fontSize: 16, marginTop: 16, textAlign: "center" },
  emptyHint: { color: "#38bdf8", fontSize: 13, marginTop: 8 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#38bdf8",
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
});