import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/src/context/AuthContext";
import { getTorneoById } from "@/src/api/torneos";
import type { Torneo } from "@/src/types/torneo";

export default function TorneoDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarTorneo = async () => {
    try {
      const data = await getTorneoById(String(id));
      setTorneo(data);
    } catch (error) {
      console.log("Error cargando torneo en dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTorneo();
    }, [id])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace("/home")} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{torneo?.nombre || "Campeonato"}</Text>
            <Text style={styles.headerSub}>Panel Administrativo {user?.role === "admin" ? "(Admin)" : ""}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {/* Equipos */}
          <DashboardItem
            title="Equipos"
            subtitle="Gestiona los clubes inscritos"
            icon="people"
            color="#3b82f6"
            onPress={() => router.push({ pathname: "/torneo/[id]/equipos", params: { id: String(id) } })}
          />

          {/* Partidos */}
          <DashboardItem
            title="Calendario"
            subtitle="Partidos y resultados"
            icon="calendar"
            color="#f59e0b"
            onPress={() => router.push({ pathname: "/torneo/[id]/partidos", params: { id: String(id) } })}
          />

          {/* Posiciones */}
          <DashboardItem
            title="Tabla"
            subtitle="Estadísticas y puntos"
            icon="trophy"
            color="#10b981"
            onPress={() => router.push({ pathname: "/torneo/[id]/posiciones", params: { id: String(id) } })}
          />

          {/* Editar Torneo (Solo Admin) */}
          {user?.role === "admin" && (
            <DashboardItem
              title="Configuración"
              subtitle="Ajustes del torneo"
              icon="settings"
              color="#64748b"
              onPress={() => router.push({ pathname: "/torneo/[id]/editar", params: { id: String(id) } })}
            />
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información del Torneo</Text>
          <View style={styles.infoRow}>
            <Ionicons name="football-outline" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>Deporte: {torneo?.deporte}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="medal-outline" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>Modalidad: {torneo?.modalidad}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>Dirección: {torneo?.direccion || "No especificada"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="stats-chart-outline" size={18} color="#38bdf8" />
            <Text style={styles.infoText}>Estado: {torneo?.estado}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DashboardItem({ title, subtitle, icon, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSub}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "900" },
  headerSub: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  scrollContent: { padding: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  itemTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  itemSub: { fontSize: 12, color: "#64748b", marginTop: 4 },
  infoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
  },
  infoTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "800", marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { color: "#cbd5e1", fontSize: 14, marginLeft: 12, fontWeight: "500" },
});
