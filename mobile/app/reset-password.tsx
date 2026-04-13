import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/api/client";

export default function ResetPasswordScreen() {
  const { telefono } = useLocalSearchParams<{ telefono: string }>();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp.trim()) {
      Alert.alert("Campo requerido", "Ingresa el código de 4 dígitos que recibiste.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        telefono,
        otp: otp.trim(),
        new_password: newPassword,
      });

      Alert.alert("¡Contraseña Actualizada!", "Tu contraseña fue cambiada exitosamente.", [
        { text: "Ir al Login", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Código inválido o expirado.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={40} color="#38bdf8" />
        </View>

        <Text style={styles.title}>Nueva Contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 4 dígitos que recibiste por SMS y tu nueva contraseña.
        </Text>

        <View style={styles.card}>
          {/* Código OTP */}
          <Text style={styles.label}>Código SMS</Text>
          <View style={styles.otpRow}>
            <TextInput
              style={styles.otpInput}
              placeholder="0000"
              placeholderTextColor="#64748b"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />
          </View>

          {/* Nueva contraseña */}
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#64748b"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          {/* Confirmar contraseña */}
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#f8fafc", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94a3b8", textAlign: "center", marginBottom: 28, lineHeight: 20 },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  label: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  otpRow: { alignItems: "center", marginBottom: 8 },
  otpInput: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#38bdf8",
    width: 160,
    height: 56,
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    paddingHorizontal: 14,
    height: 50,
  },
  input: { flex: 1, color: "#f8fafc", fontSize: 15 },
  button: {
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
});
