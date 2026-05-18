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
import { useAppTheme } from "../../../src/context/ThemeContext";
import { getTablaPosiciones, getGoleadores, getTarjetas } from "../../../src/api/stats";
import type { TablaRow, GoleadorRow, TarjetaRow } from "../../../src/api/stats";

export default function PosicionesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [tabla, setTabla] = useState<TablaRow[]>([]);
  const [goleadores, setGoleadores] = useState<GoleadorRow[]>([]);
  const [tarjetas, setTarjetas] = useState<TarjetaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tabla" | "goleadores" | "tarjetas">("tabla");

  const cargarDatos = async () => {
    try {
      const tId = String(id);
      const [tablaData, goleadoresData, tarjetasData] = await Promise.all([
        getTablaPosiciones(tId),
        getGoleadores(tId),
        getTarjetas(tId),
      ]);
      setTabla(Array.isArray(tablaData) ? tablaData : []);
      setGoleadores(Array.isArray(goleadoresData) ? goleadoresData : []);
      setTarjetas(Array.isArray(tarjetasData) ? tarjetasData : []);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas</Text>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
          {(["tabla", "goleadores", "tarjetas"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: colors.fabText }]}>
                {tab === "tabla" ? "Tabla" : tab === "goleadores" ? "Gls" : "Tarj."}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {activeTab === "tabla" ? (
            <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.columnLabel, { flex: 4, color: colors.accent }]}>Equipo</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center", color: colors.accent }]}>PJ</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center", color: colors.accent }]}>DG</Text>
                <Text style={[styles.columnLabel, { flex: 1, textAlign: "center", color: colors.accent }]}>PTS</Text>
              </View>

              {tabla.map((row, index) => (
                <View key={row.equipo_id || index} style={[styles.tableRow, { borderBottomColor: colors.cardFooterBorder }]}>
                  <View style={{ flex: 4, flexDirection: "row", alignItems: "center" }}>
                    <Text style={[styles.rankText, { color: colors.accent }]}>{index + 1}</Text>
                    <Text style={[styles.equipoName, { color: colors.text }]} numberOfLines={1}>
                      {row.equipo}
                    </Text>
                  </View>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center", color: colors.textSecondary }]}>{row.pj}</Text>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center", color: (row.dg || 0) >= 0 ? "#22c55e" : "#ef4444" }]}>
                    {(row.dg || 0) > 0 ? `+${row.dg}` : row.dg}
                  </Text>
                  <Text style={[styles.columnText, { flex: 1, textAlign: "center", fontWeight: "800", color: colors.accent }]}>
                    {row.pts}
                  </Text>
                </View>
              ))}

              {tabla.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay datos disponibles aún.</Text>
                </View>
              )}
            </View>
          ) : activeTab === "goleadores" ? (
            <View style={styles.goleadoresContainer}>
              {goleadores.map((player, index) => (
                <View key={`gol-${player.jugador_id || index}`} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={[styles.rankBadge, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.rankBadgeText, { color: colors.accent }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: colors.text }]}>{player.jugador}</Text>
                    <Text style={[styles.playerEquipo, { color: colors.textSecondary }]}>{player.equipo}</Text>
                  </View>
                  <View style={[styles.goalBadge, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.goalCount, { color: colors.accent }]}>{player.goles}</Text>
                    <Text style={[styles.goalLabel, { color: colors.accent }]}>goles</Text>
                  </View>
                </View>
              ))}

              {goleadores.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay registros de goles aún.</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.goleadoresContainer}>
              {tarjetas.map((player, index) => (
                <View key={`tarj-${player.jugador_id || index}`} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: colors.text }]}>{player.jugador}</Text>
                    <Text style={[styles.playerEquipo, { color: colors.textSecondary }]}>{player.equipo}</Text>
                  </View>

                  <View style={styles.cardIndicatorRow}>
                    {player.amarillas > 0 && (
                      <View style={[styles.cardItem, { backgroundColor: 'rgba(234, 179, 8, 0.15)', borderColor: '#eab308' }]}>
                        <View style={[styles.cardBox, { backgroundColor: '#eab308' }]} />
                        <Text style={[styles.cardCount, { color: '#eab308' }]}>{player.amarillas}</Text>
                      </View>
                    )}

                    {player.rojas > 0 && (
                      <View style={[styles.cardItem, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}>
                        <View style={[styles.cardBox, { backgroundColor: '#ef4444' }]} />
                        <Text style={[styles.cardCount, { color: '#ef4444' }]}>{player.rojas}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {tarjetas.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay registros de tarjetas aún.</Text>
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
  container: { flex: 1 },
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
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 16,
  },
  tabText: { color: "#a7f3d0", fontWeight: "700", fontSize: 14 },
  content: { flex: 1, padding: 16 },
  tableCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  columnLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  rankText: { fontWeight: "800", fontSize: 13, marginRight: 8, width: 22 },
  equipoName: { fontWeight: "700", fontSize: 15 },
  columnText: { fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 16 },
  goleadoresContainer: { paddingBottom: 40 },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rankBadgeText: { fontWeight: "900" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: "700" },
  playerEquipo: { fontSize: 13, marginTop: 2 },
  goalBadge: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  goalCount: { fontSize: 20, fontWeight: "900" },
  goalLabel: { fontSize: 10, fontWeight: "700" },
  cardIndicatorRow: { flexDirection: "row", alignItems: "center" },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  cardBox: { width: 12, height: 16, borderRadius: 2, marginRight: 6 },
  cardCount: { fontSize: 16, fontWeight: "800" },
});
