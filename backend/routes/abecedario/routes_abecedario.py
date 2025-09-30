"""
Rutas específicas para el manejo del abecedario completo
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime

from models import Category, Sample, SampleCreate, Model, PredictionResult
from config import settings
# store import removed
from datos_manager import datos_manager

router = APIRouter()

# Abecedario completo
ABECEDARIO = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
             "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

@router.get("/abecedario", response_model=List[str])
async def get_abecedario():
    """Obtener lista del abecedario completo"""
    return ABECEDARIO

@router.post("/abecedario/category/{user_id}", response_model=Category)
async def create_abecedario_category(user_id: int):
    """Crear categoría de abecedario para el usuario"""
    category_id = len(store.categories) + 1
    
    category = Category(
        id=category_id,
        name="Abecedario A-Z",
        description="Categoría para entrenar el abecedario completo",
        type="abecedario",
        user_id=user_id,
        sample_count=0,
        created_at=datetime.now().isoformat()
    )
    
    store.categories[category_id] = category.model_dump()
    store.save_data()
    
    return category

@router.get("/abecedario/samples/{user_id}", response_model=List[Sample])
async def get_abecedario_samples(user_id: int):
    """Obtener muestras del abecedario del usuario"""
    try:
        data = datos_manager.get_samples("abecedario")
        user_samples = [
            Sample(**sample) for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
        return user_samples
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo muestras: {str(e)}"
        )

@router.post("/abecedario/samples/{user_id}", response_model=Sample)
async def create_abecedario_sample(user_id: int, sample: SampleCreate):
    """Crear muestra de letra del abecedario"""
    if sample.category_name not in ABECEDARIO:
        raise HTTPException(
            status_code=400,
            detail=f"Letra '{sample.category_name}' no válida. Letras disponibles: {ABECEDARIO}"
        )
    
    try:
        # Guardar en sistema de archivos separado
        saved_sample = datos_manager.save_sample(
            category="abecedario",
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
            category_id=2,  # ID de la categoría de abecedario
            timestamp=sample.timestamp or datetime.now().isoformat(),
            created_at=datetime.now().isoformat()
        )
        
        return new_sample
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error guardando muestra: {str(e)}"
        )

@router.get("/abecedario/training-status/{user_id}")
async def get_abecedario_training_status(user_id: int):
    """Obtener estado de entrenamiento del abecedario"""
    try:
        data = datos_manager.get_samples("abecedario")
        user_samples = [
            sample for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
        
        # Contar muestras por letra
        letter_counts = {}
        for letter in ABECEDARIO:
            letter_counts[letter] = len([s for s in user_samples if s.get("category_name") == letter])
        
        total_samples = len(user_samples)
        can_train = total_samples >= 10  # Mínimo 10 muestras para entrenar
        
        return {
            "total_samples": total_samples,
            "letter_counts": letter_counts,
            "can_train": can_train,
            "ready_for_optimal": total_samples >= 50,  # Óptimo 50 muestras
            "abecedario_available": ABECEDARIO
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estado: {str(e)}"
        )

@router.get("/abecedario/stats/{user_id}")
async def get_abecedario_stats(user_id: int):
    """Obtener estadísticas del abecedario"""
    try:
        stats = datos_manager.get_category_stats("abecedario")
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas: {str(e)}"
        )

@router.post("/abecedario/train/{user_id}")
async def train_abecedario_model(user_id: int):
    """Entrenar modelo de ML para el abecedario"""
    try:
        from ml_model import models
        
        model = models["abecedario"]
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

@router.post("/abecedario/predict/{user_id}", response_model=PredictionResult)
async def predict_letter(user_id: int, landmarks: List[Dict[str, float]]):
    """Predecir letra basada en landmarks usando el modelo entrenado"""
    try:
        from ml_model import models
        
        # Verifica si el modelo está entrenado
        if "abecedario" not in models:
            return PredictionResult(
                prediction="Modelo no entrenado",
                confidence=0.0,
                model_id=2,
                timestamp=datetime.now().isoformat()
            )
        
        model = models["abecedario"]
        result = model.predict(landmarks)   # 👈 Usa el modelo entrenado
        
        return PredictionResult(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_id=2,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        return PredictionResult(
            prediction="Error ML",
            confidence=0.0,
            model_id=2,
            timestamp=datetime.now().isoformat()
        )


@router.delete("/abecedario/samples/{user_id}/{letter}")
async def delete_letter_samples(user_id: int, letter: str):
    """Eliminar todas las muestras de una letra específica"""
    if letter not in ABECEDARIO:
        raise HTTPException(
            status_code=400,
            detail=f"Letra '{letter}' no válida"
        )
    
    try:
        success = datos_manager.delete_sign_samples("abecedario", letter)
        if success:
            return {
                "message": f"Eliminadas todas las muestras de la letra '{letter}'",
                "deleted": True
            }
        else:
            return {
                "message": f"No se encontraron muestras para la letra '{letter}'",
                "deleted": False
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error eliminando muestras: {str(e)}"
        )
