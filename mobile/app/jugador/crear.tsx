import { useState } from "react";
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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../src/context/ThemeContext";
import { createJugador } from "../../src/api/jugadores";

export default function CrearJugadorScreen() {
  const { equipoId, torneoId } = useLocalSearchParams<{
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

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Validación", "Nombre y apellido son obligatorios");
      return;
    }

    try {
      setLoading(true);

      await createJugador({
        equipo_id: Number(equipoId),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        posicion: posicion.trim() || null,
        numero_camiseta: numeroCamiseta ? Number(numeroCamiseta) : null,
        activo,
      });

      Alert.alert("¡Éxito!", "Tu jugador ha sido creado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.log("ERROR crear jugador:", err?.message);
      Alert.alert("Error", "No se pudo crear el jugador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Jugador</Text>
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
          placeholder="Defensa, Arquero, Delantero..."
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
            {loading ? "Guardando..." : "Guardar jugador"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
