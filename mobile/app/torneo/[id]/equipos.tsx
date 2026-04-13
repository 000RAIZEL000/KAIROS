import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/src/context/AuthContext";
import { getEquiposByTorneo, deleteEquipo } from "@/src/api/equipos";
import type { Equipo } from "@/src/api/equipos";

export default function EquiposScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarEquipos = async () => {
    try {
      const data = await getEquiposByTorneo(String(id));
      setEquipos(data);
    } catch (err: any) {
      console.log("ERROR equipos:", err?.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarEquipos().finally(() => setLoading(false));
    }, [id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEquipos();
    setRefreshing(false);
  };

  const handleDeleteEquipo = (equipoId: number, nombre: string) => {
    Alert.alert(
      "Eliminar Equipo",
      `¿Seguro que deseas eliminar el equipo "${nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "ELIMINAR",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEquipo(String(equipoId));
              Alert.alert("¡Éxito!", "Tu equipo ha sido eliminado correctamente.");
              cargarEquipos();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el equipo.");
            }
          },
        },
      ]
    );
  };

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardBody}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/torneo/[id]/[equipoId]",
            params: { id: String(id), equipoId: String(item.id) },
          })
        }
      >
        <View style={styles.cardLeft}>
          <View style={[styles.colorDot, { backgroundColor: item.color_principal || "#38bdf8" }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            {item.grupo && <Text style={styles.cardGroup}>Grupo {item.grupo}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </TouchableOpacity>

      {user?.role === "admin" && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: "/torneo/[id]/equipos/[equipoId]/editar",
                params: { id: String(id), equipoId: String(item.id) },
              })
            }
          >
            <Ionicons name="create-outline" size={18} color="#3b82f6" />
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderLeftWidth: 1, borderLeftColor: "#f1f5f9" }]}
            onPress={() => handleDeleteEquipo(item.id, item.nombre)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
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
            <Text style={styles.headerTitle}>Equipos</Text>
            <Text style={styles.headerSub}>{equipos.length} equipo(s) registrado(s)</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={equipos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderEquipo}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No hay equipos registrados en este torneo.</Text>
                {user?.role === "admin" && (
                  <Text style={styles.emptyHint}>Toca el botón "+" para crear uno.</Text>
                )}
              </View>
            }
          />
        )}
      </View>

      {user?.role === "admin" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push({
              pathname: "/torneo/[id]/crear-equipo",
              params: { id: String(id) },
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="#0f172a" style={{ marginRight: 4 }} />
          <Text style={styles.fabText}>Equipo</Text>
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardBody: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  actionBtnText: {
    color: "#3b82f6",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  deleteBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  cardGroup: { fontSize: 12, color: "#64748b", marginTop: 2 },
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