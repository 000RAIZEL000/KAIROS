import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../../src/context/ThemeContext";
import { getJugadorById, updateJugador } from "../../../src/api/jugadores";

export default function EditarJugadorScreen() {
  const { jugadorId, equipoId, torneoId } = useLocalSearchParams<{
    jugadorId: string;
    equipoId: string;
    torneoId: string;
  }>();
  const { colors } = useAppTheme();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [posicion, setPosicion] = useState("");
  const [numeroCamiseta, setNumeroCamiseta] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cargarJugador();
  }, [jugadorId]);

  const cargarJugador = async () => {
    try {
      setLoadingData(true);
      const data = await getJugadorById(String(jugadorId));

      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setPosicion(data.posicion || "");
      setNumeroCamiseta(data.numero_camiseta != null ? String(data.numero_camiseta) : "");
      setActivo(Boolean(data.activo));
    } catch (err: any) {
      Alert.alert("Error", "No se pudo cargar el jugador");
    } finally {
      setLoadingData(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Validación", "Nombre y apellido son obligatorios");
      return;
    }

    try {
      setLoading(true);

      await updateJugador(String(jugadorId), {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        posicion: posicion.trim() || null,
        numero_camiseta: numeroCamiseta ? Number(numeroCamiseta) : null,
        activo,
      });

      Alert.alert("¡Éxito!", "Tu jugador ha sido actualizado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", "No se pudo actualizar el jugador");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Jugador</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Apellido</Text>
        <TextInput
          value={apellido}
          onChangeText={setApellido}
          placeholder="Apellido"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Posición</Text>
        <TextInput
          value={posicion}
          onChangeText={setPosicion}
          placeholder="Posición"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Número de camiseta</Text>
        <TextInput
          value={numeroCamiseta}
          onChangeText={setNumeroCamiseta}
          placeholder="10"
          keyboardType="numeric"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
        />

        <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>Activo</Text>
          <Switch value={activo} onValueChange={setActivo} trackColor={{ true: colors.accent }} />
        </View>

        <Pressable
          onPress={handleGuardar}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.fabBg }, loading && { opacity: 0.7 }]}
        >
          <Text style={[styles.buttonText, { color: colors.fabText }]}>
            {loading ? "Guardando..." : "Actualizar jugador"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 8,
    borderRadius: 10,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  form: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: "700", marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 4,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  switchLabel: { fontWeight: "700" },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { fontWeight: "800", fontSize: 16 },
});
