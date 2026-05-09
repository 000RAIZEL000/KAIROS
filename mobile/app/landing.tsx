import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../src/context/ThemeContext";

export default function LandingScreen() {
  const { theme, colors, toggleTheme } = useAppTheme();
  const ballScale = useRef(new Animated.Value(0.1)).current;
  const ballOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    Animated.sequence([
      // Fase 1: El balón se acerca agresivamente hacia la pantalla ("alucinación")
      Animated.timing(ballScale, {
        toValue: 30, // Un aumento gigante para simular que choca con la cámara
        duration: 900,
        easing: Easing.in(Easing.exp),
        useNativeDriver: true,
      }),
      // Fase 2: El balón se desvanece
      Animated.timing(ballOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      // Fase 3: Aparece suavemente la interfaz
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => {
      setAnimationDone(true);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.authBg }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      
      {/* Animación del Balón que viene hacia la pantalla */}
      {!animationDone && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.animationOverlay, { opacity: ballOpacity, zIndex: 10, backgroundColor: colors.authBg }]}>
          <Animated.View style={{ transform: [{ scale: ballScale }] }}>
             <Ionicons name="football" size={60} color={colors.textOnHeader} style={styles.ballIcon} />
          </Animated.View>
        </Animated.View>
      )}

      {/* Contenido Real (Oculto al inicio) */}
      <Animated.View style={[{ flex: 1, justifyContent: "space-between" }, { opacity: contentOpacity }]}>
        
        {/* Theme Toggle */}
        <View style={styles.themeToggleRow}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggleBtn}>
            <Ionicons
              name={theme === "dark" ? "sunny-outline" : "moon-outline"}
              size={22}
              color={colors.textOnHeader}
            />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../assets/images/logo.png")} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>
          
          <Text style={[styles.title, { color: colors.textOnHeader }]}>Kairos AG</Text>
          <Text style={[styles.tagline, { color: colors.accent }]}>Gestión Deportiva Global</Text>
          
          <Text style={[styles.description, { color: colors.textMuted }]}>
            La plataforma definitiva para seguir de cerca todas las estadísticas, tablas de posiciones, goleadores y calendarios de tus torneos favoritos en tiempo real.
          </Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionsBox}>
          {/* Botón único: Siguiente */}
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.accent, height: 70 }]} 
            activeOpacity={0.8}
            onPress={() => router.push("/login")}
          >
            <Ionicons name="football" size={28} color={colors.fabText} style={{ marginRight: 10 }} />
            <Text style={[styles.primaryBtnText, { color: colors.fabText, fontSize: 20 }]}>Siguiente</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24,
  },
  animationOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  ballIcon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  themeToggleRow: {
    alignItems: "flex-end",
    paddingTop: 20,
  },
  themeToggleBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 10,
    borderRadius: 12,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: { 
    width: 120, 
    height: 120, 
    backgroundColor: "rgba(52,211,153,0.1)", 
    borderRadius: 40, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: "rgba(52,211,153,0.2)" 
  },
  logo: { width: 80, height: 80 },
  title: { fontSize: 38, fontWeight: "900", marginBottom: 8, letterSpacing: 0.5 },
  tagline: { fontSize: 18, fontWeight: "700", marginBottom: 24, letterSpacing: 0.5 },
  description: { 
    fontSize: 15, 
    textAlign: "center", 
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actionsBox: {
    paddingBottom: 20,
  },
  primaryBtn: {
    flexDirection: "row",
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
  },
  primaryBtnText: { fontSize: 18, fontWeight: "800", letterSpacing: 0.5 },
});
