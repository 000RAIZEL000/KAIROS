import { View, Animated, Easing, StyleSheet, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Index() {
  const { user, loading } = useAuth();
  const { colors } = useAppTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [dots, setDots] = useState("");
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  // Animación de los puntos
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);
    return () => clearInterval(dotsInterval);
  }, []);

  // 1. Temporizador de más de 7 segundos (7500 ms) y Barra de Progreso
  useEffect(() => {
    // Animar la barra de progreso de 0 a 1 en 7.5 segundos
    Animated.timing(progressValue, {
      toValue: 1,
      duration: 7500,
      easing: Easing.linear,
      useNativeDriver: false, // El ancho no soporta useNativeDriver
    }).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 7500);

    return () => {
      clearTimeout(timer);
      progressValue.stopAnimation();
    };
  }, []);

  // 2. Animación del balón
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (showSplash || loading) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [showSplash, loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (showSplash || loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.splashBg }]}>
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="soccer" size={150} color={colors.splashBall} />
          </Animated.View>
          
          <View style={[styles.progressBarContainer, { backgroundColor: colors.splashBarBg }]}>
            <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: colors.splashBarFill }]} />
          </View>

          <Text style={[styles.loadingText, { color: colors.splashBall }]}>
            Cargando el sistema{dots}
          </Text>
        </View>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/landing" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    width: "60%",
    height: 10,
    borderRadius: 5,
    marginTop: 40,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
});