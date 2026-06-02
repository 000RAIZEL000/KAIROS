# KAIROS

Proyecto de gestión de torneos y equipos.

## Estructura del Proyecto

```text
KAIROS/
├── backend/        # API FastAPI
│   ├── app/        # Lógica de la aplicación
│   ├── scripts/    # Scripts auxiliares
│   ├── main.py     # Punto de entrada
│   └── ...
├── frontend/       # Aplicación Web (Vite + React)
│   ├── src/
│   └── ...
├── mobile/         # Aplicación Móvil (Expo)
└── docker-compose.yml
```

## Ejecución

### Backend
1. Entrar a la carpeta: `cd backend`
2. Instalar dependencias: `pip install -r requirements.txt`
3. Iniciar servidor: `uvicorn main:app --reload`
   - La API estará en: `http://localhost:8000`
   - Documentación: `http://localhost:8000/docs`

### Frontend
1. Entrar a la carpeta: `cd frontend`
2. Instalar dependencias: `npm install`
3. Iniciar desarrollo: `npm run dev`
   - La app estará en: `http://localhost:5173`

### Scripts de Utilidad
Se encuentran en `backend/scripts/`:
- `seed_torneos.py`: Poblar la base de datos con datos de prueba.
- `create_admin.py`: Crear un usuario administrador.
- `reset_admin_v2.py`: Resetear la contraseña del admin.
