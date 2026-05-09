import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { forgotPassword } from "../src/api/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      if (Platform.OS === 'web') window.alert("Ingresa tu correo");
      else Alert.alert("Error", "Ingresa tu correo");
      return;
    }

    try {
      setLoading(true);
      console.log(`📤 Enviando recuperación a: ${email}`);
      const response = await forgotPassword(email.trim());

      const msg = response.token
        ? `aca esta el numero de confirmacion: ${response.token} \n\nCópialo para ponerlo en el siguiente campo.`
        : response.message || "Solicitud enviada";

      // Imprimir el código en la terminal de Expo
      if (response.token) {
        console.log(`\n-------------------------------------------`);
        console.log(`🔑 Aca esta el numero de confirmacion: ${response.token}`);
        console.log(`-------------------------------------------\n`);
      }

      if (Platform.OS === 'web') {
        window.alert(msg);
        router.push({ pathname: "/reset-password", params: { email: email.trim(), prefilledToken: response.token } });
      } else {
        Alert.alert(
          "Recuperación",
          msg,
          [{ text: "OK", onPress: () => router.push({ pathname: "/reset-password", params: { email: email.trim(), prefilledToken: response.token } }) }]
        );
      }
    } catch (error: any) {
      let errorMsg = "No hay conexión con el servidor. Revisa tu Wi-Fi.";
      if (error?.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map((err: any) => err.msg).join("\n");
        } else {
          errorMsg = "No se pudo procesar la solicitud";
        }
      }
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert("Error", errorMsg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#022c22" }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={40} color="#34d399" />
          </View>

          <Text style={styles.title}>Recuperar Clave</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un token de validación.
          </Text>

          <View style={styles.glassCard}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#022c22" />
              ) : (
                <Text style={styles.buttonText}>Enviar Recuperación</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 0,
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 10,
    borderRadius: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#94a3b8", textAlign: "center", marginBottom: 32, lineHeight: 22 },
  glassCard: {
    backgroundColor: "rgba(6, 78, 59, 0.6)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
  },
  label: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 44, 34, 0.6)",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.1)",
    marginBottom: 24,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#f8fafc", fontSize: 16 },
  button: {
    backgroundColor: "#34d399",
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#022c22", fontSize: 16, fontWeight: "800" },
});