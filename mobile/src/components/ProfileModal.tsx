import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

function getInitials(str?: string | null): string {
  if (!str) return "?";
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return str.substring(0, 2).toUpperCase();
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ProfileModal({ visible, onClose }: Props) {
  const { user, profilePhoto, updateUser, updateProfilePhoto, logout } = useAuth();
  const { colors } = useAppTheme();

  const [localNombre, setLocalNombre] = useState("");
  const [localTelefono, setLocalTelefono] = useState("");
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalNombre(user?.nombre ?? "");
      setLocalTelefono(user?.telefono ?? "");
      setLocalPhoto(null);
    }
  }, [visible, user]);

  const displayPhoto = localPhoto ?? profilePhoto;
  const initials = getInitials(user?.nombre || user?.email);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería de fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  const handlePickPhoto = () => {
    Alert.alert("Cambiar foto de perfil", "Selecciona la fuente", [
      { text: "Galería", onPress: pickFromGallery },
      { text: "Cámara", onPress: pickFromCamera },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!localNombre.trim()) {
      Alert.alert("Campo requerido", "El nombre no puede estar vacío.");
      return;
    }
    try {
      setSaving(true);
      await updateUser({ nombre: localNombre.trim(), telefono: localTelefono.trim() || null });
      if (localPhoto) {
        await updateProfilePhoto(localPhoto);
      }
      onClose();
    } catch {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handlePickPhoto} style={styles.avatarWrapper}>
                {displayPhoto ? (
                  <Image source={{ uri: displayPhoto }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: "#34d399" }]}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
                <View style={[styles.cameraOverlay, { backgroundColor: colors.accent }]}>
                  <Ionicons name="camera" size={16} color={colors.fabText} />
                </View>
              </TouchableOpacity>
              <Text style={[styles.avatarHint, { color: colors.textMuted }]}>Toca para cambiar foto</Text>
            </View>

            {/* Info */}
            <View style={styles.emailRow}>
              <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.emailText, { color: colors.textMuted }]}>{user?.email}</Text>
            </View>

            {user?.role === "admin" && (
              <View style={[styles.roleBadge, { backgroundColor: "rgba(52,211,153,0.15)" }]}>
                <Text style={{ color: "#34d399", fontSize: 11, fontWeight: "800" }}>ADMINISTRADOR</Text>
              </View>
            )}

            {/* Nombre */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
              value={localNombre}
              onChangeText={setLocalNombre}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
            />

            {/* Teléfono */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Teléfono (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.cardBorder }]}
              value={localTelefono}
              onChangeText={setLocalTelefono}
              placeholder="ej. +34 600 000 000"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            {/* Guardar */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={colors.fabText} />
                : <Text style={[styles.saveBtnText, { color: colors.fabText }]}>Guardar cambios</Text>
              }
            </TouchableOpacity>

            {/* Cerrar sesión */}
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger }]} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#022c22",
    fontSize: 32,
    fontWeight: "900",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHint: {
    fontSize: 12,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 13,
  },
  roleBadge: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  saveBtn: {
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
