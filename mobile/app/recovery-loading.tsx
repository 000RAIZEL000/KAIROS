import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../src/context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function RecoveryLoadingScreen() {
  const { colors } = useAppTheme();
  const { email, prefilledToken } = useLocalSearchParams<{ email: string; prefilledToken: string }>();
  
  const ballPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const keyOpacity = useRef(new Animated.Value(0)).current;
  const keyScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación del texto
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Secuencia de búsqueda del balón (Movimientos erráticos)
    const searchAnimation = Animated.sequence([
      Animated.timing(ballPos, { toValue: { x: width / 4, y: -100 }, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ballPos, { toValue: { x: -width / 3, y: 50 }, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ballPos, { toValue: { x: width / 5, y: 150 }, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ballPos, { toValue: { x: -width / 4, y: -50 }, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(ballPos, { toValue: { x: 0, y: 0 }, duration: 1000, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]);

    searchAnimation.start(() => {
      // Aparece la llave
      Animated.parallel([
        Animated.timing(keyOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(keyScale, { toValue: 1.5, friction: 4, useNativeDriver: true }),
      ]).start(() => {
        // Balón rebota 3 veces al encontrar la llave
        Animated.sequence([
          Animated.timing(ballPos.y, { toValue: -100, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ballPos.y, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(ballPos.y, { toValue: -60, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ballPos.y, { toValue: 0, duration: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(ballPos.y, { toValue: -30, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(ballPos.y, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]).start();
      });
    });

    // Temporizador de 11 segundos
    const timer = setTimeout(() => {
      router.replace({ 
        pathname: "/reset-password", 
        params: { email, prefilledToken } 
      });
    }, 11000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle === "dark-content" ? "dark-content" : "light-content"} />
      
      <View style={styles.scene}>
        {/* Llave que aparece */}
        <Animated.View style={[styles.keyContainer, { opacity: keyOpacity, transform: [{ scale: keyScale }] }]}>
          <Ionicons name="key" size={80} color="#fbbf24" />
        </Animated.View>

        {/* Balón buscando */}
        <Animated.View 
          style={[
            styles.ballWrapper, 
            { transform: [{ translateX: ballPos.x }, { translateY: ballPos.y }] }
          ]}
        >
          <MaterialCommunityIcons name="soccer" size={60} color={colors.accent} />
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={[styles.title, { color: colors.accent }]}>
          BUSCANDO TU ACCESO
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Estamos verificando tus datos y generando tu llave de entrada...
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scene: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  keyContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  ballWrapper: {
    zIndex: 10,
  },
  footer: {
    paddingBottom: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 50,
    lineHeight: 24,
  },
});
