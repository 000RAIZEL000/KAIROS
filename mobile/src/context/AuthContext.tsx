import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/src/api/client";
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
  login: (token: string, userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 RESTAURAR SESIÓN AL ABRIR APP
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");

        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log("❌ Error restaurando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ✅ LOGIN
  const login = async (token: string, userData: AuthUser) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);

    // 🔥 REDIRECCIÓN AL HOME
    router.replace("/home");
  };

  // ✅ LOGOUT (SOLUCIÓN FINAL)
  const logout = async () => {
    try {
      // 🔥 BORRAR TODO
      await AsyncStorage.clear();

      // 🔥 ELIMINAR TOKEN
      delete api.defaults.headers.common.Authorization;

      // 🔥 LIMPIAR ESTADO
      setUser(null);

      console.log("✅ Sesión cerrada correctamente");

      // 🔥 REDIRECCIÓN AL LOGIN
      router.replace("/login");
    } catch (error) {
      console.log("❌ Error en logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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