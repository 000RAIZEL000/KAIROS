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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { registerRequest } from "../src/api/auth";

export default function RegisterScreen() {
  const { login } = useAuth();
  const { theme, colors, toggleTheme } = useAppTheme();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Nombre, correo y contraseña son obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerRequest({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim() || null,
        password,
      });

      // Login automático
      await login(res.access_token, res.user);

      Alert.alert(
        "¡Bienvenido!", 
        `Hola ${res.user.nombre}, tu cuenta ha sido creada y ya puedes empezar.`,
        [{ text: "Comenzar", onPress: () => router.replace("/auth-loading") }]
      );
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "No se pudo registrar. Intenta de nuevo.";
      Alert.alert("Error al Registrar", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <View style={styles.headerTopRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={36} color="#34d399" />
              </View>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleBtn}>
                <Ionicons
                  name={theme === "dark" ? "sunny-outline" : "moon-outline"}
                  size={22}
                  color={colors.textOnHeader}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: colors.textOnHeader }]}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, { color: colors.textOnHeaderSoft }]}>Regístrate para acceder a todos los campeonatos</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.glassCard, borderColor: colors.glassCardBorder }]}>
            {/* Nombre */}
            <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Nombre completo</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor="#64748b"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            {/* Email */}
            <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Correo electrónico</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Teléfono */}
            <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Teléfono </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="call-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+57 300 123 4567"
                placeholderTextColor="#64748b"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>

            {/* Contraseña */}
            <Text style={[styles.label, { color: colors.textOnHeaderSoft }]}>Contraseña</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Botón */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.fabText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.fabText }]}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link Login */}
          <TouchableOpacity onPress={() => router.replace("/login")} style={styles.linkContainer}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
            <Text style={styles.linkHighlight}>Inicia sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: { alignItems: "center", marginBottom: 28 },
  headerTopRow: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", position: "relative" },
  themeToggleBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#f8fafc", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  label: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 44, 34, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
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
  linkContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  linkText: { color: "#94a3b8", fontSize: 14 },
  linkHighlight: { color: "#34d399", fontSize: 14, fontWeight: "700" },
});