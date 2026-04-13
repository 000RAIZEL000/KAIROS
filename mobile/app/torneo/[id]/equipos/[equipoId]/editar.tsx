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
import { getEquipoById, updateEquipo } from "@/src/api/equipos";

export default function EditarEquipoScreen() {
  const { id, equipoId } = useLocalSearchParams<{ id: string; equipoId: string }>();
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [colorPrincipal, setColorPrincipal] = useState("");
  const [colorSecundario, setColorSecundario] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        const data = await getEquipoById(String(equipoId));
        setNombre(data.nombre);
        setGrupo(data.grupo || "");
        setColorPrincipal(data.color_principal || "");
        setColorSecundario(data.color_secundario || "");
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el equipo.");
        router.back();
      } finally {
        setFetching(false);
      }
    };
    fetchEquipo();
  }, [equipoId]);

  const handleUpdate = async () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre del equipo es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      await updateEquipo(String(equipoId), {
        nombre: nombre.trim(),
        grupo: grupo.trim() || null,
        color_principal: colorPrincipal.trim() || null,
        color_secundario: colorSecundario.trim() || null,
      });

      Alert.alert("¡Éxito!", "Tu equipo ha sido actualizado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el equipo.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Equipo</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Nombre del Equipo *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del equipo"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Grupo</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={grupo}
              onChangeText={setGrupo}
              placeholder="Ej: A"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Color Principal</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={colorPrincipal}
              onChangeText={setColorPrincipal}
              placeholder="Ej: #38bdf8"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Color Secundario</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={colorSecundario}
              onChangeText={setColorSecundario}
              placeholder="Ej: #ffffff"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Actualizar Equipo</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 10,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800" },
  form: { padding: 20, paddingBottom: 40 },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },
  input: { color: "#0f172a", fontSize: 16 },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 4,
  },
  buttonText: { color: "#0f172a", fontSize: 17, fontWeight: "800" },
});
