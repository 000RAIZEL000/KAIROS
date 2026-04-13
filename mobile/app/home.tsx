import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { getTorneos, deleteTorneo } from "@/src/api/torneos";
import type { Torneo } from "@/src/types/torneo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTorneos = async () => {
    try {
      const data = await getTorneos();
      setTorneos(data);
    } catch (error) {
      console.log("Error cargando torneos", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchTorneos();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTorneos();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDeleteTorneo = (id: number, nombre: string) => {
    Alert.alert(
      "Eliminar Campeonato",
      `¿Seguro que deseas eliminar "${nombre}"? Esta acción borrará equipos y jugadores asociados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "ELIMINAR",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTorneo(String(id));
              Alert.alert("¡Éxito!", "Tu campeonato ha sido eliminado correctamente.");
              fetchTorneos();
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el campeonato.");
            }
          },
        },
      ]
    );
  };

  const renderTorneo = ({ item }: { item: Torneo }) => (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/torneo/${item.id}`)}
        style={{ padding: 16 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.estado}</Text>
          </View>
        </View>
        <Text style={styles.cardInfo}>⚽ {item.deporte} • 🏆 {item.modalidad}</Text>
        {item.descripcion && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
      </TouchableOpacity>

      {user?.role === "admin" && (
        <View style={styles.adminActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({
              pathname: "/torneo/[id]/editar",
              params: { id: String(item.id) }
            })}
          >
            <Ionicons name="create-outline" size={18} color="#3b82f6" />
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderLeftWidth: 1, borderLeftColor: "#f1f5f9" }]}
            onPress={() => handleDeleteTorneo(item.id, item.nombre)}
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || "Usuario"}</Text>
            {user?.role === "admin" && (
              <Text style={styles.adminBadge}>ADMINISTRADOR</Text>
            )}
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#f8fafc" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Campeonatos Activos</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={torneos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTorneo}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No hay campeonatos disponibles en este momento.</Text>
              </View>
            }
          />
        )}
      </View>

      {user?.role === "admin" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/torneo/crear")}
          activeOpacity={0.8}
        >
          <Ionicons name="trophy" size={24} color="#0f172a" style={{ marginRight: 6 }} />
          <Text style={styles.fabText}>Nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "500",
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
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
    paddingVertical: 12,
  },
  actionBtnText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  deleteBtnText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  badge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  badgeText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardInfo: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#94a3b8",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
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
  fabText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
});