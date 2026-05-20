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
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../src/context/AuthContext";
import { useAppTheme } from "../../../src/context/ThemeContext";
import { getPartidos } from "../../../src/api/partidos";
import type { Partido } from "../../../src/api/partidos";

export default function PartidosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme, colors, toggleTheme } = useAppTheme();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarPartidos = async () => {
    try {
      const data = await getPartidos(String(id));
      setPartidos(data);
    } catch (err: any) {
      console.log("ERROR partidos:", err?.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarPartidos().finally(() => setLoading(false));
    }, [id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarPartidos();
    setRefreshing(false);
  };

  const renderPartido = ({ item }: { item: Partido }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      activeOpacity={0.8}
      onPress={() =>
        user?.role === "admin" &&
        router.push({
          pathname: "/torneo/[id]/partido/[partidoId]",
          params: { id: String(id), partidoId: String(item.id) },
        })
      }
    >
      <View style={[styles.cardHeader, { borderBottomColor: colors.cardFooterBorder }]}>
        <Text style={[styles.fechaText, { color: colors.textSecondary }]}>
          {item.fecha ? new Date(item.fecha).toLocaleDateString() : "Fecha pendiente"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
            <Text style={[styles.statusText, { color: colors.textOnHeader }]}>{item.estado}</Text>
          </View>
          {user?.role === "admin" && (
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          )}
        </View>
      </View>

      <View style={styles.matchContent}>
        <View style={styles.teamSection}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={2}>{item.equipo_local?.nombre || "Local"}</Text>
        </View>

        <View style={[styles.scoreSection, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.scoreText, { color: colors.accent }]}>
            {item.estado === "Finalizado" || item.estado === "En juego"
              ? `${item.goles_local} - ${item.goles_visitante}`
              : "VS"}
          </Text>
        </View>

        <View style={styles.teamSection}>
          <Text style={[styles.teamName, { color: colors.text, textAlign: "right" }]} numberOfLines={2}>
            {item.equipo_visitante?.nombre || "Visitante"}
          </Text>
        </View>
      </View>

      {item.cancha && (
        <View style={[styles.canchaRow, { borderTopColor: colors.cardFooterBorder }]}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.canchaText, { color: colors.textSecondary }]}>{item.cancha}</Text>
        </View>
      )}

      {user?.role === "admin" && (
        <View style={styles.adminHint}>
          <Ionicons name="settings-outline" size={14} color={colors.accent} />
          <Text style={[styles.adminHintText, { color: colors.accent }]}>Toca para gestionar resultados y eventos</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado": return "rgba(34, 197, 94, 0.2)";
      case "En juego": return "rgba(249, 115, 22, 0.2)";
      case "Suspendido": return "rgba(239, 68, 68, 0.2)";
      default: return "rgba(148, 163, 184, 0.2)";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Calendario</Text>
            <Text style={styles.headerSub}>{partidos.length} partido(s) programado(s)</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons
              name={theme === "dark" ? "sunny-outline" : "moon-outline"}
              size={20}
              color="#f8fafc"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={partidos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPartido}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay partidos programados en este torneo.</Text>
                {user?.role === "admin" && (
                  <Text style={[styles.emptyHint, { color: colors.accent }]}>Toca el botón "+" para programar uno.</Text>
                )}
              </View>
            }
          />
        )}
      </View>

      {user?.role === "admin" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.fabBg }]}
          onPress={() =>
            router.push({
              pathname: "/torneo/[id]/crear-partido",
              params: { id: String(id) },
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color={colors.fabText} style={{ marginRight: 4 }} />
          <Text style={[styles.fabText, { color: colors.fabText }]}>Partido</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  themeBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 12,
  },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  headerSub: { color: "#a7f3d0", fontSize: 13, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16 },
  listContainer: { paddingVertical: 20, paddingBottom: 100 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  fechaText: { fontSize: 12, fontWeight: "700" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  teamSection: { flex: 2 },
  teamName: { fontSize: 16, fontWeight: "800" },
  scoreSection: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 10,
  },
  scoreText: { fontSize: 20, fontWeight: "900" },
  canchaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  canchaText: { fontSize: 12, marginLeft: 6 },
  adminHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  adminHintText: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: "center" },
  emptyHint: { fontSize: 13, marginTop: 8 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { fontSize: 16, fontWeight: "800" },
});
