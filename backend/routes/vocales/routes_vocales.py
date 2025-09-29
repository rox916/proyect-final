"""
Rutas específicas para el manejo de vocales
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from models import Category, Sample, SampleCreate, Model, PredictionResult
from config import settings
from store import store
from datos_manager import datos_manager

router = APIRouter()

# Vocales disponibles
VOCALES = ["A", "E", "I", "O", "U"]

@router.get("/vocales", response_model=List[str])
async def get_vocales():
    """Obtener lista de vocales disponibles"""
    return VOCALES

@router.post("/vocales/category/{user_id}", response_model=Category)
async def create_vocales_category(user_id: int):
    """Crear categoría de vocales para el usuario"""
    category_id = len(store.categories) + 1
    
    category = Category(
        id=category_id,
        name="Vocales A, E, I, O, U",
        description="Categoría para entrenar las vocales básicas",
        type="vocales",
        user_id=user_id,
        sample_count=0,
        created_at=datetime.now().isoformat()
    )
    
    store.categories[category_id] = category.model_dump()
    store.save_data()
    
    return category

@router.get("/vocales/samples/{user_id}", response_model=List[Sample])
async def get_vocales_samples(user_id: int):
    """Obtener muestras de vocales del usuario"""
    user_samples = [
        Sample(**sample) for sample in store.samples.values()
        if sample.get("user_id") == user_id and sample.get("category_name") in VOCALES
    ]
    return user_samples

@router.post("/vocales/samples/{user_id}", response_model=Sample)
async def create_vocales_sample(user_id: int, sample: SampleCreate):
    """Crear muestra de vocal"""
    if sample.category_name not in VOCALES:
        raise HTTPException(
            status_code=400,
            detail=f"Vocal '{sample.category_name}' no válida. Vocales disponibles: {VOCALES}"
        )
    
    # Verificar límite de recolección por vocal individual
    try:
        data = datos_manager.get_samples("vocales", sample.category_name)
        user_samples = [
            s for s in data.get("samples", [])
            if s.get("user_id") == user_id
        ]
        
        if len(user_samples) >= settings.MAX_SAMPLES_FOR_COLLECTION:
            raise HTTPException(
                status_code=400,
                detail=f"Límite de recolección alcanzado para la vocal '{sample.category_name}'. Máximo {settings.MAX_SAMPLES_FOR_COLLECTION} muestras permitidas por vocal. Actualmente tienes {len(user_samples)} muestras de la vocal '{sample.category_name}'."
            )
    except Exception as e:
        if "Límite de recolección alcanzado" in str(e):
            raise e
        # Si hay otro error, continuar (puede ser que no existan datos aún)
    
    try:
        # Guardar en sistema de archivos separado
        saved_sample = datos_manager.save_sample(
            category="vocales",
            sign=sample.category_name,
            landmarks=sample.landmarks,
            user_id=user_id
        )
        
        # Crear objeto Sample para respuesta
        new_sample = Sample(
            id=saved_sample["id"],
            landmarks=sample.landmarks,
            category_name=sample.category_name,
            user_id=user_id,
            category_id=1,  # ID de la categoría de vocales
            timestamp=sample.timestamp or datetime.now().isoformat(),
            created_at=datetime.now().isoformat()
        )
        
        return new_sample
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error guardando muestra: {str(e)}"
        )

@router.get("/vocales/training-status/{user_id}")
async def get_vocales_training_status(user_id: int):
    """Obtener estado de entrenamiento de vocales"""
    try:
        data = datos_manager.get_samples("vocales")
        user_samples = [
            sample for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
        
        # Contar muestras por vocal (método correcto)
        vocal_counts = {}
        for vocal in VOCALES:
            vocal_data = datos_manager.get_samples("vocales", vocal)
            vocal_user_samples = [s for s in vocal_data.get("samples", []) if s.get("user_id") == user_id]
            vocal_counts[vocal] = len(vocal_user_samples)
        
        total_samples = len(user_samples)
        can_train = total_samples >= settings.MIN_SAMPLES_FOR_TRAINING
        
        # Verificar límites por vocal individual
        vocal_limits = {}
        for vocal in VOCALES:
            vocal_data = datos_manager.get_samples("vocales", vocal)
            vocal_user_samples = [
                sample for sample in vocal_data.get("samples", [])
                if sample.get("user_id") == user_id
            ]
            vocal_limits[vocal] = {
                "count": len(vocal_user_samples),
                "max_reached": len(vocal_user_samples) >= settings.MAX_SAMPLES_FOR_COLLECTION,
                "remaining": max(0, settings.MAX_SAMPLES_FOR_COLLECTION - len(vocal_user_samples))
            }
        
        return {
            "total_samples": total_samples,
            "vocal_counts": vocal_counts,
            "vocal_limits": vocal_limits,
            "can_train": can_train,
            "ready_for_optimal": total_samples >= settings.OPTIMAL_SAMPLES_FOR_TRAINING,
            "max_collection_reached": total_samples >= settings.MAX_SAMPLES_FOR_COLLECTION,
            "vocales_available": VOCALES
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estado: {str(e)}"
        )

@router.post("/vocales/train/{user_id}")
async def train_vocales_model(user_id: int):
    """Entrenar modelo de ML para vocales"""
    try:
        from ml_model import models
        
        model = models["vocales"]
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

@router.post("/vocales/predict/{user_id}", response_model=PredictionResult)
async def predict_vocal(user_id: int, landmarks: List[Dict[str, float]]):
    """Predecir vocal basada en landmarks usando el modelo entrenado"""
    try:
        from ml_model import models
        
        # Verifica si el modelo está entrenado
        if "vocales" not in models:
            return PredictionResult(
                prediction="Modelo no entrenado",
                confidence=0.0,
                model_id=1,
                timestamp=datetime.now().isoformat()
            )
        
        model = models["vocales"]
        result = model.predict(landmarks)   # 👈 Usa el modelo entrenado
        
        return PredictionResult(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_id=1,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return PredictionResult(
            prediction="Error ML",
            confidence=0.0,
            model_id=1,
            timestamp=datetime.now().isoformat()
        )

@router.get("/vocales/stats/{user_id}")
async def get_vocales_stats(user_id: int):
    """Obtener estadísticas de vocales"""
    try:
        stats = datos_manager.get_category_stats("vocales")
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas: {str(e)}"
        )

@router.delete("/vocales/samples/{user_id}/{vocal}")
async def delete_vocal_samples(user_id: int, vocal: str):
    """Eliminar todas las muestras de una vocal específica"""
    if vocal not in VOCALES:
        raise HTTPException(
            status_code=400,
            detail=f"Vocal '{vocal}' no válida"
        )
    
    try:
        success = datos_manager.delete_sign_samples("vocales", vocal)
        if success:
            return {
                "message": f"Eliminadas todas las muestras de la vocal '{vocal}'",
                "deleted": True
            }
        else:
            return {
                "message": f"No se encontraron muestras para la vocal '{vocal}'",
                "deleted": False
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error eliminando muestras: {str(e)}"
        )
