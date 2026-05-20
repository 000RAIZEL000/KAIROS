import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, StatusBar
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { forgotPassword } from "../src/api/auth";
import { useAppTheme } from "../src/context/ThemeContext";

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Ingresa tu correo");
      return;
    }
    try {
      setLoading(true);
      const response = await forgotPassword(email.trim());
      const msg = response.token
        ? `Aca esta el numero de confirmacion: ${response.token}\n\nCópialo para el siguiente campo.`
        : response.message || "Solicitud enviada";
      if (response.token) {
        console.log(`\n---\n🔑 Codigo: ${response.token}\n---\n`);
      }
      Alert.alert("Recuperación", msg, [{
        text: "OK",
        onPress: () => router.push({ pathname: "/reset-password", params: { email: email.trim(), prefilledToken: response.token } })
      }]);
    } catch (error: any) {
      let errorMsg = "No hay conexión con el servidor.";
      if (error?.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") errorMsg = detail;
        else if (Array.isArray(detail)) errorMsg = detail.map((e: any) => e.msg).join("\n");
      }
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textOnHeader} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={40} color={colors.accent} />
          </View>

          <Text style={[styles.title, { color: colors.textOnHeader }]}>Recuperar Clave</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Ingresa tu correo electrónico y te enviaremos un token de validación.
          </Text>

          <View style={[styles.glassCard, { backgroundColor: colors.glassCard, borderColor: colors.glassCardBorder }]}>
            <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Correo Electrónico</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textOnHeader }]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent }, loading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.fabText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.fabText }]}>Enviar Recuperación</Text>
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
    position: "absolute", top: Platform.OS === "ios" ? 56 : 40, left: 0,
    backgroundColor: "rgba(52,211,153,0.1)", padding: 10, borderRadius: 12,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32, lineHeight: 22 },
  glassCard: { borderRadius: 24, padding: 24, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, paddingHorizontal: 16, height: 60,
    borderWidth: 1, marginBottom: 24,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#f8fafc", fontSize: 16 },
  button: { height: 60, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: "#34d399" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "800" },
});
