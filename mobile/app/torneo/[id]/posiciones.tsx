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

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getMedal(index: number): string | null {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return null;
}

const AVATAR_COLORS = ["#059669", "#0891b2", "#7c3aed", "#dc2626", "#d97706", "#4f46e5"];

export default function PosicionesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, colors, toggleTheme } = useAppTheme();
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
          <Text style={[styles.headerTitle, { flex: 1 }]}>Estadísticas</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={20} color="#f8fafc" />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
          {(["tabla", "goleadores", "tarjetas"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: colors.fabText }]}>
                {tab === "tabla" ? "Tabla" : tab === "goleadores" ? "Gols" : "Tarj."}
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
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >

          {/* ── TABLA ── */}
          {activeTab === "tabla" && (
            <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header */}
                  <View style={[styles.tableHeaderRow, { borderBottomColor: colors.cardBorder }]}>
                    <Text style={[styles.colEquipo, styles.colLabel, { color: colors.accent }]}>Equipo</Text>
                    {(["PJ","PG","PE","PP","GF","GC","DG","PTS"] as const).map(col => (
                      <Text
                        key={col}
                        style={[
                          col === "PTS" ? styles.colPts : styles.colStat,
                          styles.colLabel,
                          { color: colors.accent },
                        ]}
                      >
                        {col}
                      </Text>
                    ))}
                  </View>

                  {tabla.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="trophy-outline" size={40} color={colors.textMuted} />
                      <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin datos disponibles aún.</Text>
                    </View>
                  ) : tabla.map((row, index) => (
                    <View
                      key={row.equipo_id ?? index}
                      style={[
                        styles.tableDataRow,
                        { borderBottomColor: colors.cardFooterBorder },
                        index === tabla.length - 1 && { borderBottomWidth: 0 },
                        index < 3 && { backgroundColor: colors.accentSoft + "60" },
                      ]}
                    >
                      <View style={styles.colEquipo}>
                        <Text style={[styles.rankNum, { color: colors.accent }]}>{index + 1}</Text>
                        <Text style={[styles.equipoNameText, { color: colors.text }]} numberOfLines={1}>
                          {row.equipo}
                        </Text>
                      </View>
                      <Text style={[styles.colStat, styles.colText, { color: colors.textSecondary }]}>{row.pj}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: "#22c55e", fontWeight: "700" }]}>{row.pg}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: colors.textSecondary }]}>{row.pe}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: "#ef4444" }]}>{row.pp}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: colors.textSecondary }]}>{row.gf}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: colors.textSecondary }]}>{row.gc}</Text>
                      <Text style={[styles.colStat, styles.colText, { color: (row.dg ?? 0) >= 0 ? "#22c55e" : "#ef4444" }]}>
                        {(row.dg ?? 0) > 0 ? `+${row.dg}` : row.dg}
                      </Text>
                      <Text style={[styles.colPts, styles.colText, { color: colors.accent, fontWeight: "900", fontSize: 15 }]}>
                        {row.pts}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* ── GOLEADORES ── */}
          {activeTab === "goleadores" && (
            <View>
              {goleadores.length === 0 ? (
                <View style={[styles.emptyState, { marginTop: 60 }]}>
                  <Ionicons name="football-outline" size={52} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros de goles aún.</Text>
                </View>
              ) : goleadores.map((player, index) => {
                const medal = getMedal(index);
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                return (
                  <View
                    key={`gol-${player.jugador_id ?? index}`}
                    style={[
                      styles.playerCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      index < 3 && { borderColor: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : "#b45309" },
                    ]}
                  >
                    <View style={styles.rankCol}>
                      {medal ? (
                        <Text style={styles.medalText}>{medal}</Text>
                      ) : (
                        <View style={[styles.rankBadge, { backgroundColor: colors.accentSoft }]}>
                          <Text style={[styles.rankBadgeText, { color: colors.accent }]}>{index + 1}</Text>
                        </View>
                      )}
                    </View>

                    <View style={[styles.avatarCircle, { backgroundColor: avatarColor + "28" }]}>
                      <Text style={[styles.avatarText, { color: avatarColor }]}>
                        {getInitials(player.jugador)}
                      </Text>
                    </View>

                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                        {player.jugador}
                      </Text>
                      <Text style={[styles.playerEquipo, { color: colors.textSecondary }]} numberOfLines={1}>
                        {player.equipo ?? "—"}
                      </Text>
                    </View>

                    <View style={[styles.goalBadge, { backgroundColor: colors.accentSoft }]}>
                      <Text style={[styles.goalCount, { color: colors.accent }]}>{player.goles}</Text>
                      <Text style={[styles.goalLabel, { color: colors.accent }]}>gols</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── TARJETAS ── */}
          {activeTab === "tarjetas" && (
            <View>
              {tarjetas.length === 0 ? (
                <View style={[styles.emptyState, { marginTop: 60 }]}>
                  <Ionicons name="square-outline" size={52} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros de tarjetas aún.</Text>
                </View>
              ) : tarjetas.map((player, index) => {
                const medal = getMedal(index);
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                return (
                  <View
                    key={`tarj-${player.jugador_id ?? index}`}
                    style={[
                      styles.playerCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      index < 3 && { borderColor: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : "#b45309" },
                    ]}
                  >
                    <View style={styles.rankCol}>
                      {medal ? (
                        <Text style={styles.medalText}>{medal}</Text>
                      ) : (
                        <View style={[styles.rankBadge, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
                          <Text style={[styles.rankBadgeText, { color: "#ef4444" }]}>{index + 1}</Text>
                        </View>
                      )}
                    </View>

                    <View style={[styles.avatarCircle, { backgroundColor: avatarColor + "28" }]}>
                      <Text style={[styles.avatarText, { color: avatarColor }]}>
                        {getInitials(player.jugador)}
                      </Text>
                    </View>

                    <View style={styles.playerInfo}>
                      <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                        {player.jugador}
                      </Text>
                      <Text style={[styles.playerEquipo, { color: colors.textSecondary }]} numberOfLines={1}>
                        {player.equipo ?? "—"}
                      </Text>
                    </View>

                    <View style={styles.cardIndicatorRow}>
                      {player.amarillas > 0 && (
                        <View style={[styles.cardChip, { backgroundColor: "rgba(234,179,8,0.15)", borderColor: "#eab308" }]}>
                          <View style={[styles.cardBox, { backgroundColor: "#eab308" }]} />
                          <Text style={[styles.cardCount, { color: "#eab308" }]}>{player.amarillas}</Text>
                        </View>
                      )}
                      {player.rojas > 0 && (
                        <View style={[styles.cardChip, { backgroundColor: "rgba(239,68,68,0.15)", borderColor: "#ef4444" }]}>
                          <View style={[styles.cardBox, { backgroundColor: "#ef4444" }]} />
                          <Text style={[styles.cardCount, { color: "#ef4444" }]}>{player.rojas}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
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
  backBtn: { backgroundColor: "rgba(52,211,153,0.1)", padding: 8, borderRadius: 12, marginRight: 14 },
  themeBtn: { backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 12, marginLeft: 8 },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  tabContainer: { flexDirection: "row", borderRadius: 20, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 16 },
  tabText: { color: "#a7f3d0", fontWeight: "700", fontSize: 14 },
  content: { flex: 1, padding: 16 },

  // Tabla
  tableCard: { borderRadius: 20, padding: 16, borderWidth: 1, overflow: "hidden" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 4,
    alignItems: "center",
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 11,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  colEquipo: { width: 128, flexDirection: "row", alignItems: "center" },
  colStat: { width: 34, textAlign: "center" },
  colPts: { width: 38, textAlign: "center" },
  colLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  colText: { fontSize: 13, fontWeight: "600" },
  rankNum: { fontWeight: "900", fontSize: 13, width: 22 },
  equipoNameText: { fontWeight: "700", fontSize: 13, flex: 1 },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 15, marginTop: 10, textAlign: "center" },

  // Player cards
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  rankCol: { width: 38, alignItems: "center", marginRight: 6 },
  medalText: { fontSize: 24 },
  rankBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  rankBadgeText: { fontWeight: "900", fontSize: 13 },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "800", fontSize: 14 },
  playerInfo: { flex: 1, marginRight: 8 },
  playerName: { fontSize: 15, fontWeight: "700" },
  playerEquipo: { fontSize: 12, marginTop: 2 },

  // Goleadores
  goalBadge: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, minWidth: 52 },
  goalCount: { fontSize: 20, fontWeight: "900" },
  goalLabel: { fontSize: 10, fontWeight: "700" },

  // Tarjetas
  cardIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardBox: { width: 10, height: 14, borderRadius: 2, marginRight: 5 },
  cardCount: { fontSize: 15, fontWeight: "800" },
});
