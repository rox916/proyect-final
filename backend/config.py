"""
Configuración del Sistema Inteligente de Reconocimiento de Señas
"""

class Settings:
    # Información de la aplicación
    APP_NAME = "Sistema Inteligente de Reconocimiento de Señas"
    VERSION = "1.0.0"
    DESCRIPTION = "API para sistema de reconocimiento de señas con IA"
    
    # Configuración del servidor
    HOST = "localhost"
    PORT = 8000
    DEBUG = True
    
    # CORS
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # MediaPipe
    MEDIAPIPE_MODEL_COMPLEXITY = 1
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE = 0.5
    
    # Machine Learning
    DEFAULT_MODEL_TYPE = "RandomForest"
    MIN_SAMPLES_FOR_TRAINING = 2
    MAX_SAMPLES_FOR_COLLECTION = 25
    OPTIMAL_SAMPLES_FOR_TRAINING = 25

# Instancia global de configuración
settings = Settings()