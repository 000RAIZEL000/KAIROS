import requests

BASE_URL = "https://kairos-backend-w96l.onrender.com"

class KairosClient:
    def __init__(self, email, password):
        self.token = None
        self.base_url = BASE_URL
        self.email = email
        self.password = password

    def login(self):
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
                print(f"❌ Error login: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ No se pudo conectar: {e}")
            return False

    def get_marcador(self, partido_id):
        try:
            response = requests.get(
                f"{self.base_url}/api/partidos/{partido_id}/",
                headers={"Authorization": f"Bearer {self.token}"}
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None


if __name__ == "__main__":
    cliente = KairosClient(
        email="admin@kairos.com",
        password="Admin123!"
    )

    if cliente.login():
        print("✅ Conexión con Kairos AG exitosa")
    else:
        print("⚠️ Revisa credenciales o espera que Render despierte")