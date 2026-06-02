import cv2
import numpy as np
import time

# =============================================
# PingTrack - Detector con lógica de puntos
# =============================================

# Mitad de la mesa — divide lado local y visitante
MITAD_X = 320  # ajusta según tu cámara

puntos_local = 0
puntos_visitante = 0
ultima_posicion = None
ultimo_punto_tiempo = 0
COOLDOWN_SEGUNDOS = 2  # evita contar el mismo punto dos veces

def detectar_pelota(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    lower_naranja = np.array([5, 150, 150])
    upper_naranja = np.array([25, 255, 255])
    lower_blanco = np.array([0, 0, 200])
    upper_blanco = np.array([180, 30, 255])

    mask_naranja = cv2.inRange(hsv, lower_naranja, upper_naranja)
    mask_blanco = cv2.inRange(hsv, lower_blanco, upper_blanco)
    mask = cv2.bitwise_or(mask_naranja, mask_blanco)

    mask = cv2.erode(mask, None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2)

    contornos, _ = cv2.findContours(
        mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if contornos:
        c = max(contornos, key=cv2.contourArea)
        ((x, y), radio) = cv2.minEnclosingCircle(c)
        if radio > 5 and radio < 50:
            return (int(x), int(y), int(radio))

    return None


def detectar_punto(x_actual, x_anterior):
    """
    Detecta si hubo un punto basado en el movimiento de la pelota.
    Si la pelota cruza de un lado al otro y desaparece = punto.
    """
    global ultimo_punto_tiempo

    ahora = time.time()
    if ahora - ultimo_punto_tiempo < COOLDOWN_SEGUNDOS:
        return None

    # Si la pelota estaba en lado visitante (derecha) y desaparece = punto local
    # Si la pelota estaba en lado local (izquierda) y desaparece = punto visitante
    if x_anterior:
        if x_anterior > MITAD_X:
            ultimo_punto_tiempo = ahora
            return "local"
        else:
            ultimo_punto_tiempo = ahora
            return "visitante"

    return None


def dibujar_marcador(frame, local, visitante):
    """Dibuja el marcador en pantalla"""
    h, w = frame.shape[:2]

    # Fondo semitransparente para el marcador
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 70), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

    # Línea divisoria de la mesa
    cv2.line(frame, (MITAD_X, 0), (MITAD_X, h), (255, 255, 0), 1)

    # Marcador
    cv2.putText(frame, f"LOCAL: {local}",
                (10, 45), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
    cv2.putText(frame, f"VISITANTE: {visitante}",
                (w//2 + 10, 45), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 200, 255), 3)

    return frame


def main():
    global puntos_local, puntos_visitante, ultima_posicion

    print("🏓 PingTrack - Kairos AG")
    print("Presiona Q para salir")
    print("Presiona R para reiniciar marcador")

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ No se pudo abrir la cámara")
        return

    puntos_trayectoria = []
    ultima_pos_conocida = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        resultado = detectar_pelota(frame)

        if resultado:
            x, y, radio = resultado

            # Detectar punto por desaparición
            punto = detectar_punto(x, ultima_pos_conocida)
            if punto == "local":
                puntos_local += 1
                print(f"✅ PUNTO LOCAL — {puntos_local} vs {puntos_visitante}")
            elif punto == "visitante":
                puntos_visitante += 1
                print(f"✅ PUNTO VISITANTE — {puntos_local} vs {puntos_visitante}")

            ultima_pos_conocida = x

            # Trayectoria
            puntos_trayectoria.append((x, y))
            if len(puntos_trayectoria) > 20:
                puntos_trayectoria.pop(0)

            # Dibujar pelota
            cv2.circle(frame, (x, y), radio, (0, 255, 0), 2)
            cv2.circle(frame, (x, y), 3, (0, 0, 255), -1)

            # Dibujar trayectoria
            for i in range(1, len(puntos_trayectoria)):
                cv2.line(frame,
                         puntos_trayectoria[i-1],
                         puntos_trayectoria[i],
                         (0, 255, 255), 2)
        else:
            ultima_pos_conocida = None
            puntos_trayectoria = []

        # Dibujar marcador
        frame = dibujar_marcador(frame, puntos_local, puntos_visitante)

        cv2.imshow("PingTrack - Kairos AG", frame)

        tecla = cv2.waitKey(1) & 0xFF
        if tecla == ord('q'):
            break
        elif tecla == ord('r'):
            puntos_local = 0
            puntos_visitante = 0
            print("🔄 Marcador reiniciado")

    cap.release()
    cv2.destroyAllWindows()
    print(f"Resultado final: LOCAL {puntos_local} - VISITANTE {puntos_visitante}")


if __name__ == "__main__":
    main()