import React, { useState } from "react";
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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createTorneo } from "../../src/api/torneos";

export default function CrearTorneoScreen() {
  const [nombre, setNombre] = useState("");
  const [deporte, setDeporte] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nombre.trim() || !deporte.trim() || !modalidad.trim()) {
      Alert.alert("Campos Requeridos", "Por favor completa todos los campos del nuevo torneo.");
      return;
    }

    try {
      setLoading(true);
      const nuevoTorneo = await createTorneo({
        nombre: nombre.trim(),
        deporte: deporte.trim(),
        modalidad: modalidad.trim(),
      });
      
      Alert.alert("¡Éxito!", "Tu campeonato ha sido creado correctamente.", [
        { text: "Continuar", onPress: () => router.back() }
      ]);    } catch (error: any) {
      console.log("Error creando torneo:", error?.response?.data || error);
      Alert.alert(
        "Error al Crear", 
        error?.response?.data?.detail || "No se pudo crear el campeonato correctamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#022c22", "#064e3b"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Campeonato</Text>
          <View style={{ width: 44 }} /> 
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Torneo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="trophy-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Liga de Verano 2026"
                  placeholderTextColor="#cbd5e1"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deporte</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="football-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Fútbol"
                  placeholderTextColor="#cbd5e1"
                  value={deporte}
                  onChangeText={setDeporte}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modalidad</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Fútbol 7, Fútbol 11"
                  placeholderTextColor="#cbd5e1"
                  value={modalidad}
                  onChangeText={setModalidad}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#022c22" />
              ) : (
                <Text style={styles.buttonText}>Crear Campeonato</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    padding: 10,
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    borderRadius: 12,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#064e3b",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#064e3b",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#34d399",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#a7f3d0",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#022c22",
    fontSize: 17,
    fontWeight: "800",
  },
});
