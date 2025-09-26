"""
Modelos Pydantic para el Sistema Inteligente de Reconocimiento de Señas
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Landmark(BaseModel):
    """Punto de referencia de la mano (21 landmarks)"""
    x: float
    y: float
    z: float

class User(BaseModel):
    """Usuario del sistema"""
    id: int
    name: str
    email: str
    created_at: str

class Category(BaseModel):
    """Categoría de señas"""
    id: int
    name: str
    description: str
    type: str  # vocales, numeros, operaciones, algebraicas
    user_id: int
    sample_count: int
    created_at: str

class Sample(BaseModel):
    """Muestra de seña capturada"""
    id: int
    landmarks: List[Landmark]
    category_name: str
    user_id: int
    category_id: int
    timestamp: str
    created_at: str

class Model(BaseModel):
    """Modelo entrenado"""
    id: int
    name: str
    category_id: int
    user_id: int
    accuracy: Optional[float] = None
    status: str = "pending"  # pending, training, trained, failed
    created_at: str
    updated_at: str
    
    model_config = {"protected_namespaces": ()}

class SampleCreate(BaseModel):
    """Crear nueva muestra"""
    landmarks: List[Landmark]
    category_name: str
    timestamp: Optional[str] = None

class PredictionResult(BaseModel):
    """Resultado de predicción"""
    prediction: str
    confidence: float
    model_id: int
    timestamp: str
    
    model_config = {"protected_namespaces": ()}

class AIAgentMessage(BaseModel):
    """Mensaje del agente IA"""
    message: str
    type: str  # welcome, guidance, feedback, analytics
    data: Optional[Dict[str, Any]] = None
    timestamp: str

class AnalyticsData(BaseModel):
    """Datos de analíticas"""
    total_categories: int
    total_samples: int
    total_models: int
    category_distribution: Dict[str, int]
    accuracy_evolution: List[Dict[str, Any]]
    recommendations: List[str]