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
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { getTorneos, deleteTorneo } from "../src/api/torneos";
import type { Torneo } from "../src/types/torneo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ProfileModal from "../src/components/ProfileModal";

function getInitials(str?: string | null): string {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str.substring(0, 2).toUpperCase();
}

export default function HomeScreen() {
  const { user, profilePhoto } = useAuth();
  const { theme, colors, toggleTheme } = useAppTheme();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

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
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/torneo/${item.id}`)}
        style={{ padding: 16 }}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.nombre}</Text>
          <View style={[styles.badge, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
            <Text style={[styles.badgeText, { color: colors.accentDark }]}>{item.estado}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.cardInfo, { color: colors.textSecondary }]}>⚽ {item.deporte} • 🏆 {item.modalidad}</Text>
            {item.descripcion && (
              <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={2}>
                {item.descripcion}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.accent} />
        </View>
      </TouchableOpacity>

      {user?.role === "admin" && (
        <View style={[styles.adminActions, { borderTopColor: colors.cardFooterBorder, backgroundColor: colors.cardFooterBg }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({
              pathname: "/torneo/[id]/editar",
              params: { id: String(item.id) }
            })}
          >
            <Ionicons name="create-outline" size={18} color={colors.accentDark} />
            <Text style={[styles.actionBtnText, { color: colors.accentDark }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { borderLeftWidth: 1, borderLeftColor: colors.cardFooterBorder }]}
            onPress={() => handleDeleteTorneo(item.id, item.nombre)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerTop}>
          {/* Avatar de perfil */}
          <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.avatarBtn}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: "#34d399" }]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(user?.nombre || user?.email)}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Saludo */}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.greeting, { color: colors.textOnHeaderSoft }]}>Hola,</Text>
            <Text style={[styles.userName, { color: colors.textOnHeader }]}>
              {user?.nombre || user?.email?.split("@")[0] || "Usuario"}
            </Text>
            {user?.role === "admin" && (
              <Text style={styles.adminBadge}>ADMINISTRADOR</Text>
            )}
          </View>

          {/* Acciones */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.headerBtn}>
              <Ionicons
                name={theme === "dark" ? "sunny-outline" : "moon-outline"}
                size={22}
                color={colors.textOnHeader}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Campeonatos Activos</Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={torneos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTorneo}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={60} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay campeonatos disponibles en este momento.</Text>
              </View>
            }
          />
        )}
      </View>

      {user?.role === "admin" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.fabBg }]}
          onPress={() => router.push("/torneo/crear")}
          activeOpacity={0.8}
        >
          <Ionicons name="trophy" size={24} color={colors.fabText} style={{ marginRight: 6 }} />
          <Text style={[styles.fabText, { color: colors.fabText }]}>Nuevo</Text>
        </TouchableOpacity>
      )}

      <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 20,
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
    alignItems: "center",
  },
  avatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#022c22",
    fontSize: 18,
    fontWeight: "900",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 1,
  },
  adminBadge: {
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    color: "#34d399",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  listContainer: { paddingBottom: 100 },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  adminActions: { flexDirection: "row", borderTopWidth: 1 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionBtnText: { fontSize: 14, fontWeight: "700", marginLeft: 6 },
  deleteBtnText: { fontSize: 14, fontWeight: "700", marginLeft: 6 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  cardInfo: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  cardDesc: { fontSize: 13 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 16, marginTop: 16, textAlign: "center" },
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
