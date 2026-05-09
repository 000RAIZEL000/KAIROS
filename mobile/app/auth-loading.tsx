import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar, Dimensions } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function AuthLoadingScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  
  const ballPos = useRef(new Animated.Value(0)).current;
  const ballBounce = useRef(new Animated.Value(0)).current;
  const netScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Animación del texto
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    if (isAdmin) {
      // Animación Admin: Gol lento a la portería (dura casi todo el tiempo de carga)
      Animated.sequence([
        Animated.timing(ballPos, {
          toValue: 1,
          duration: 7000, // Movimiento lento durante 7 segundos
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(netScale, {
            toValue: 1.3,
            friction: 2,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(ballPos, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          })
        ])
      ]).start();
    } else {
      // Animación Usuario: Pelota rebotando
      Animated.loop(
        Animated.sequence([
          Animated.timing(ballBounce, {
            toValue: -150,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ballBounce, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ).start();
    }

    // Temporizador de 7.5 segundos
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 7500);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  const ballTranslateX = ballPos.interpolate({
    inputRange: [0, 1],
    outputRange: [-width / 1.5, width / 4],
  });

  const ballRotation = ballPos.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1440deg"], // Más rotación por el tiempo largo
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle === "dark-content" ? "dark-content" : "light-content"} />
      
      <View style={styles.animationContainer}>
        {isAdmin ? (
          // Vista Admin: Cancha de Fútbol y Portería
          <View style={styles.courtContainer}>
            <View style={styles.grassField}>
              <View style={styles.penaltyArea} />
              <View style={styles.goalLine} />
              
              {/* Portería */}
              <View style={styles.goalPost}>
                <View style={styles.netMesh} />
              </View>

              <Animated.View style={[styles.netReaction, { transform: [{ scale: netScale }] }]} />
            </View>
            
            <Animated.View 
              style={[
                styles.ballWrapper, 
                { transform: [{ translateX: ballTranslateX }, { rotate: ballRotation }] }
              ]}
            >
              <MaterialCommunityIcons name="soccer" size={50} color="#ffffff" style={styles.ballShadow} />
            </Animated.View>
          </View>
        ) : (
          // Vista Usuario: Pelota Rebotando
          <View style={styles.bounceScene}>
            <Animated.View style={{ transform: [{ translateY: ballBounce }] }}>
              <MaterialCommunityIcons name="soccer" size={100} color={colors.accent} />
            </Animated.View>
            <View style={[styles.shadow, { backgroundColor: colors.accentSoft }]} />
          </View>
        )}
      </View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <Text style={[styles.roleText, { color: colors.accent }]}>
          {isAdmin ? "INICIANDO COMO ADMINISTRADOR" : "PREPARANDO TU CANCHA"}
        </Text>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          {isAdmin ? "Configurando el terreno de juego..." : "Cargando tus torneos favoritos..."}
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
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  // Estilos Cancha Admin
  courtContainer: {
    width: "100%",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  grassField: {
    width: "120%",
    height: 300,
    backgroundColor: "#166534", // Verde grama oscuro
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 40,
    transform: [{ perspective: 1000 }, { rotateX: "20deg" }],
  },
  goalLine: {
    position: "absolute",
    right: 60,
    width: 2,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  penaltyArea: {
    position: "absolute",
    right: 60,
    width: 120,
    height: 180,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 90,
  },
  goalPost: {
    width: 60,
    height: 120,
    borderWidth: 4,
    borderColor: "#ffffff",
    borderLeftWidth: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  netMesh: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  netReaction: {
    position: "absolute",
    right: 30,
    width: 80,
    height: 140,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    zIndex: -1,
  },
  ballWrapper: {
    position: "absolute",
    zIndex: 10,
  },
  ballShadow: {
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  // Estilos Usuario
  bounceScene: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    width: 60,
    height: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  footer: {
    paddingBottom: 80,
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
