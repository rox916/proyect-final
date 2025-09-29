"""
Rutas específicas para el manejo de operaciones matemáticas
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict
from datetime import datetime

from models import Category, Sample, SampleCreate, PredictionResult
from math_evaluator import MathEvaluator
from config import settings
from store import store
from datos_manager import datos_manager

router = APIRouter()
math_evaluator = MathEvaluator()

# Operaciones disponibles
OPERACIONES = ["+", "-", "*", "/", "="]

@router.get("/operaciones", response_model=List[str])
async def get_operaciones():
    """Obtener lista de operaciones disponibles"""
    return OPERACIONES


@router.post("/operaciones/category/{user_id}", response_model=Category)
async def create_operaciones_category(user_id: int):
    """Crear categoría de operaciones para el usuario"""
    category_id = len(store.categories) + 1   # ✅ corregido (antes usaba data_store que no existe)
    
    category = Category(
        id=category_id,
        name="Operaciones Matemáticas",
        description="Categoría para entrenar operaciones básicas (+, -, *, /, =)",
        type="operaciones",
        user_id=user_id,
        sample_count=0,
        created_at=datetime.now().isoformat()
    )
    
    store.categories[category_id] = category.dict()
    store.save_data()
    
    return category


@router.get("/operaciones/samples/{user_id}", response_model=List[Sample])
async def get_operaciones_samples(user_id: int):
    """Obtener muestras de operaciones del usuario"""
    try:
        data = datos_manager.get_samples("operaciones")
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


@router.post("/operaciones/samples/{user_id}", response_model=Sample)
async def create_operaciones_sample(user_id: int, sample: SampleCreate):
    """Crear muestra de operación"""
    if sample.category_name not in OPERACIONES:
        raise HTTPException(
            status_code=400,
            detail=f"Operación '{sample.category_name}' no válida. Operaciones disponibles: {OPERACIONES}"
        )
    
    try:
        # Guardar en sistema de archivos separado
        saved_sample = datos_manager.save_sample(
            category="operaciones",
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
            category_id=4,  # ID de la categoría de operaciones
            timestamp=sample.timestamp or datetime.now().isoformat(),
            created_at=datetime.now().isoformat()
        )
        
        return new_sample
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error guardando muestra: {str(e)}"
        )


@router.get("/operaciones/training-status/{user_id}")
async def get_operaciones_training_status(user_id: int):
    """Obtener estado de entrenamiento de operaciones"""
    try:
        data = datos_manager.get_samples("operaciones")
        user_samples = [
            sample for sample in data.get("samples", [])
            if sample.get("user_id") == user_id
        ]
        
        # Contar muestras por operación
        operacion_counts = {}
        for operacion in OPERACIONES:
            operacion_counts[operacion] = len([s for s in user_samples if s.get("category_name") == operacion])
        
        total_samples = len(user_samples)
        can_train = total_samples >= settings.MIN_SAMPLES_FOR_TRAINING
        
        return {
            "total_samples": total_samples,
            "operacion_counts": operacion_counts,
            "can_train": can_train,
            "ready_for_optimal": total_samples >= settings.OPTIMAL_SAMPLES_FOR_TRAINING,
            "operaciones_available": OPERACIONES
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estado: {str(e)}"
        )


@router.get("/operaciones/stats/{user_id}")
async def get_operaciones_stats(user_id: int):
    """Obtener estadísticas de operaciones"""
    try:
        stats = datos_manager.get_category_stats("operaciones")
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error obteniendo estadísticas: {str(e)}"
        )


@router.post("/operaciones/train/{user_id}")
async def train_operaciones_model(user_id: int):
    """Entrenar modelo de ML para operaciones"""
    try:
        from ml_model import models
        
        # Usar el modelo de operaciones
        model = models["operaciones"]
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


@router.post("/operaciones/predict/{user_id}", response_model=PredictionResult)
async def predict_operacion(user_id: int, landmarks: List[Dict[str, float]]):
    """Predecir operación basada en landmarks"""
    try:
        from ml_model import models
        
        # Usar modelo entrenado para operaciones
        model = models["operaciones"]
        result = model.predict(landmarks)
        
        return PredictionResult(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_id=3,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en predicción: {str(e)}"
        )


@router.post("/operaciones/evaluate")
async def evaluate_expression(expression: str):
    """Evaluar expresión matemática"""
    result = math_evaluator.evaluate_expression(expression)
    return result


@router.get("/operaciones/problems/{difficulty}")
async def get_math_problems(difficulty: str = "easy", count: int = 5):
    """Generar problemas matemáticos para entrenamiento"""
    problems = math_evaluator.generate_math_problems(difficulty, count)
    return {
        "difficulty": difficulty,
        "count": len(problems),
        "problems": problems
    }


@router.delete("/operaciones/samples/{user_id}/{operacion}")
async def delete_operacion_samples(user_id: int, operacion: str):
    """Eliminar todas las muestras de una operación específica"""
    if operacion not in OPERACIONES:
        raise HTTPException(
            status_code=400,
            detail=f"Operación '{operacion}' no válida"
        )
    
    try:
        success = datos_manager.delete_sign_samples("operaciones", operacion)
        if success:
            return {
                "message": f"Eliminadas todas las muestras de la operación '{operacion}'",
                "deleted": True
            }
        else:
            return {
                "message": f"No se encontraron muestras para la operación '{operacion}'",
                "deleted": False
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error eliminando muestras: {str(e)}"
        )
