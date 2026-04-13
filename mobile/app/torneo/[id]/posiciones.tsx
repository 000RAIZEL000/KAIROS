import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getTablaPosiciones, getGoleadores } from "@/src/api/stats";
import type { TablaRow, GoleadorRow } from "@/src/api/stats";

export default function PosicionesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tabla, setTabla] = useState<TablaRow[]>([]);
  const [goleadores, setGoleadores] = useState<GoleadorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tabla" | "goleadores">("tabla");

  const cargarDatos = async () => {
    try {
      const tId = String(id);
      const [tablaData, goleadoresData] = await Promise.all([
        getTablaPosiciones(tId),
        getGoleadores(tId),
      ]);
      setTabla(Array.isArray(tablaData) ? tablaData : []);
      setGoleadores(Array.isArray(goleadoresData) ? goleadoresData : []);
    } catch (err: any) {
      console.log("ERROR stats:", err?.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarDatos().finally(() => setLoading(false));
    }, [id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "tabla" && styles.activeTab]}
            onPress={() => setActiveTab("tabla")}
          >
            <Text style={[styles.tabText, activeTab === "tabla" && styles.activeTabText]}>Tabla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "goleadores" && styles.activeTab]}
            onPress={() => setActiveTab("goleadores")}
          >
            <Text style={[styles.tabText, activeTab === "goleadores" && styles.activeTabText]}>Goleadores</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        >
          {activeTab === "tabla" ? (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.columnLabel, { flex: 4 }]}>Equipo</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center" }]}>PJ</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center" }]}>DG</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center" }]}>PTS</Text>
              </View>

              {tabla.map((row, index) => (
                <View key={row.equipo_id || index} style={styles.tableRow}>
                  <View style={{ flex: 4, flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                    <Text style={styles.equipoName} numberOfLines={1}>
                      {row.equipo}
                    </Text>
                  </View>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center" }]}>{row.pj}</Text>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center", color: (row.dg || 0) >= 0 ? "#22c55e" : "#ef4444" }]}>
                    {(row.dg || 0) > 0 ? `+${row.dg}` : row.dg}
                  </Text>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center", fontWeight: "800", color: "#38bdf8" }]}>
                    {row.pts}
                  </Text>
                </View>
              ))}

              {tabla.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hay datos disponibles aún.</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.goleadoresContainer}>
              {goleadores.map((player, index) => (
                <View key={`${player.jugador_id}-${index}`} style={styles.playerCard}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.jugador}</Text>
                    <Text style={styles.playerEquipo}>{player.equipo}</Text>
                  </View>
                  <View style={styles.goalBadge}>
                    <Text style={styles.goalCount}>{player.goles}</Text>
                    <Text style={styles.goalLabel}>goles</Text>
                  </View>
                </View>
              ))}

              {goleadores.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hay registros de goles aún.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: { backgroundColor: "#38bdf8" },
  tabText: { color: "#94a3b8", fontWeight: "700", fontSize: 14 },
  activeTabText: { color: "#0f172a" },
  content: { flex: 1, padding: 16 },
  tableCard: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.1)",
    paddingBottom: 12,
    marginBottom: 12,
  },
  columnLabel: { color: "#64748b", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.05)",
    alignItems: "center",
  },
  rankText: { color: "#38bdf8", fontWeight: "800", fontSize: 13, marginRight: 8, width: 22 },
  equipoName: { color: "#f8fafc", fontWeight: "700", fontSize: 15 },
  columnText: { color: "#f8fafc", fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#64748b", fontSize: 16 },
  goleadoresContainer: { paddingBottom: 40 },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.1)",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rankBadgeText: { color: "#38bdf8", fontWeight: "900" },
  playerInfo: { flex: 1 },
  playerName: { color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  playerEquipo: { color: "#64748b", fontSize: 13, marginTop: 2 },
  goalBadge: {
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  goalCount: { color: "#38bdf8", fontSize: 20, fontWeight: "900" },
  goalLabel: { color: "#38bdf8", fontSize: 10, fontWeight: "700" },
});
