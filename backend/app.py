"""
Sistema Inteligente de Reconocimiento de Señas
Backend principal - Estructura limpia y organizada
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from routes.routes_generales import router as general_router
from routes.vocales.routes_vocales import router as vocales_router
from routes.abecedario.routes_abecedario import router as abecedario_router
from routes.numeros.routes_numeros import router as numeros_router
from routes.operaciones.routes_operaciones import router as operaciones_router
from routes.calculadora.routes_calculadora import router as calculadora_router

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(general_router, prefix="/api/v1", tags=["General"])
app.include_router(vocales_router, prefix="/api/v1", tags=["Vocales"])
app.include_router(abecedario_router, prefix="/api/v1", tags=["Abecedario"])  # ✅ ya incluye /train
app.include_router(numeros_router, prefix="/api/v1", tags=["Números"])
app.include_router(operaciones_router, prefix="/api/v1", tags=["Operaciones"])
app.include_router(calculadora_router, prefix="/api/v1", tags=["Calculadora"])

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Sistema Inteligente de Reconocimiento de Señas",
        "version": settings.VERSION,
        "status": "active",
        "endpoints": {
            "health": "/health",
            "ai_agent": "/api/v1/ai-agent",
            "vocales": "/api/v1/vocales",
            "abecedario": "/api/v1/abecedario",   # 👈 aquí estarán también /train, /stats, etc.
            "numeros": "/api/v1/numeros",
            "operaciones": "/api/v1/operaciones",
            "calculadora": "/api/v1/calculadora"
        }
    }

if __name__ == "__main__":
    print(f" Iniciando {settings.APP_NAME} v{settings.VERSION}")
    print(f" Configuración: {settings.HOST}:{settings.PORT}")
    print(f" Debug: {settings.DEBUG}")
    
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
