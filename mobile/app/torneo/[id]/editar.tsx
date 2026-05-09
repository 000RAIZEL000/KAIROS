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
import { getTorneoById, updateTorneo } from "../../../src/api/torneos";

export default function EditarTorneoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#022c22", "#064e3b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Torneo</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Nombre del Torneo *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del torneo"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Deporte</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={deporte}
              onChangeText={setDeporte}
              placeholder="Ej: Fútbol"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Modalidad</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={modalidad}
              onChangeText={setModalidad}
              placeholder="Ej: Fútbol 7"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Dirección</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ubicación"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={styles.label}>Descripción</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Detalles adicionales..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
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
  headerTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800" },
  form: { padding: 20, paddingBottom: 40 },
  label: {
    color: "#064e3b",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },
  textAreaContainer: {
    height: 100,
    paddingVertical: 10,
  },
  input: { color: "#064e3b", fontSize: 16 },
  textArea: {
    height: "100%",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#34d399",
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    elevation: 4,
  },
  buttonText: { color: "#022c22", fontSize: 17, fontWeight: "800" },
});
