import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { createJugador } from "../../src/api/jugadores";

export default function CrearJugadorScreen() {
  const { equipoId, torneoId } = useLocalSearchParams<{
    equipoId: string;
    torneoId: string;
  }>();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [posicion, setPosicion] = useState("");
  const [numeroCamiseta, setNumeroCamiseta] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Validación", "Nombre y apellido son obligatorios");
      return;
    }

    try {
      setLoading(true);

      await createJugador({
        equipo_id: Number(equipoId),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        posicion: posicion.trim() || null,
        numero_camiseta: numeroCamiseta ? Number(numeroCamiseta) : null,
        activo,
      });

      Alert.alert("¡Éxito!", "Tu jugador ha sido creado correctamente.", [
        {
          text: "Continuar",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.log("ERROR crear jugador:", err?.message);
      console.log("STATUS crear jugador:", err?.response?.status);
      console.log("DATA crear jugador:", err?.response?.data);
      Alert.alert("Error", "No se pudo crear el jugador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        backgroundColor: "#f0fdf4",
        flexGrow: 1,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 18, color: "#064e3b" }}>
        Crear jugador
      </Text>

      <Text style={{ fontWeight: "700", marginBottom: 6, color: "#064e3b" }}>Nombre</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre"
        style={inputStyle}
      />

      <Text style={{ fontWeight: "700", marginBottom: 6, color: "#064e3b" }}>Apellido</Text>
      <TextInput
        value={apellido}
        onChangeText={setApellido}
        placeholder="Apellido"
        style={inputStyle}
      />

      <Text style={{ fontWeight: "700", marginBottom: 6, color: "#064e3b" }}>Posición</Text>
      <TextInput
        value={posicion}
        onChangeText={setPosicion}
        placeholder="Defensa, Arquero, Delantero..."
        style={inputStyle}
      />

      <Text style={{ fontWeight: "700", marginBottom: 6, color: "#064e3b" }}>Número de camiseta</Text>
      <TextInput
        value={numeroCamiseta}
        onChangeText={setNumeroCamiseta}
        placeholder="10"
        keyboardType="numeric"
        style={inputStyle}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
          borderWidth: 1,
          borderColor: "#d1fae5",
        }}
      >
        <Text style={{ fontWeight: "700", color: "#064e3b" }}>Activo</Text>
        <Switch value={activo} onValueChange={setActivo} trackColor={{ true: "#34d399" }} />
      </View>

      <Pressable
        onPress={handleGuardar}
        disabled={loading}
        style={{
          backgroundColor: "#059669",
          paddingVertical: 16,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          {loading ? "Guardando..." : "Guardar jugador"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#d1fae5",
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 14,
  marginBottom: 14,
  color: "#064e3b",
};