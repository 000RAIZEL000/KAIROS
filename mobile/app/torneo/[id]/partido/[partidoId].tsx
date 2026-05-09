import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getPartido, updatePartido } from "../../../../src/api/partidos";
import { getJugadoresByEquipo } from "../../../../src/api/jugadores";
import { createEvento, getEventosByPartido, deleteEvento } from "../../../../src/api/eventos";
import type { Partido } from "../../../../src/api/partidos";
import type { Jugador } from "../../../../src/api/jugadores";
import type { Evento } from "../../../../src/api/eventos";

export default function GestionarPartidoScreen() {
  const { id: torneoId, partidoId } = useLocalSearchParams<{ id: string; partidoId: string }>();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisit, setJugadoresVisit] = useState<Jugador[]>([]);
  
  const [golesL, setGolesL] = useState("");
  const [golesV, setGolesV] = useState("");
  const [estado, setEstado] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const cargarDatos = async () => {
    try {
      const p = await getPartido(String(partidoId));
      setPartido(p);
      setGolesL(String(p.goles_local));
      setGolesV(String(p.goles_visitante));
      setEstado(p.estado);

      const [evs, jLocal, jVisit] = await Promise.all([
        getEventosByPartido(String(partidoId)),
        getJugadoresByEquipo(String(p.equipo_local_id)),
        getJugadoresByEquipo(String(p.equipo_visitante_id)),
      ]);
      setEventos(evs);
      setJugadoresLocal(jLocal);
      setJugadoresVisit(jVisit);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos del partido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

  const handleUpdateScore = async () => {
    try {
      setActionLoading(true);
      await updatePartido(String(partidoId), {
        goles_local: Number(golesL),
        goles_visitante: Number(golesV),
        estado: estado,
      });
      Alert.alert("¡Éxito!", "Tu partido ha sido actualizado correctamente.");
      cargarDatos();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el marcador.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEvento = async (jugador: Jugador, tipo: "gol" | "amarilla" | "roja") => {
    try {
      await createEvento({
        partido_id: Number(partidoId),
        jugador_id: jugador.id,
        equipo_id: jugador.equipo_id,
        tipo_evento: tipo,
        minuto: null,
      });
      Alert.alert("¡Éxito!", `Se ha registrado el ${tipo} correctamente.`);
      cargarDatos();
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el evento.");
    }
  };

  const handleDeleteEvento = async (evId: number) => {
    try {
      await deleteEvento(String(evId));
      Alert.alert("¡Éxito!", "El evento ha sido eliminado.");
      cargarDatos();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el evento.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#022c22", "#064e3b"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestionar Partido</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Marcador */}
        <View style={styles.scoreCard}>
          <View style={styles.teamsRow}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamLabel}>Local</Text>
              <Text style={styles.teamTitle}>{partido?.equipo_local?.nombre}</Text>
              <TextInput
                style={styles.scoreInput}
                value={golesL}
                onChangeText={setGolesL}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748b"
              />
            </View>
            <Text style={styles.vsText}>-</Text>
            <View style={[styles.teamInfo, { alignItems: "flex-end" }]}>
              <Text style={styles.teamLabel}>Visitante</Text>
              <Text style={[styles.teamTitle, { textAlign: "right" }]}>{partido?.equipo_visitante?.nombre}</Text>
              <TextInput
                style={styles.scoreInput}
                value={golesV}
                onChangeText={setGolesV}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>

          <Text style={styles.label}>Estado del Partido</Text>
          <View style={styles.statusRow}>
            {["Pendiente", "En juego", "Finalizado"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, estado === s && styles.statusOptionActive]}
                onPress={() => setEstado(s)}
              >
                <Text style={[styles.statusOptionText, estado === s && styles.statusOptionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, actionLoading && { opacity: 0.7 }]}
            onPress={handleUpdateScore}
            disabled={actionLoading}
          >
            <Text style={styles.updateBtnText}>Guardar Marcador y Estado</Text>
          </TouchableOpacity>
        </View>

        {/* Eventos Recientes */}
        <Text style={styles.sectionTitle}>Sucesos del Partido</Text>
        <View style={styles.eventsCard}>
          {eventos.map((ev) => (
            <View key={ev.id} style={styles.eventRow}>
              <Ionicons 
                name={ev.tipo_evento === "gol" ? "football" : "square"} 
                size={18} 
                color={ev.tipo_evento === "gol" ? "#34d399" : ev.tipo_evento === "amarilla" ? "#fbbf24" : "#ef4444"} 
              />
              <Text style={styles.eventText}>
                <Text style={{ fontWeight: "800" }}>{ev.tipo_evento.toUpperCase()}</Text> - {ev.jugador_id ? `${jugadoresLocal.find(j => j.id === ev.jugador_id)?.nombre || jugadoresVisit.find(j => j.id === ev.jugador_id)?.nombre}` : "Equipo"}
              </Text>
              <TouchableOpacity onPress={() => handleDeleteEvento(ev.id)}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          {eventos.length === 0 && <Text style={styles.emptyText}>No hay goles ni tarjetas registradas.</Text>}
        </View>

        {/* Añadir Eventos por Equipo */}
        <Text style={styles.sectionTitle}>Registrar Goles / Tarjetas</Text>
        
        <Text style={styles.subTitle}>{partido?.equipo_local?.nombre} (Local)</Text>
        <View style={styles.playersList}>
          {jugadoresLocal.map((j) => (
            <PlayerEventItem key={j.id} player={j} onAdd={handleAddEvento} />
          ))}
        </View>

        <Text style={styles.subTitle}>{partido?.equipo_visitante?.nombre} (Visitante)</Text>
        <View style={styles.playersList}>
          {jugadoresVisit.map((j) => (
            <PlayerEventItem key={j.id} player={j} onAdd={handleAddEvento} />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function PlayerEventItem({ player, onAdd }: { player: Jugador, onAdd: any }) {
  return (
    <View style={styles.playerItem}>
      <Text style={styles.playerItemName}>{player.nombre} {player.apellido}</Text>
      <View style={styles.playerActions}>
        <TouchableOpacity style={styles.actionIcon} onPress={() => onAdd(player, "gol")}>
          <Ionicons name="football" size={20} color="#34d399" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={() => onAdd(player, "amarilla")}>
          <Ionicons name="square" size={20} color="#fbbf24" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon} onPress={() => onAdd(player, "roja")}>
          <Ionicons name="square" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#022c22" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(52,211,153,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 14,
  },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "900" },
  scroll: { padding: 16 },
  scoreCard: {
    backgroundColor: "#064e3b",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
  },
  teamsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  teamInfo: { flex: 1 },
  teamLabel: { color: "#64748b", fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 4 },
  teamTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "800", marginBottom: 10 },
  scoreInput: {
    backgroundColor: "#022c22",
    color: "#34d399",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    borderRadius: 12,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.3)",
  },
  vsText: { color: "#065f46", fontSize: 24, fontWeight: "900", marginHorizontal: 10, marginTop: 30 },
  label: { color: "#d1fae5", fontSize: 12, fontWeight: "700", marginTop: 20, marginBottom: 10, textTransform: "uppercase" },
  statusRow: { flexDirection: "row", gap: 10 },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#022c22",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.15)",
  },
  statusOptionActive: { backgroundColor: "#34d399", borderColor: "#34d399" },
  statusOptionText: { color: "#a7f3d0", fontSize: 12, fontWeight: "700" },
  statusOptionTextActive: { color: "#022c22" },
  updateBtn: {
    backgroundColor: "#34d399",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  updateBtnText: { color: "#022c22", fontSize: 15, fontWeight: "800" },
  sectionTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "800", marginTop: 30, marginBottom: 14 },
  subTitle: { color: "#34d399", fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  eventsCard: {
    backgroundColor: "#064e3b",
    borderRadius: 16,
    padding: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(52,211,153,0.05)",
  },
  eventText: { flex: 1, color: "#cbd5e1", fontSize: 14, marginLeft: 12 },
  emptyText: { color: "#64748b", fontSize: 14, textAlign: "center", paddingVertical: 10 },
  playersList: {
    backgroundColor: "#064e3b",
    borderRadius: 16,
    padding: 8,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.05)",
  },
  playerItemName: { color: "#f8fafc", fontSize: 14, fontWeight: "600" },
  playerActions: { flexDirection: "row", gap: 15 },
  actionIcon: {
    padding: 6,
    backgroundColor: "rgba(52,211,153,0.08)",
    borderRadius: 8,
  },
});
