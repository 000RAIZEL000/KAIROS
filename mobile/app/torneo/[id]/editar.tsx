import { useEffect, useState } from "react";
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
import { getTorneoById, updateTorneo } from "../../../src/api/torneos";

export default function EditarTorneoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, colors, toggleTheme } = useAppTheme();
  const [nombre, setNombre] = useState("");
  const [deporte, setDeporte] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTorneo = async () => {
      try {
        const data = await getTorneoById(String(id));
        setNombre(data.nombre);
        setDeporte(data.deporte || "");
        setModalidad(data.modalidad || "");
        setDescripcion(data.descripcion || "");
        setDireccion(data.direccion || "");
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el torneo.");
        router.back();
      } finally {
        setFetching(false);
      }
    };
    fetchTorneo();
  }, [id]);

  const handleUpdate = async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      await updateTorneo(String(id), {
        nombre: nombre.trim(),
        deporte: deporte.trim(),
        modalidad: modalidad.trim(),
        descripcion: descripcion.trim(),
        direccion: direccion.trim(),
      });

      Alert.alert("¡Éxito!", "Tu campeonato ha sido actualizado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el torneo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.headerTitle, { flex: 1 }]}>Editar Torneo</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={20} color="#f8fafc" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.text }]}>Nombre del Torneo *</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del torneo"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Deporte</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={deporte}
              onChangeText={setDeporte}
              placeholder="Ej: Fútbol"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Modalidad</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={modalidad}
              onChangeText={setModalidad}
              placeholder="Ej: Fútbol 7"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Dirección</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ubicación"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Descripción</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text }]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Detalles adicionales..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.fabBg }, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.fabText} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.fabText }]}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
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
  themeBtn: { backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 12, marginLeft: 8 },
  headerTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800" },
  form: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },
  textAreaContainer: {
    height: 100,
    paddingVertical: 10,
  },
  input: { fontSize: 16 },
  textArea: {
    height: "100%",
    textAlignVertical: "top",
  },
  button: {
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 4,
  },
  buttonText: { fontSize: 17, fontWeight: "800" },
});
