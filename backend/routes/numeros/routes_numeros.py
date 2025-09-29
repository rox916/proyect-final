"""
Rutas específicas para el manejo de números
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from models import Category, Sample, SampleCreate, Model, PredictionResult
from config import settings
from store import store
from datos_manager import datos_manager

router = APIRouter()

# Números disponibles (0-9)
NUMEROS = [str(i) for i in range(10)]  # 0-9

@router.get("/numeros", response_model=List[str])
async def get_numeros():
    """Obtener lista de números disponibles"""
    return NUMEROS

@router.post("/numeros/category/{user_id}", response_model=Category)
async def create_numeros_category(user_id: int):
    """Crear categoría de números para el usuario"""
    category_id = len(data_store["categories"]) + 1
    
    category = Category(
        id=category_id,
        name="Números 0-9",
        description="Categoría para entrenar los números del 0 al 9",
        type="numeros",
        user_id=user_id,
        sample_count=0,
        created_at=datetime.now().isoformat()
    )
    
    store.categories[category_id] = category.dict()
    store.save_data()
    
    return category

@router.get("/numeros/samples/{user_id}", response_model=List[Sample])
async def get_numeros_samples(user_id: int):
    """Obtener muestras de números del usuario"""
    try:
        data = datos_manager.get_samples("numeros")
        user_samples = [
            Sample(**sample) for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
    except Exception as e:
        user_samples = []
    return user_samples

@router.post("/numeros/samples/{user_id}", response_model=Sample)
async def create_numeros_sample(user_id: int, sample: SampleCreate):
    """Crear muestra de número"""
    # Validar que el número compuesto solo contenga dígitos del 0-9
    if not sample.category_name.isdigit():
        raise HTTPException(
            status_code=400,
            detail=f"Número '{sample.category_name}' no válido. Solo se permiten números compuestos por dígitos del 0-9."
        )
    
    # Verificar que todos los dígitos estén en la lista de dígitos válidos
    for digit in sample.category_name:
        if digit not in NUMEROS:
            raise HTTPException(
                status_code=400,
                detail=f"Dígito '{digit}' no válido en el número '{sample.category_name}'. Dígitos disponibles: {NUMEROS}"
            )
    
    # Verificar límite de recolección por número individual
    try:
        data = datos_manager.get_samples("numeros", sample.category_name)
        user_samples = [
            s for s in data.get("samples", [])
            if s.get("user_id") == user_id
        ]
        
        if len(user_samples) >= settings.MAX_SAMPLES_FOR_COLLECTION:
            raise HTTPException(
                status_code=400,
                detail=f"Límite de recolección alcanzado para el número '{sample.category_name}'. Máximo {settings.MAX_SAMPLES_FOR_COLLECTION} muestras permitidas por número. Actualmente tienes {len(user_samples)} muestras del número '{sample.category_name}'."
            )
    except Exception as e:
        if "Límite de recolección alcanzado" in str(e):
            raise e
        # Si hay otro error, continuar (puede ser que no existan datos aún)
    
    try:
        # Guardar en sistema de archivos separado
        saved_sample = datos_manager.save_sample(
            category="numeros",
            sign=sample.category_name,
            landmarks=sample.landmarks,
            user_id=user_id,
            landmarks_left=sample.landmarks_left,
            landmarks_right=sample.landmarks_right
        )
        
        # Crear objeto Sample para respuesta
        new_sample = Sample(
            id=saved_sample["id"],
            landmarks=sample.landmarks,
            landmarks_left=sample.landmarks_left,
            landmarks_right=sample.landmarks_right,
            category_name=sample.category_name,
            user_id=user_id,
            category_id=3,  # ID de la categoría de números
            timestamp=sample.timestamp or datetime.now().isoformat(),
            created_at=datetime.now().isoformat()
        )
        
        return new_sample
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error guardando muestra: {str(e)}"
        )

@router.get("/numeros/training-status/{user_id}")
async def get_numeros_training_status(user_id: int):
    """Obtener estado de entrenamiento de números"""
    try:
        data = datos_manager.get_samples("numeros")
        user_samples = [
            sample for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
        
        # Contar muestras por número (método correcto)
        numero_counts = {}
        for numero in NUMEROS:
            numero_data = datos_manager.get_samples("numeros", numero)
            numero_user_samples = [s for s in numero_data.get("samples", []) if s.get("user_id") == user_id]
            numero_counts[numero] = len(numero_user_samples)
        
        total_samples = len(user_samples)
        can_train = total_samples >= settings.MIN_SAMPLES_FOR_TRAINING
        
        # Verificar límites por número individual
        numero_limits = {}
        for numero in NUMEROS:
            numero_data = datos_manager.get_samples("numeros", numero)
            numero_user_samples = [
                sample for sample in numero_data.get("samples", [])
                if sample.get("user_id") == user_id
            ]
            numero_limits[numero] = {
                "count": len(numero_user_samples),
                "max_reached": len(numero_user_samples) >= settings.MAX_SAMPLES_FOR_COLLECTION,
                "remaining": max(0, settings.MAX_SAMPLES_FOR_COLLECTION - len(numero_user_samples))
            }
        
        return {
            "total_samples": total_samples,
            "numero_counts": numero_counts,
            "numero_limits": numero_limits,
            "can_train": can_train,
            "ready_for_optimal": total_samples >= settings.OPTIMAL_SAMPLES_FOR_TRAINING,
            "max_collection_reached": total_samples >= settings.MAX_SAMPLES_FOR_COLLECTION,
            "numeros_available": NUMEROS
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estado: {str(e)}"
        )

@router.post("/numeros/predict/{user_id}", response_model=PredictionResult)
async def predict_numero(user_id: int, landmarks: List[Dict[str, float]], landmarks_left: List[Dict[str, float]] = None, landmarks_right: List[Dict[str, float]] = None):
    """Predecir número basado en landmarks usando el modelo entrenado (dos manos)"""
    try:
        from ml_model import models
        
        # Verifica si el modelo está entrenado
        if "numeros" not in models:
            return PredictionResult(
                prediction="Modelo no entrenado",
                confidence=0.0,
                model_id=3,
                timestamp=datetime.now().isoformat()
            )
        
        model = models["numeros"]
        result = model.predict(landmarks, landmarks_left, landmarks_right)   # 👈 Usa el modelo entrenado con dos manos
        
        return PredictionResult(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_id=3,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return PredictionResult(
            prediction="Error ML",
            confidence=0.0,
            model_id=3,
            timestamp=datetime.now().isoformat()
        )


@router.post("/numeros/train/{user_id}")
async def train_numeros_model(user_id: int):
    """Entrenar modelo de ML para números"""
    try:
        from ml_model import models
        
        model = models["numeros"]
        result = model.train()
        
        return {
            "success": result["success"],
            "message": result["message"],
            "accuracy": result["accuracy"],
            "samples": result["samples"],
            "classes": result.get("classes", []),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error entrenando modelo: {str(e)}"
        )

@router.get("/numeros/stats/{user_id}")
async def get_numeros_stats(user_id: int):
    """Obtener estadísticas de números"""
    try:
        stats = datos_manager.get_category_stats("numeros")
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas: {str(e)}"
        )

@router.delete("/numeros/samples/{user_id}/{numero}")
async def delete_numero_samples(user_id: int, numero: str):
    """Eliminar todas las muestras de un número específico"""
    # Validar que el número compuesto solo contenga dígitos del 0-9
    if not numero.isdigit():
        raise HTTPException(
            status_code=400,
            detail=f"Número '{numero}' no válido. Solo se permiten números compuestos por dígitos del 0-9."
        )
    
    # Verificar que todos los dígitos estén en la lista de dígitos válidos
    for digit in numero:
        if digit not in NUMEROS:
            raise HTTPException(
                status_code=400,
                detail=f"Dígito '{digit}' no válido en el número '{numero}'. Dígitos disponibles: {NUMEROS}"
            )
    
    try:
        success = datos_manager.delete_sign_samples("numeros", numero)
        if success:
            return {
                "message": f"Eliminadas todas las muestras del número '{numero}'",
                "deleted": True
            }
        else:
            return {
                "message": f"No se encontraron muestras para el número '{numero}'",
                "deleted": False
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error eliminando muestras: {str(e)}"
        )
