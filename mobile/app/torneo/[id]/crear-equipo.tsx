import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../../src/context/ThemeContext";
import { createEquipo } from "../../../src/api/equipos";

export default function CrearEquipoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [colorPrincipal, setColorPrincipal] = useState("");
  const [colorSecundario, setColorSecundario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del equipo es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      await createEquipo({
        torneo_id: Number(id),
        nombre: nombre.trim(),
        grupo: grupo.trim() || null,
        color_principal: colorPrincipal.trim() || null,
        color_secundario: colorSecundario.trim() || null,
      });

      Alert.alert("¡Éxito!", "Tu equipo ha sido creado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "No se pudo crear el equipo.";
      Alert.alert("Error al Crear", msg);
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
          <Text style={styles.headerTitle}>Nuevo Equipo</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.text }]}>Nombre del Equipo *</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="shield-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej: Real Madrid FC"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Grupo (opcional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="grid-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej: A, B, C..."
              placeholderTextColor={colors.textMuted}
              value={grupo}
              onChangeText={setGrupo}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Color Principal (opcional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="color-palette-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej: Azul, Rojo, #FF0000"
              placeholderTextColor={colors.textMuted}
              value={colorPrincipal}
              onChangeText={setColorPrincipal}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Color Secundario (opcional)</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <Ionicons name="color-fill-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej: Blanco, Negro"
              placeholderTextColor={colors.textMuted}
              value={colorSecundario}
              onChangeText={setColorSecundario}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.fabBg }, loading && { opacity: 0.7 }]}
            onPress={handleCrear}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.fabText} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={colors.fabText} style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, { color: colors.fabText }]}>Crear Equipo</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  button: {
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 4,
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { fontSize: 17, fontWeight: "800" },
});
