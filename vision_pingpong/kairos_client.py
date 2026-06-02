import requests

# =============================================
# PingTrack - Cliente API Kairos AG
# Envía eventos de ping pong al backend
# =============================================

# Cambia esto por la URL de tu backend
BASE_URL = "http://localhost:8000"

class KairosClient:
    def __init__(self, email, password):
        self.token = None
        self.base_url = BASE_URL
        self.email = email
        self.password = password

    def login(self):
        """Inicia sesión en Kairos AG y obtiene el JWT"""
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login/",
                json={
                    "email": self.email,
                    "password": self.password
                }
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access")
                print(f"✅ Conectado a Kairos AG")
                return True
            else:
                print(f"❌ Error login: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ No se pudo conectar al backend: {e}")
            return False

    def registrar_punto(self, partido_id, equipo):
        """
        Registra un punto en Kairos AG
        equipo: 'local' o 'visitante'
        """
        if not self.token:
            print("❌ No hay sesión activa")
            return False

        try:
            response = requests.post(
                f"{self.base_url}/api/partidos/{partido_id}/punto/",
                json={"equipo": equipo},
                headers={"Authorization": f"Bearer {self.token}"}
            )
            if response.status_code == 200:
                print(f"🏓 Punto registrado para: {equipo}")
                return True
            else:
                print(f"❌ Error registrando punto: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

    def get_marcador(self, partido_id):
        """Obtiene el marcador actual del partido"""
        try:
            response = requests.get(
                f"{self.base_url}/api/partidos/{partido_id}/",
                headers={"Authorization": f"Bearer {self.token}"}
            )
            if response.status_code == 200:
                data = response.json()
                return data
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None


# Test rápido — corre esto para probar la conexión
if __name__ == "__main__":
    cliente = KairosClient(
        email="admin@kairos.com",
        password="tu_password"
    )

    if cliente.login():
        print("✅ Conexión con Kairos AG exitosa")
        marcador = cliente.get_marcador(partido_id=1)
        if marcador:
            print(f"📊 Marcador actual: {marcador}")
    else:
        print("⚠️ Backend no disponible - modo offline")