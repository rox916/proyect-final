"""
Rutas generales del Sistema Inteligente de Reconocimiento de Señas
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
import json
import os
from datetime import datetime

from models import User, Category, Sample, Model, AIAgentMessage, AnalyticsData
from config import settings
# store import removed

router = APIRouter()

@router.get("/", response_model=Dict[str, str])
async def root():
    """Endpoint raíz"""
    return {
        "message": "Sistema Inteligente de Reconocimiento de Señas",
        "version": settings.VERSION,
        "status": "active"
    }

@router.get("/health", response_model=Dict[str, str])
async def health_check():
    """Verificar estado del sistema"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION
    }

@router.get("/ai-agent/welcome/{user_id}", response_model=AIAgentMessage)
async def get_welcome_message(user_id: int):
    """Mensaje de bienvenida del agente IA"""
    user = {"id": user_id, "name": "Usuario Demo", "email": "demo@example.com"}
    user_name = user.get("name", "Usuario") if user else "Usuario"
    
    return AIAgentMessage(
        message=f"¡Hola, {user_name}! Soy tu asistente de IA. Te guiaré en la creación de tu librería de señas. ¿Listo para empezar?",
        type="welcome",
        timestamp=datetime.now().isoformat()
    )

@router.get("/ai-agent/guidance/{user_id}/{category_name}", response_model=AIAgentMessage)
async def get_capture_guidance(user_id: int, category_name: str):
    """Guía de captura del agente IA"""
    guidance_messages = {
        "vocales": "Por favor, realiza la seña para la vocal. Asegúrate de que tu mano esté bien visible en el centro de la cámara.",
        "numeros": "Por favor, realiza la seña para el número. Mantén la mano estable y visible.",
        "operaciones": "Por favor, realiza la seña para la operación matemática. Asegúrate de que el gesto sea claro.",
        "algebraicas": "Por favor, realiza la seña para la expresión algebraica. Mantén la mano visible y el gesto consistente."
    }
    
    message = guidance_messages.get(category_name, "Por favor, realiza la seña. Asegúrate de que tu mano esté bien visible.")
    
    return AIAgentMessage(
        message=message,
        type="guidance",
        timestamp=datetime.now().isoformat()
    )

@router.get("/ai-agent/feedback/{user_id}/{accuracy}", response_model=AIAgentMessage)
async def get_training_feedback(user_id: int, accuracy: float):
    """Retroalimentación del entrenamiento"""
    if accuracy > 0.95:
        message = f"¡Excelente! Tu modelo ha alcanzado una precisión del {accuracy:.2f}%. ¡Está listo para usar!"
    elif accuracy > 0.80:
        message = f"Buen trabajo. Tu modelo tiene una precisión del {accuracy:.2f}%. Puedes intentar añadir más muestras para mejorarlo."
    else:
        message = f"Tu modelo tiene una precisión del {accuracy:.2f}%. Necesitamos más muestras o un reentrenamiento. ¡No te rindas!"
    
    return AIAgentMessage(
        message=message,
        type="feedback",
        data={"accuracy": accuracy},
        timestamp=datetime.now().isoformat()
    )

@router.get("/analytics/{user_id}", response_model=AnalyticsData)
async def get_analytics(user_id: int):
    """Obtener analíticas del usuario"""
    user_categories = []
    user_samples = []
    user_models = []
    
    category_distribution = {}
    for category in user_categories:
        cat_type = category.get("type", "unknown")
        category_distribution[cat_type] = category_distribution.get(cat_type, 0) + 1
    
    return AnalyticsData(
        total_categories=len(user_categories),
        total_samples=len(user_samples),
        total_models=len(user_models),
        category_distribution=category_distribution,
        accuracy_evolution=[],
        recommendations=[]
    )
