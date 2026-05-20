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
  Modal,
  TextInput,
  KeyboardAvoidingView,
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

type TipoEvento = "gol" | "amarilla" | "roja" | "sustitucion";

type TarjetaModalState = {
  tipo: "amarilla" | "roja";
  equipoId: number;
  jugadores: Jugador[];
};

const TIPO_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  gol:        { label: "Gol",          icon: "football",        color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  amarilla:   { label: "T. Amarilla",  icon: "square",          color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  roja:       { label: "T. Roja",      icon: "square",          color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  sustitucion:{ label: "Sustitución",  icon: "swap-horizontal", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  asistencia: { label: "Asistencia",   icon: "hand-left",       color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

export default function GestionarPartidoScreen() {
  const { id: torneoId, partidoId } = useLocalSearchParams<{ id: string; partidoId: string }>();
  const { theme, colors, toggleTheme } = useAppTheme();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<Jugador[]>([]);
  const [jugadoresVisit, setJugadoresVisit] = useState<Jugador[]>([]);

  const [golesL, setGolesL] = useState(0);
  const [golesV, setGolesV] = useState(0);
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal: asignar tarjeta con jugador
  const [tarjetaModal, setTarjetaModal] = useState<TarjetaModalState | null>(null);
  const [tarjetaJugador, setTarjetaJugador] = useState<Jugador | null>(null);
  const [tarjetaMinuto, setTarjetaMinuto] = useState("");
  const [tarjetaSaving, setTarjetaSaving] = useState(false);

  // Modal: agregar suceso
  const [sucesosVisible, setSucesosVisible] = useState(false);
  const [sucTipo, setSucTipo] = useState<TipoEvento>("gol");
  const [sucEquipo, setSucEquipo] = useState<"local" | "visitante">("local");
  const [sucJugador, setSucJugador] = useState<Jugador | null>(null);
  const [sucMinuto, setSucMinuto] = useState("");
  const [sucSaving, setSucSaving] = useState(false);

  // Contadores de tarjetas calculados desde los eventos reales
  const amarillasL = eventos.filter(e => e.equipo_id === partido?.equipo_local_id    && e.tipo_evento === "amarilla").length;
  const amarillasV = eventos.filter(e => e.equipo_id === partido?.equipo_visitante_id && e.tipo_evento === "amarilla").length;
  const rojasL     = eventos.filter(e => e.equipo_id === partido?.equipo_local_id    && e.tipo_evento === "roja").length;
  const rojasV     = eventos.filter(e => e.equipo_id === partido?.equipo_visitante_id && e.tipo_evento === "roja").length;

  const sucJugadores = sucEquipo === "local" ? jugadoresLocal : jugadoresVisit;

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
    } catch {
      Alert.alert("Error", "No se pudieron cargar los datos del partido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [partidoId]);

  const handleUpdateScore = async () => {
    if (!partido) return;
    try {
      setActionLoading(true);
      await updatePartido(String(partidoId), { goles_local: golesL, goles_visitante: golesV, estado });
      Alert.alert("¡Éxito!", "Partido actualizado correctamente.");
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo actualizar el marcador.");
    } finally {
      setActionLoading(false);
    }
  };

  // Tarjeta modal
  const openTarjetaModal = (tipo: "amarilla" | "roja", jugadores: Jugador[], equipoId: number) => {
    setTarjetaJugador(null);
    setTarjetaMinuto("");
    setTarjetaModal({ tipo, equipoId, jugadores });
  };

  const handleSaveTarjeta = async () => {
    if (!tarjetaJugador) { Alert.alert("Selecciona un jugador"); return; }
    try {
      setTarjetaSaving(true);
      await createEvento({
        partido_id: Number(partidoId),
        jugador_id: tarjetaJugador.id,
        equipo_id: tarjetaModal!.equipoId,
        tipo_evento: tarjetaModal!.tipo,
        minuto: tarjetaMinuto ? Number(tarjetaMinuto) : null,
      });
      setTarjetaModal(null);
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo registrar la tarjeta.");
    } finally {
      setTarjetaSaving(false);
    }
  };

  const removeTarjeta = async (equipoId: number, tipo: "amarilla" | "roja") => {
    const last = [...eventos]
      .filter(e => e.equipo_id === equipoId && e.tipo_evento === tipo)
      .sort((a, b) => b.id - a.id)[0];
    if (!last) return;
    try {
      await deleteEvento(String(last.id));
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo eliminar la tarjeta.");
    }
  };

  // Sucesos modal
  const openSucesosModal = () => {
    setSucTipo("gol");
    setSucEquipo("local");
    setSucJugador(null);
    setSucMinuto("");
    setSucesosVisible(true);
  };

  const handleSaveSuceso = async () => {
    if (!partido) return;
    if (!sucJugador) { Alert.alert("Selecciona un jugador"); return; }
    const equipoId = sucEquipo === "local" ? partido.equipo_local_id : partido.equipo_visitante_id;
    try {
      setSucSaving(true);
      await createEvento({
        partido_id: Number(partidoId),
        jugador_id: sucJugador.id,
        equipo_id: equipoId,
        tipo_evento: sucTipo,
        minuto: sucMinuto ? Number(sucMinuto) : null,
      });
      setSucesosVisible(false);
      cargarDatos();
    } catch {
      Alert.alert("Error", "No se pudo registrar el suceso.");
    } finally {
      setSucSaving(false);
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

  if (!partido) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1 }]}>Gestionar Partido</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
            <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={20} color="#f8fafc" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Marcador y Tarjetas ── */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>

          {/* Goles */}
          <View style={styles.teamsRow}>
            <View style={styles.teamSide}>
              <Text style={[styles.teamLabel, { color: colors.textMuted }]}>LOCAL</Text>
              <Text style={[styles.teamTitle, { color: colors.text }]} numberOfLines={2}>
                {partido.equipo_local?.nombre}
              </Text>
              <View style={styles.scoreControl}>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setGolesL(g => Math.max(0, g - 1))}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scoreNumber, { color: colors.accent }]}>{golesL}</Text>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setGolesL(g => g + 1)}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.fabText }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.vsText, { color: colors.textMuted }]}>VS</Text>

            <View style={styles.teamSide}>
              <Text style={[styles.teamLabel, { color: colors.textMuted }]}>VISITANTE</Text>
              <Text style={[styles.teamTitle, { color: colors.text }]} numberOfLines={2}>
                {partido.equipo_visitante?.nombre}
              </Text>
              <View style={styles.scoreControl}>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => setGolesV(g => Math.max(0, g - 1))}
                >
                  <Text style={[styles.scoreBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.scoreNumber, { color: colors.accent }]}>{golesV}</Text>
                <TouchableOpacity
                  style={[styles.scoreBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setGolesV(g => g + 1)}
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
            {/* LOCAL */}
            <View style={styles.tarjetasSide}>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟨</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => removeTarjeta(partido.equipo_local_id, "amarilla")}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#fbbf24" }]}>{amarillasL}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#fbbf24" }]}
                  onPress={() => openTarjetaModal("amarilla", jugadoresLocal, partido.equipo_local_id)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟥</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => removeTarjeta(partido.equipo_local_id, "roja")}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#ef4444" }]}>{rojasL}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#ef4444" }]}
                  onPress={() => openTarjetaModal("roja", jugadoresLocal, partido.equipo_local_id)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.cardBorder }]} />

            {/* VISITANTE */}
            <View style={styles.tarjetasSide}>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟨</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => removeTarjeta(partido.equipo_visitante_id, "amarilla")}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#fbbf24" }]}>{amarillasV}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#fbbf24" }]}
                  onPress={() => openTarjetaModal("amarilla", jugadoresVisit, partido.equipo_visitante_id)}
                >
                  <Text style={[styles.cardBtnText, { color: "#fff" }]}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tarjetaControl}>
                <Text style={styles.cardEmoji}>🟥</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                  onPress={() => removeTarjeta(partido.equipo_visitante_id, "roja")}
                >
                  <Text style={[styles.cardBtnText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.cardCount, { color: "#ef4444" }]}>{rojasV}</Text>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: "#ef4444" }]}
                  onPress={() => openTarjetaModal("roja", jugadoresVisit, partido.equipo_visitante_id)}
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
            {["Pendiente", "En juego", "Finalizado"].map(s => (
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

        {/* ── Sucesos del Partido ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sucesos del Partido</Text>
          <TouchableOpacity style={[styles.addSucesoBtn, { backgroundColor: colors.accent }]} onPress={openSucesosModal}>
            <Ionicons name="add" size={16} color={colors.fabText} />
            <Text style={[styles.addSucesoBtnText, { color: colors.fabText }]}>Agregar Suceso</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.eventsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 }]}>
          {eventos.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay eventos registrados.</Text>
          )}
          {eventos.map(ev => {
            const cfg = TIPO_CONFIG[ev.tipo_evento] ?? TIPO_CONFIG.gol;
            const jugador = jugadoresLocal.find(j => j.id === ev.jugador_id)
              ?? jugadoresVisit.find(j => j.id === ev.jugador_id);
            const equipoNombre = ev.equipo_id === partido.equipo_local_id
              ? partido.equipo_local?.nombre
              : partido.equipo_visitante?.nombre;
            return (
              <View key={ev.id} style={[styles.eventRow, { borderBottomColor: colors.cardFooterBorder }]}>
                <View style={[styles.eventIconBox, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={15} color={cfg.color} />
                </View>
                <View style={styles.eventInfo}>
                  <View style={styles.eventTopRow}>
                    <Text style={[styles.eventType, { color: colors.text }]}>{cfg.label}</Text>
                    {ev.minuto != null && (
                      <View style={[styles.minuteBadge, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.minuteText, { color: colors.textMuted }]}>{ev.minuto}'</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.eventPlayer, { color: colors.textSecondary }]}>
                    {jugador ? `${jugador.nombre} ${jugador.apellido}` : equipoNombre ?? "—"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteEvento(ev.id)}>
                  <Ionicons name="close-circle" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ══ Modal: Asignar Tarjeta con Jugador ══ */}
      <Modal visible={tarjetaModal !== null} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setTarjetaModal(null)} />
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {tarjetaModal?.tipo === "amarilla" ? "🟨 Tarjeta Amarilla" : "🟥 Tarjeta Roja"}
            </Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Minuto (opcional)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
              value={tarjetaMinuto}
              onChangeText={setTarjetaMinuto}
              keyboardType="numeric"
              placeholder="ej. 45"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Seleccionar jugador</Text>
            <ScrollView style={styles.modalPlayerList} nestedScrollEnabled>
              {(tarjetaModal?.jugadores ?? []).length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin jugadores en este equipo.</Text>
              )}
              {(tarjetaModal?.jugadores ?? []).map(j => (
                <TouchableOpacity
                  key={j.id}
                  style={[
                    styles.modalPlayerOption,
                    { borderColor: colors.cardBorder },
                    tarjetaJugador?.id === j.id && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                  ]}
                  onPress={() => setTarjetaJugador(j)}
                >
                  <Text style={[styles.modalPlayerName, { color: colors.text }]}>
                    {j.numero_camiseta ? `#${j.numero_camiseta}  ` : ""}{j.nombre} {j.apellido}
                  </Text>
                  {tarjetaJugador?.id === j.id && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                onPress={() => setTarjetaModal(null)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: colors.accent }, tarjetaSaving && { opacity: 0.7 }]}
                onPress={handleSaveTarjeta}
                disabled={tarjetaSaving}
              >
                {tarjetaSaving
                  ? <ActivityIndicator color={colors.fabText} size="small" />
                  : <Text style={[styles.modalBtnText, { color: colors.fabText }]}>Guardar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ Modal: Agregar Suceso ══ */}
      <Modal visible={sucesosVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setSucesosVisible(false)} />
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Agregar Suceso</Text>

            {/* Tipo */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tipo de evento</Text>
            <View style={styles.sucTipoRow}>
              {(["gol", "amarilla", "roja", "sustitucion"] as TipoEvento[]).map(t => {
                const cfg = TIPO_CONFIG[t];
                const active = sucTipo === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.sucTipoBtn,
                      { borderColor: colors.cardBorder, backgroundColor: colors.surface },
                      active && { backgroundColor: cfg.color, borderColor: cfg.color },
                    ]}
                    onPress={() => setSucTipo(t)}
                  >
                    <Text style={styles.sucTipoBtnEmoji}>
                      {t === "gol" ? "⚽" : t === "amarilla" ? "🟨" : t === "roja" ? "🟥" : "🔄"}
                    </Text>
                    <Text style={[styles.sucTipoBtnLabel, { color: active ? "#fff" : colors.textSecondary }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Equipo */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Equipo</Text>
            <View style={styles.sucEquipoRow}>
              {(["local", "visitante"] as const).map(eq => (
                <TouchableOpacity
                  key={eq}
                  style={[
                    styles.sucEquipoBtn,
                    { borderColor: colors.cardBorder, backgroundColor: colors.surface },
                    sucEquipo === eq && { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                  onPress={() => { setSucEquipo(eq); setSucJugador(null); }}
                >
                  <Text
                    style={[
                      styles.sucEquipoBtnText,
                      { color: colors.textSecondary },
                      sucEquipo === eq && { color: colors.fabText },
                    ]}
                    numberOfLines={1}
                  >
                    {eq === "local" ? partido.equipo_local?.nombre : partido.equipo_visitante?.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minuto */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Minuto (opcional)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
              value={sucMinuto}
              onChangeText={setSucMinuto}
              keyboardType="numeric"
              placeholder="ej. 67"
              placeholderTextColor={colors.textMuted}
            />

            {/* Jugador */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Jugador</Text>
            <ScrollView style={[styles.modalPlayerList, { maxHeight: 140 }]} nestedScrollEnabled>
              {sucJugadores.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin jugadores en este equipo.</Text>
              )}
              {sucJugadores.map(j => (
                <TouchableOpacity
                  key={j.id}
                  style={[
                    styles.modalPlayerOption,
                    { borderColor: colors.cardBorder },
                    sucJugador?.id === j.id && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                  ]}
                  onPress={() => setSucJugador(j)}
                >
                  <Text style={[styles.modalPlayerName, { color: colors.text }]}>
                    {j.numero_camiseta ? `#${j.numero_camiseta}  ` : ""}{j.nombre} {j.apellido}
                  </Text>
                  {sucJugador?.id === j.id && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                onPress={() => setSucesosVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: colors.accent }, sucSaving && { opacity: 0.7 }]}
                onPress={handleSaveSuceso}
                disabled={sucSaving}
              >
                {sucSaving
                  ? <ActivityIndicator color={colors.fabText} size="small" />
                  : <Text style={[styles.modalBtnText, { color: colors.fabText }]}>Guardar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  backBtn: { backgroundColor: "rgba(52,211,153,0.1)", padding: 8, borderRadius: 12, marginRight: 14 },
  themeBtn: { backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 12, marginLeft: 8 },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "900" },
  scroll: { padding: 16 },
  scoreCard: { borderRadius: 24, padding: 20, borderWidth: 1 },

  // Goles
  teamsRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  teamSide: { flex: 1, alignItems: "center" },
  teamLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", marginBottom: 6, letterSpacing: 0.5 },
  teamTitle: { fontSize: 14, fontWeight: "800", textAlign: "center", marginBottom: 14 },
  scoreControl: { flexDirection: "row", alignItems: "center", gap: 10 },
  scoreBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  scoreBtnText: { fontSize: 22, fontWeight: "900", lineHeight: 26 },
  scoreNumber: { fontSize: 38, fontWeight: "900", minWidth: 44, textAlign: "center" },
  vsText: { fontSize: 13, fontWeight: "800", marginHorizontal: 6, marginTop: 52, letterSpacing: 1 },

  // Tarjetas
  divider: { height: 1, marginVertical: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  tarjetasRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  tarjetasSide: { flex: 1, gap: 10 },
  verticalDivider: { width: 1, height: 60, marginHorizontal: 12, alignSelf: "center" },
  tarjetaControl: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardEmoji: { fontSize: 18, width: 24 },
  cardBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  cardBtnText: { fontSize: 18, fontWeight: "900", lineHeight: 22 },
  cardCount: { fontSize: 20, fontWeight: "900", minWidth: 28, textAlign: "center" },

  // Estado
  statusRow: { flexDirection: "row", gap: 10 },
  statusOption: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  statusOptionText: { fontSize: 12, fontWeight: "700" },
  updateBtn: { borderRadius: 14, height: 52, justifyContent: "center", alignItems: "center", marginTop: 20 },
  updateBtnText: { fontSize: 15, fontWeight: "800" },

  // Sucesos header
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 30, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  addSucesoBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addSucesoBtnText: { fontSize: 13, fontWeight: "800" },

  // Cronología
  eventsCard: { borderRadius: 16, padding: 12 },
  eventRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  eventIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  eventInfo: { flex: 1 },
  eventTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eventType: { fontSize: 13, fontWeight: "800" },
  minuteBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  minuteText: { fontSize: 11, fontWeight: "700" },
  eventPlayer: { fontSize: 12, marginTop: 2 },
  emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 10 },

  // Jugadores
  subTitle: { fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  playersList: { borderRadius: 16, padding: 8 },
  playerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottomWidth: 1 },
  playerItemName: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 8 },
  playerActions: { flexDirection: "row", gap: 15 },
  actionIcon: { padding: 6, borderRadius: 8 },

  // Modales
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.55)", padding: 20 },
  modalBox: { width: "100%", maxHeight: "88%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "900", marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  modalInput: { borderRadius: 10, borderWidth: 1, height: 44, paddingHorizontal: 12, fontSize: 15 },
  modalPlayerList: { maxHeight: 180, marginTop: 4 },
  modalPlayerOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginBottom: 6,
  },
  modalPlayerName: { fontSize: 14, fontWeight: "600", flex: 1 },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  modalBtnPrimary: { borderWidth: 0 },
  modalBtnText: { fontSize: 14, fontWeight: "800" },

  // Sucesos modal - tipo
  sucTipoRow: { flexDirection: "row", gap: 6 },
  sucTipoBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  sucTipoBtnEmoji: { fontSize: 16 },
  sucTipoBtnLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },

  // Sucesos modal - equipo
  sucEquipoRow: { flexDirection: "row", gap: 10 },
  sucEquipoBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  sucEquipoBtnText: { fontSize: 12, fontWeight: "700" },
});
