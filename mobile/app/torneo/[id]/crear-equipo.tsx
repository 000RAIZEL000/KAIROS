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
import { createEquipo } from "../../../src/api/equipos";

export default function CrearEquipoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        {
          text: "Continuar",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "No se pudo crear el equipo.";
      Alert.alert("Error al Crear", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#022c22", "#064e3b"]} style={styles.header}>
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
          {/* Nombre */}
          <Text style={styles.label}>Nombre del Equipo *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Real Madrid FC"
              placeholderTextColor="#94a3b8"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* Grupo */}
          <Text style={styles.label}>Grupo (opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="grid-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: A, B, C..."
              placeholderTextColor="#94a3b8"
              value={grupo}
              onChangeText={setGrupo}
            />
          </View>

          {/* Color Principal */}
          <Text style={styles.label}>Color Principal (opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="color-palette-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Azul, Rojo, #FF0000"
              placeholderTextColor="#94a3b8"
              value={colorPrincipal}
              onChangeText={setColorPrincipal}
            />
          </View>

          {/* Color Secundario */}
          <Text style={styles.label}>Color Secundario (opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="color-fill-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Blanco, Negro"
              placeholderTextColor="#94a3b8"
              value={colorSecundario}
              onChangeText={setColorSecundario}
            />
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCrear}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#022c22" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Crear Equipo</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
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
    color: "#064e3b",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: "#064e3b", fontSize: 15 },
  button: {
    backgroundColor: "#34d399",
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
  buttonText: { color: "#022c22", fontSize: 17, fontWeight: "800" },
});
