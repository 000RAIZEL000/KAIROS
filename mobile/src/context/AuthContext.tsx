import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/api/client";
import { updateProfile as updateProfileApi } from "../api/auth";
import { router } from "expo-router";

type AuthUser = {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  role: string;
  activo?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  profilePhoto: string | null;
  login: (token: string, userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Pick<AuthUser, "nombre" | "telefono">>) => Promise<void>;
  updateProfilePhoto: (uri: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_PHOTO_KEY = "profile_photo";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
        const savedPhoto = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);

        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        }
      } catch (error) {
        console.log("❌ Error restaurando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (token: string, userData: AuthUser) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    router.replace("/home");
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      setProfilePhoto(null);
      router.replace("/login");
    } catch (error) {
      console.log("❌ Error en logout:", error);
    }
  };

  const updateUser = async (data: Partial<Pick<AuthUser, "nombre" | "telefono">>) => {
    const updated = await updateProfileApi(data);
    const newUser: AuthUser = { ...user!, ...updated };
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const updateProfilePhoto = async (uri: string | null) => {
    if (uri) {
      await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
    } else {
      await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
    }
    setProfilePhoto(uri);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profilePhoto, login, logout, updateUser, updateProfilePhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
