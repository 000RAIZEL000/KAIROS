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

import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../src/api/auth";


export default function ResetPasswordScreen() {
  const { email, prefilledToken } = useLocalSearchParams<{ email: string, prefilledToken?: string }>();
  const [token, setToken] = useState(prefilledToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim()) {
      if (Platform.OS === 'web') window.alert("Ingresa el token de validación.");
      else Alert.alert("Campo requerido", "Ingresa el token de validación.");
      return;
    }
    if (newPassword.length < 6) {
      if (Platform.OS === 'web') window.alert("La contraseña debe tener al menos 6 caracteres.");
      else Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') window.alert("Las contraseñas no coinciden.");
      else Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      if (!email) {
        throw new Error("No se encontró el correo electrónico. Por favor, intenta de nuevo desde 'Olvidé mi contraseña'.");
      }
      
      await resetPassword(email, token.trim(), newPassword);


      if (Platform.OS === 'web') {
        window.alert("¡Contraseña Actualizada!\nTu contraseña fue cambiada exitosamente.");
        router.replace("/login");
      } else {
        Alert.alert("¡Contraseña Actualizada!", "Tu contraseña fue cambiada exitosamente.", [
          { text: "Ir al Login", onPress: () => router.replace("/login") },
        ]);
      }
    } catch (error: any) {
      let msg = "No se pudo conectar con el servidor. Verifica tu conexión.";
      if (error?.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail.map((err: any) => err.msg).join("\n");
        } else {
          msg = "Token o código inválido.";
        }
      }
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert("Error", msg);
    } finally {

      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#022c22" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={40} color="#34d399" />
        </View>

        <Text style={styles.title}>Nueva Contraseña</Text>
        <Text style={styles.subtitle}>
          {prefilledToken 
            ? "Token ingresado automáticamente. Solo ingresa tu nueva contraseña." 
            : "Ingresa el token generado y tu nueva contraseña."}
        </Text>
        {email && <Text style={styles.emailDisplay}>{email}</Text>}

        <View style={styles.card}>
          {/* Token (Visible pero bloqueado si viene prellenado) */}
          <Text style={styles.label}>Token de Validación</Text>
          <View style={[styles.inputContainer, prefilledToken ? { backgroundColor: "rgba(52, 211, 153, 0.1)" } : {}]}>
            <Ionicons name={prefilledToken ? "lock-closed-outline" : "key-outline"} size={20} color={prefilledToken ? "#34d399" : "#94a3b8"} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, prefilledToken ? { color: "#34d399", fontWeight: "bold" } : {}]}
              placeholder="0000"
              placeholderTextColor="#64748b"
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
              maxLength={4}
              autoCapitalize="none"
              editable={!prefilledToken} // Solo se edita si no viene prellenado
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
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.buttonText}>Cambiar Contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 20,
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
  title: { fontSize: 26, fontWeight: "800", color: "#f8fafc", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94a3b8", textAlign: "center", marginBottom: 10, lineHeight: 20 },
  emailDisplay: { fontSize: 14, color: "#34d399", textAlign: "center", marginBottom: 28, fontWeight: "600" },
  card: {
    backgroundColor: "rgba(6, 78, 59, 0.5)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.15)",
  },
  label: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 44, 34, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 4,
  },
  input: { flex: 1, color: "#f8fafc", fontSize: 15 },
  button: {
    backgroundColor: "#34d399",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#022c22", fontSize: 16, fontWeight: "800" },
});
