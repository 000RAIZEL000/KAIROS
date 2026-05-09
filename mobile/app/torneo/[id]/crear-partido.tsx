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
import { getEquiposByTorneo } from "../../../src/api/equipos";
import type { Equipo } from "../../../src/api/equipos";
import { createPartido } from "../../../src/api/partidos";

export default function CrearPartidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [localId, setLocalId] = useState<number | null>(null);
  const [visitanteId, setVisitanteId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [cancha, setCancha] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const data = await getEquiposByTorneo(String(id));
        setEquipos(data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los equipos.");
      } finally {
        setFetching(false);
      }
    };
    fetchEquipos();
  }, [id]);

  const handleCrear = async () => {
    if (!localId || !visitanteId) {
      Alert.alert("Error", "Selecciona ambos equipos.");
      return;
    }
    if (localId === visitanteId) {
      Alert.alert("Error", "Un equipo no puede jugar contra sí mismo.");
      return;
    }

    try {
      setLoading(true);
      await createPartido({
        torneo_id: Number(id),
        equipo_local_id: localId,
        equipo_visitante_id: visitanteId,
        fecha: fecha.trim() || null,
        cancha: cancha.trim() || null,
        estado: "Pendiente",
      });

      Alert.alert("¡Éxito!", "Tu partido ha sido creado correctamente.", [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "No se pudo crear el partido.";
      Alert.alert("Error", msg);
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
          <Text style={styles.headerTitle}>Programar Partido</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.label}>Equipo Local</Text>
          <View style={styles.pickerContainer}>
            {equipos.map((e) => (
              <TouchableOpacity
                key={`local-${e.id}`}
                style={[styles.pickerItem, localId === e.id && styles.pickerItemActive]}
                onPress={() => setLocalId(e.id)}
              >
                <Text style={[styles.pickerText, localId === e.id && styles.pickerTextActive]}>{e.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Equipo Visitante</Text>
          <View style={styles.pickerContainer}>
            {equipos.map((e) => (
              <TouchableOpacity
                key={`visit-${e.id}`}
                style={[styles.pickerItem, visitanteId === e.id && styles.pickerItemActive]}
                onPress={() => setVisitanteId(e.id)}
              >
                <Text style={[styles.pickerText, visitanteId === e.id && styles.pickerTextActive]}>{e.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Fecha (Opcional - YYYY-MM-DD)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="2023-12-31"
              placeholderTextColor="#6ee7b7"
              value={fecha}
              onChangeText={setFecha}
            />
          </View>

          <Text style={styles.label}>Campo / Cancha (Opcional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Cancha Central"
              placeholderTextColor="#6ee7b7"
              value={cancha}
              onChangeText={setCancha}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleCrear}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.buttonText}>Programar Encuentro</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#022c22" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "900" },
  form: { padding: 20 },
  label: { color: "#d1fae5", fontSize: 13, fontWeight: "700", marginBottom: 10, marginTop: 16, textTransform: "uppercase" },
  pickerContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerItem: {
    backgroundColor: "#064e3b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
  },
  pickerItemActive: { backgroundColor: "#34d399", borderColor: "#34d399" },
  pickerText: { color: "#a7f3d0", fontWeight: "600", fontSize: 14 },
  pickerTextActive: { color: "#022c22" },
  inputContainer: {
    backgroundColor: "#064e3b",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
    paddingHorizontal: 16,
    height: 52,
    justifyContent: "center",
  },
  input: { color: "#f8fafc", fontSize: 16 },
  button: {
    backgroundColor: "#34d399",
    borderRadius: 16,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 34,
    elevation: 4,
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: { color: "#022c22", fontSize: 17, fontWeight: "900" },
});
