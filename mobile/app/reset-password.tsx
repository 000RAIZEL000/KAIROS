import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../src/api/auth";
import { useAppTheme } from "../src/context/ThemeContext";

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const { email, prefilledToken } = useLocalSearchParams<{ email: string; prefilledToken?: string }>();
  const [token, setToken] = useState(prefilledToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim()) { Alert.alert("Campo requerido", "Ingresa el token."); return; }
    if (newPassword.length < 6) { Alert.alert("Contraseña débil", "Mínimo 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Error", "Las contraseñas no coinciden."); return; }
    try {
      setLoading(true);
      if (!email) throw new Error("No se encontró el correo.");
      await resetPassword(email, token.trim(), newPassword);
      Alert.alert("¡Contraseña Actualizada!", "Tu contraseña fue cambiada exitosamente.", [
        { text: "Ir al Login", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      let msg = "No se pudo conectar con el servidor.";
      if (error?.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") msg = detail;
        else msg = "Token o código inválido.";
      }
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#f8fafc" />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={40} color="#34d399" />
        </View>

        <Text style={[styles.title, { color: colors.textOnHeader }]}>Nueva Contraseña</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {prefilledToken ? "Token ingresado automáticamente." : "Ingresa el token y tu nueva contraseña."}
        </Text>
        {email && <Text style={[styles.emailDisplay, { color: colors.accent }]}>{email}</Text>}

        <View style={[styles.card, { backgroundColor: colors.glassCard, borderColor: colors.glassCardBorder }]}>
          <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Token de Validación</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            prefilledToken ? { backgroundColor: "rgba(52,211,153,0.1)" } : {}]}>
            <Ionicons name={prefilledToken ? "lock-closed-outline" : "key-outline"} size={20}
              color={prefilledToken ? "#34d399" : "#94a3b8"} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, prefilledToken ? { color: "#34d399", fontWeight: "bold" } : {}]}
              placeholder="0000" placeholderTextColor="#64748b"
              value={token} onChangeText={setToken}
              keyboardType="number-pad" maxLength={4}
              editable={!prefilledToken}
            />
          </View>

          <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Nueva Contraseña</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#64748b"
              value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          </View>

          <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Confirmar Contraseña</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="Repite tu contraseña" placeholderTextColor="#64748b"
              value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }, loading && { opacity: 0.7 }]} onPress={handleReset} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.fabText} /> : <Text style={[styles.buttonText, { color: colors.fabText }]}>Cambiar Contraseña</Text>}
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
    position: "absolute", top: Platform.OS === "ios" ? 56 : 40, left: 20,
    backgroundColor: "rgba(52,211,153,0.1)", padding: 10, borderRadius: 12,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(52,211,153,0.15)",
    justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 10, lineHeight: 20 },
  emailDisplay: { fontSize: 14, textAlign: "center", marginBottom: 28, fontWeight: "600" },
  card: { borderRadius: 20, padding: 20, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 12 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 50, marginBottom: 4,
  },
  input: { flex: 1, color: "#f8fafc", fontSize: 15 },
  button: { borderRadius: 14, height: 52, justifyContent: "center", alignItems: "center", marginTop: 24, backgroundColor: "#34d399" },
  buttonText: { fontSize: 16, fontWeight: "800" },
});
