import { useEffect, useState } from "react";
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
import { getJugadorById, updateJugador } from "../../../src/api/jugadores";

export default function EditarJugadorScreen() {
  const { jugadorId, equipoId, torneoId } = useLocalSearchParams<{
    jugadorId: string;
    equipoId: string;
    torneoId: string;
  }>();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [posicion, setPosicion] = useState("");
  const [numeroCamiseta, setNumeroCamiseta] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cargarJugador();
  }, [jugadorId]);

  const cargarJugador = async () => {
    try {
      setLoadingData(true);
      const data = await getJugadorById(String(jugadorId));

      setNombre(data.nombre || "");
      setApellido(data.apellido || "");
      setPosicion(data.posicion || "");
      setNumeroCamiseta(
        data.numero_camiseta != null ? String(data.numero_camiseta) : ""
      );
      setActivo(Boolean(data.activo));
    } catch (err: any) {
      Alert.alert("Error", "No se pudo cargar el jugador");
    } finally {
      setLoadingData(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Validación", "Nombre y apellido son obligatorios");
      return;
    }

    try {
      setLoading(true);

      await updateJugador(String(jugadorId), {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        posicion: posicion.trim() || null,
        numero_camiseta: numeroCamiseta ? Number(numeroCamiseta) : null,
        activo,
      });

      Alert.alert("¡Éxito!", "Tu jugador ha sido actualizado correctamente.", [
        {
          text: "Continuar",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.log("ERROR editar jugador:", err?.message);
      console.log("STATUS editar jugador:", err?.response?.status);
      console.log("DATA editar jugador:", err?.response?.data);
      Alert.alert("Error", "No se pudo actualizar el jugador");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f0fdf4",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#064e3b" }}>Cargando jugador...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        backgroundColor: "#f0fdf4",
        flexGrow: 1,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 18, color: "#064e3b" }}>
        Editar jugador
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
        placeholder="Posición"
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
          {loading ? "Guardando..." : "Actualizar jugador"}
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