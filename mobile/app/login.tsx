import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { loginRequest } from "../src/api/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme, colors, toggleTheme } = useAppTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Requerido", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginRequest({ email, password });

      const token = response.access_token || response.token;
      const user = response.user || { email, role: "user" };

      if (!token) {
        Alert.alert("Error", "No se recibió respuesta del servidor");
        return;
      }

      await login(token, user);
      router.replace("/auth-loading");
    } catch (error: any) {
      let msg = "No se pudo iniciar sesión. Verifica tu correo y contraseña.";
      if (error?.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail.map((err: any) => err.msg).join("\n");
        }
      }
      Alert.alert("Acceso Denegado", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.logoContainer}>
                <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
              </View>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleBtn}>
                <Ionicons
                  name={theme === "dark" ? "sunny-outline" : "moon-outline"}
                  size={22}
                  color={colors.textOnHeader}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: colors.textOnHeader }]}>Kairos AG</Text>
            <Text style={[styles.subtitle, { color: colors.textOnHeaderSoft }]}>Gestión Deportiva Global</Text>
          </View>

          <View style={[styles.glassCard, { backgroundColor: colors.glassCard, borderColor: colors.glassCardBorder }]}>
            <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu correo"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña secreta"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push("/forgot-password")}>
              <Text style={styles.forgotText}>¿Olvidaste tu clave?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.fabText} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.fabText }]}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no eres parte? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.link}>Crea tu cuenta</Text>
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
  scrollContainer: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingBottom: 40, paddingTop: 80 },
  header: { alignItems: "center", marginBottom: 32 },
  headerTopRow: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", position: "relative" },
  logoContainer: { width: 90, height: 90, backgroundColor: "rgba(52, 211, 153, 0.1)", borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(52,211,153,0.2)" },
  themeToggleBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 10,
    borderRadius: 12,
  },
  logo: { width: 60, height: 60 },
  title: { fontSize: 34, fontWeight: "800", marginBottom: 8, textAlign: "center", letterSpacing: 0.5 },
  subtitle: { fontSize: 16, textAlign: "center", letterSpacing: 0.5 },
  glassCard: { borderRadius: 24, padding: 24, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 16, marginBottom: 16, paddingHorizontal: 16, height: 60, borderWidth: 1 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: "100%", color: "#f8fafc", fontSize: 16 },
  eyeIcon: { padding: 8 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 32 },
  forgotText: { color: "#34d399", fontSize: 14, fontWeight: "600" },
  button: { backgroundColor: "#34d399", height: 60, borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#34d399", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  buttonDisabled: { backgroundColor: "rgba(52,211,153,0.5)", shadowOpacity: 0, elevation: 0 },
  buttonText: { color: "#022c22", fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 40 },
  footerText: { color: "#94a3b8", fontSize: 15 },
  link: { color: "#34d399", fontSize: 15, fontWeight: "700" },
});