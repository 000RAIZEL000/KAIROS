import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../../../src/context/ThemeContext";
import { getPartido, updatePartido } from "../../../../src/api/partidos";
import { getJugadoresByEquipo } from "../../../../src/api/jugadores";
import { createEvento, getEventosByPartido, deleteEvento } from "../../../../src/api/eventos";
import type { Partido } from "../../../../src/api/partidos";
import type { Jugador } from "../../../../src/api/jugadores";
import type { Evento } from "../../../../src/api/eventos";

export default function GestionarPartidoScreen() {
  const { id: torneoId, partidoId } = useLocalSearchParams<{ id: string; partidoId: string }>();
  const { colors } = useAppTheme();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisit, setJugadoresVisit] = useState<Jugador[]>([]);

  const [golesL, setGolesL] = useState(0);
  const [golesV, setGolesV] = useState(0);
  const [estado, setEstado] = useState("");
  const [amarillasL, setAmarillasL] = useState(0);
  const [amarillasV, setAmarillasV] = useState(0);
  const [rojasL, setRojasL] = useState(0);
  const [rojasV, setRojasV] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const cargarDatos = async () => {
    try {
      const p = await getPartido(String(partidoId));
      setPartido(p);
      setGolesL(p.goles_local ?? 0);
      setGolesV(p.goles_visitante ?? 0);
      setEstado(p.estado);

      const [evs, jLocal, jVisit] = await Promise.all([
        getEventosByPartido(String(partidoId)),
        getJugadoresByEquipo(String(p.equipo_local_id)),
        getJugadoresByEquipo(String(p.equipo_visitante_id)),
      ]);
      setEventos(evs);
      setJugadoresLocal(jLocal);
      setJugadoresVisit(jVisit);

      // Inicializar contadores de tarjetas a nivel de equipo (sin jugador específico)
      const teamEvs = evs.filter((e) => !e.jugador_id);
      setAmarillasL(teamEvs.filter((e) => e.equipo_id === p.equipo_local_id && e.tipo_evento === "amarilla").length);
      setAmarillasV(teamEvs.filter((e) => e.equipo_id === p.equipo_visitante_id && e.tipo_evento === "amarilla").length);
      setRojasL(teamEvs.filter((e) => e.equipo_id === p.equipo_local_id && e.tipo_evento === "roja").length);
      setRojasV(teamEvs.filter((e) => e.equipo_id === p.equipo_visitante_id && e.tipo_evento === "roja").length);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los datos del partido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [partidoId]);

  const syncTarjetas = async (
    equipoId: number,
    tipo: "amarilla" | "roja",
    targetCount: number,
    currentEvs: Evento[]
  ) => {
    const teamEvs = currentEvs.filter(
      (e) => e.equipo_id === equipoId && e.tipo_evento === tipo && !e.jugador_id
    );
    const delta = targetCount - teamEvs.length;
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        await createEvento({ partido_id: Number(partidoId), equipo_id: equipoId, tipo_evento: tipo });
      }
    } else if (delta < 0) {
      for (const ev of teamEvs.slice(targetCount)) {
        await deleteEvento(String(ev.id));
      }
    }
  };

  const handleUpdateScore = async () => {
    if (!partido) return;
    try {
      setActionLoading(true);
      await updatePartido(String(partidoId), {
        goles_local: golesL,
        goles_visitante: golesV,
        estado,
      });
      await Promise.all([
        syncTarjetas(partido.equipo_local_id, "amarilla", amarillasL, eventos),
        syncTarjetas(partido.equipo_visitante_id, "amarilla", amarillasV, eventos),
        syncTarjetas(partido.equipo_local_id, "roja", rojasL, eventos),
        syncTarjetas(partido.equipo_visitante_id, "roja", rojasV, eventos),
      ]);
      Alert.alert("¡Éxito!", "Partido actualizado correctamente.");
      cargarDatos();
    } catch {
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
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo registrar el evento.");
    }
  };

  const handleDeleteEvento = async (evId: number) => {
    try {
      await deleteEvento(String(evId));
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo eliminar el evento.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestionar Partido</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          {/* Marcador */}
          <View style={styles.teamsRow}>
            <View style={styles.teamSide}>
              <Text style={[styles.teamLabel, { color: colors.textMuted }]}>LOCAL</Text>
              <Text style={[styles.teamTitle, { color: colors.text }]} numberOfLines={2}>
                {partido?.equipo_local?.nombre}
              </Text>
              <View style={styles.scoreControl}>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setGolesL((g) => Math.max(0, g - 1))}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scoreNumber, { color: colors.accent }]}>{golesL}</Text>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setGolesL((g) => g + 1)}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.fabText }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.vsText, { color: colors.textMuted }]}>VS</Text>

            <View style={styles.teamSide}>
              <Text style={[styles.teamLabel, { color: colors.textMuted }]}>VISITANTE</Text>
              <Text style={[styles.teamTitle, { color: colors.text }]} numberOfLines={2}>
                {partido?.equipo_visitante?.nombre}
              </Text>
              <View style={styles.scoreControl}>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setGolesV((g) => Math.max(0, g - 1))}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scoreNumber, { color: colors.accent }]}>{golesV}</Text>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setGolesV((g) => g + 1)}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.fabText }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Tarjetas */}
          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tarjetas</Text>
          <View style={styles.tarjetasRow}>
            <View style={styles.tarjetasSide}>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟨</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setAmarillasL((n) => Math.max(0, n - 1))}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#fbbf24" }]}>{amarillasL}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#fbbf24" }]}
                  onPress={() => setAmarillasL((n) => n + 1)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟥</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setRojasL((n) => Math.max(0, n - 1))}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#ef4444" }]}>{rojasL}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#ef4444" }]}
                  onPress={() => setRojasL((n) => n + 1)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.tarjetasSide}>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟨</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setAmarillasV((n) => Math.max(0, n - 1))}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#fbbf24" }]}>{amarillasV}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#fbbf24" }]}
                  onPress={() => setAmarillasV((n) => n + 1)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟥</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setRojasV((n) => Math.max(0, n - 1))}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#ef4444" }]}>{rojasV}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#ef4444" }]}
                  onPress={() => setRojasV((n) => n + 1)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Estado */}
          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Estado del Partido</Text>
          <View style={styles.statusRow}>
            {["Pendiente", "En juego", "Finalizado"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                  estado === s && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => setEstado(s)}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: colors.textSecondary },
                  estado === s && { color: colors.fabText },
                ]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, { backgroundColor: colors.accent }, actionLoading && { opacity: 0.7 }]}
            onPress={handleUpdateScore}
            disabled={actionLoading}
          >
            {actionLoading
              ? <ActivityIndicator color={colors.fabText} />
              : <Text style={[styles.updateBtnText, { color: colors.fabText }]}>Guardar Marcador y Estado</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Sucesos del partido */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sucesos del Partido</Text>
        <View style={[styles.eventsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
          {eventos.map((ev) => (
            <View key={ev.id} style={[styles.eventRow, { borderBottomColor: colors.cardFooterBorder }]}>
              <Ionicons
                name={ev.tipo_evento === "gol" ? "football" : "square"}
                size={18}
                color={ev.tipo_evento === "gol" ? colors.accent : ev.tipo_evento === "amarilla" ? "#fbbf24" : "#ef4444"}
              />
              <Text style={[styles.eventText, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: "800" }}>{ev.tipo_evento.toUpperCase()}</Text>
                {ev.jugador_id
                  ? ` - ${jugadoresLocal.find((j) => j.id === ev.jugador_id)?.nombre ?? jugadoresVisit.find((j) => j.id === ev.jugador_id)?.nombre ?? "Jugador"}`
                  : ev.equipo_id === partido?.equipo_local_id
                    ? ` - ${partido?.equipo_local?.nombre}`
                    : ` - ${partido?.equipo_visitante?.nombre}`
                }
              </Text>
              <TouchableOpacity onPress={() => handleDeleteEvento(ev.id)}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {eventos.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay eventos registrados.</Text>
          )}
        </View>

        {/* Eventos por jugador */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Registrar Goles / Tarjetas</Text>

        <Text style={[styles.subTitle, { color: colors.accent }]}>{partido?.equipo_local?.nombre} (Local)</Text>
        <View style={[styles.playersList, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
          {jugadoresLocal.map((j) => (
            <PlayerEventItem
              key={j.id}
              player={j}
              playerEvents={eventos.filter((e) => e.jugador_id === j.id)}
              onAdd={handleAddEvento}
              onRemove={handleDeleteEvento}
              colors={colors}
            />
          ))}
        </View>

        <Text style={[styles.subTitle, { color: colors.accent }]}>{partido?.equipo_visitante?.nombre} (Visitante)</Text>
        <View style={[styles.playersList, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
          {jugadoresVisit.map((j) => (
            <PlayerEventItem
              key={j.id}
              player={j}
              playerEvents={eventos.filter((e) => e.jugador_id === j.id)}
              onAdd={handleAddEvento}
              onRemove={handleDeleteEvento}
              colors={colors}
            />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function PlayerEventItem({
  player,
  playerEvents,
  onAdd,
  onRemove,
  colors,
}: {
  player: Jugador;
  playerEvents: Evento[];
  onAdd: (j: Jugador, tipo: "gol" | "amarilla" | "roja") => void;
  onRemove: (id: number) => void;
  colors: any;
}) {
  const amarillaEvent = playerEvents.find((e) => e.tipo_evento === "amarilla");
  const rojaEvent = playerEvents.find((e) => e.tipo_evento === "roja");

  return (
    <View style={[styles.playerItem, { borderBottomColor: colors.cardFooterBorder }]}>
      <Text style={[styles.playerItemName, { color: colors.text }]}>{player.nombre} {player.apellido}</Text>
      <View style={styles.playerActions}>
        <TouchableOpacity style={[styles.actionIcon, { backgroundColor: colors.accentSoft }]} onPress={() => onAdd(player, "gol")}>
          <Ionicons name="football" size={20} color={colors.accent} />
        </TouchableOpacity>
        {amarillaEvent ? (
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: "#fbbf24" }]} onPress={() => onRemove(amarillaEvent.id)}>
            <Ionicons name="square" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: "rgba(251,191,36,0.1)" }]} onPress={() => onAdd(player, "amarilla")}>
            <Ionicons name="square" size={20} color="#fbbf24" />
          </TouchableOpacity>
        )}
        {rojaEvent ? (
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: "#ef4444" }]} onPress={() => onRemove(rojaEvent.id)}>
            <Ionicons name="square" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: "rgba(239,68,68,0.1)" }]} onPress={() => onAdd(player, "roja")}>
            <Ionicons name="square" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  // Goles
  teamsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  teamSide: {
    flex: 1,
    alignItems: "center",
  },
  teamLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  scoreControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  scoreBtnText: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
  },
  scoreNumber: {
    fontSize: 38,
    fontWeight: "900",
    minWidth: 44,
    textAlign: "center",
  },
  vsText: {
    fontSize: 13,
    fontWeight: "800",
    marginHorizontal: 6,
    marginTop: 52,
    letterSpacing: 1,
  },
  // Tarjetas
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  tarjetasRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tarjetasSide: {
    flex: 1,
    gap: 10,
  },
  verticalDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 12,
    alignSelf: "center",
  },
  tarjetaControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardEmoji: {
    fontSize: 18,
    width: 24,
  },
  cardBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  cardBtnText: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: "900",
    minWidth: 28,
    textAlign: "center",
  },
  // Estado
  statusRow: { flexDirection: "row", gap: 10 },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  statusOptionText: { fontSize: 12, fontWeight: "700" },
  updateBtn: {
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  updateBtnText: { fontSize: 15, fontWeight: "800" },
  // Sucesos
  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 30, marginBottom: 14 },
  subTitle: { fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  eventsCard: {
    borderRadius: 16,
    padding: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  eventText: { flex: 1, fontSize: 14, marginLeft: 12 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 10 },
  playersList: {
    borderRadius: 16,
    padding: 8,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
  },
  playerItemName: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 },
  playerActions: { flexDirection: "row", gap: 15 },
  actionIcon: {
    padding: 6,
    borderRadius: 8,
  },
});
