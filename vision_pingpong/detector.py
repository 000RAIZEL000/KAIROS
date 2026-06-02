import cv2
import numpy as np

# =============================================
# PingTrack - Módulo de Visión Artificial
# Integración con Kairos AG
# =============================================

def detectar_pelota(frame):
    """
    Detecta la pelota de ping pong en un frame.
    La pelota es naranja/blanca y circular.
    """
    # Convertir a HSV para detectar color naranja
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Rango de color naranja (pelota ping pong)
    lower_naranja = np.array([5, 150, 150])
    upper_naranja = np.array([25, 255, 255])

    # Rango blanco (por si la pelota es blanca)
    lower_blanco = np.array([0, 0, 200])
    upper_blanco = np.array([180, 30, 255])

    # Crear máscaras
    mask_naranja = cv2.inRange(hsv, lower_naranja, upper_naranja)
    mask_blanco = cv2.inRange(hsv, lower_blanco, upper_blanco)
    mask = cv2.bitwise_or(mask_naranja, mask_blanco)

    # Eliminar ruido
    mask = cv2.erode(mask, None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2)

    # Encontrar contornos
    contornos, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if contornos:
        # Tomar el contorno más grande
        c = max(contornos, key=cv2.contourArea)
        ((x, y), radio) = cv2.minEnclosingCircle(c)

        # Solo si el círculo tiene tamaño razonable
        if radio > 5 and radio < 50:
            return (int(x), int(y), int(radio))

    return None


def main():
    print("🏓 PingTrack - Iniciando detección...")
    print("Presiona Q para salir")

    cap = cv2.VideoCapture(0)  # 0 = cámara principal

    if not cap.isOpened():
        print("❌ No se pudo abrir la cámara")
        return

    puntos_trayectoria = []  # Guarda la trayectoria de la pelota

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        resultado = detectar_pelota(frame)

        if resultado:
            x, y, radio = resultado

            # Dibujar círculo alrededor de la pelota
            cv2.circle(frame, (x, y), radio, (0, 255, 0), 2)
            cv2.circle(frame, (x, y), 3, (0, 0, 255), -1)

            # Guardar trayectoria
            puntos_trayectoria.append((x, y))
            if len(puntos_trayectoria) > 20:
                puntos_trayectoria.pop(0)

            # Dibujar trayectoria
            for i in range(1, len(puntos_trayectoria)):
                cv2.line(
                    frame,
                    puntos_trayectoria[i - 1],
                    puntos_trayectoria[i],
                    (0, 255, 255), 2
                )

            # Mostrar coordenadas
            cv2.putText(
                frame,
                f"Pelota: ({x}, {y})",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 255, 0), 2
            )

        else:
            cv2.putText(
                frame,
                "Buscando pelota...",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 0, 255), 2
            )

        # Mostrar ventana
        cv2.imshow("PingTrack - Kairos AG", frame)

        # Salir con Q
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("✅ Detección finalizada")


if __name__ == "__main__":
    main()