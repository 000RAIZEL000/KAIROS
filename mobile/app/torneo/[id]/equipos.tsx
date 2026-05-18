import { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Alert,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../src/context/AuthContext";
import { useAppTheme } from "../../../src/context/ThemeContext";
import { getEquiposByTorneo, deleteEquipo } from "../../../src/api/equipos";
import type { Equipo } from "../../../src/api/equipos";

export default function EquiposScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useAppTheme();
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

  useFocusEffect(useCallback(() => {
    setLoading(true);
    cargarEquipos().finally(() => setLoading(false));
  }, [id]));

  const onRefresh = async () => { setRefreshing(true); await cargarEquipos(); setRefreshing(false); };

  const handleDeleteEquipo = (equipoId: number, nombre: string) => {
    Alert.alert("Eliminar Equipo", `¿Seguro que deseas eliminar "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "ELIMINAR", style: "destructive",
        onPress: async () => {
          try {
            await deleteEquipo(String(equipoId));
            Alert.alert("¡Éxito!", "Equipo eliminado correctamente.");
            cargarEquipos();
          } catch {
            Alert.alert("Error", "No se pudo eliminar el equipo.");
          }
        },
      },
    ]);
  };

  const renderEquipo = ({ item }: { item: Equipo }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={styles.cardBody} activeOpacity={0.7}
        onPress={() => router.push({ pathname: "/torneo/[id]/[equipoId]", params: { id: String(id), equipoId: String(item.id) } })}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.colorDot, { backgroundColor: item.color_principal || "#34d399" }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.nombre}</Text>
            {item.grupo && <Text style={[styles.cardGroup, { color: colors.textSecondary }]}>Grupo {item.grupo}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {user?.role === "admin" && (
        <View style={[styles.adminActions, { backgroundColor: colors.cardFooterBg, borderTopColor: colors.cardFooterBorder }]}>
          <TouchableOpacity style={styles.actionBtn}
            onPress={() => router.push({ pathname: "/torneo/[id]/equipos/[equipoId]/editar", params: { id: String(id), equipoId: String(item.id) } })}>
            <Ionicons name="create-outline" size={18} color={colors.accentDark} />
            <Text style={[styles.actionBtnText, { color: colors.accentDark }]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderLeftWidth: 1, borderLeftColor: colors.cardFooterBorder }]}
            onPress={() => handleDeleteEquipo(item.id, item.nombre)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
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
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={equipos} keyExtractor={(item) => String(item.id)} renderItem={renderEquipo}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay equipos registrados.</Text>
                {user?.role === "admin" && <Text style={[styles.emptyHint, { color: colors.accent }]}>Toca "+" para crear uno.</Text>}
              </View>
            }
          />
        )}
      </View>

      {user?.role === "admin" && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.fabBg }]}
          onPress={() => router.push({ pathname: "/torneo/[id]/crear-equipo", params: { id: String(id) } })}
          activeOpacity={0.8}>
          <Ionicons name="add" size={26} color={colors.fabText} style={{ marginRight: 4 }} />
          <Text style={[styles.fabText, { color: colors.fabText }]}>Equipo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: Platform.OS === "ios" ? 50 : 36, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { backgroundColor: "rgba(52,211,153,0.1)", padding: 8, borderRadius: 10, marginRight: 14 },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "#a7f3d0", fontSize: 13, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  listContainer: { paddingBottom: 100 },
  card: { borderRadius: 14, marginBottom: 10, borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, overflow: "hidden" },
  cardBody: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adminActions: { flexDirection: "row", borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  actionBtnText: { fontSize: 13, fontWeight: "700", marginLeft: 6 },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardGroup: { fontSize: 12, marginTop: 2 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: "center" },
  emptyHint: { fontSize: 13, marginTop: 8 },
  fab: { position: "absolute", bottom: 24, right: 24, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, height: 56, borderRadius: 28, elevation: 8, shadowColor: "#34d399", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { fontSize: 16, fontWeight: "800" },
});
