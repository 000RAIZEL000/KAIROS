import { useState, useCallback } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTorneos } from "../src/api/torneos";
import { useAppTheme } from "../src/context/ThemeContext";
import type { Torneo } from "../src/types/torneo";

export default function PublicTorneosScreen() {
  const { theme, colors, toggleTheme } = useAppTheme();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarTorneos = async () => {
    try {
      const data = await getTorneos();
      setTorneos(data);
    } catch (error) {
      console.log("Error cargando torneos públicos", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTorneos();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarTorneos();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerGradientEnd }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.textOnHeader }]}>Torneos Disponibles</Text>
            <Text style={[styles.headerSub, { color: colors.textOnHeaderSoft }]}>Sigue de cerca las competiciones</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
              <Ionicons
                name={theme === "dark" ? "sunny-outline" : "moon-outline"}
                size={22}
                color={colors.textOnHeader}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginBtn}>
              <Ionicons name="person-circle-outline" size={32} color="#34d399" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#34d399" />
        </View>
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34d399" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={60} color="#065f46" />
              <Text style={styles.emptyText}>No hay torneos activos aún.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => {
                if (Platform.OS === "web") {
                  if (window.confirm("Debes iniciar sesión para ver los detalles. ¿Ir al Login?")) {
                    router.push("/login");
                  }
                } else {
                  Alert.alert(
                    "Acceso Restringido",
                    "Debes iniciar sesión para ver los partidos, goles y estadísticas de este torneo.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Iniciar Sesión", onPress: () => router.push("/login") }
                    ]
                  );
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="football" size={24} color={colors.accent} />
                <View style={[styles.statusBadge, { backgroundColor: item.estado === 'Activo' ? colors.badgeBg : 'rgba(148, 163, 184, 0.2)' }]}>
                  <Text style={[styles.statusText, { color: item.estado === 'Activo' ? colors.badgeText : colors.textOnHeader }]}>{item.estado}</Text>
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.textOnHeader }]}>{item.nombre}</Text>
              <Text style={[styles.cardInfo, { color: colors.textOnHeaderSoft }]}>{item.deporte} • {item.modalidad}</Text>
              <View style={[styles.cardFooter, { borderTopColor: colors.cardFooterBorder }]}>
                <Ionicons name="person-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.viewStatsText, { color: colors.textMuted }]}>Requiere inicio de sesión</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </View>
            </TouchableOpacity>
          )}
        />
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
    backgroundColor: "#064e3b",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 12,
  },
  loginBtn: {
    padding: 4,
  },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "900" },
  headerSub: { color: "#a7f3d0", fontSize: 13, marginTop: 2 },
  listContainer: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#064e3b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.15)",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  cardTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  cardInfo: { color: "#a7f3d0", fontSize: 14, marginBottom: 16 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(52, 211, 153, 0.1)" },
  viewStatsText: { color: "#64748b", fontSize: 13, fontWeight: "600", marginRight: 4 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { color: "#64748b", fontSize: 16, marginTop: 16 },
});
