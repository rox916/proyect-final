"""
Módulo de Machine Learning para reconocimiento de señas
"""

import numpy as np
import json
import os
from typing import List, Dict, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
from datetime import datetime

class SignRecognitionModel:
    """Modelo de Machine Learning para reconocimiento de señas"""
    
    def __init__(self, category: str):
        self.category = category
        self.model = RandomForestClassifier(
            n_estimators=10,  # Menos árboles para pocos datos
            max_depth=5,      # Menor profundidad
            random_state=42,
            n_jobs=-1,
            min_samples_split=2,  # Mínimo para dividir
            min_samples_leaf=1     # Mínimo en hojas
        )
        self.is_trained = False
        self.classes_ = None
        self.accuracy_ = 0.0
        self.model_path = f"models/{category}_model.pkl"
        
    def load_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Cargar datos de entrenamiento desde archivos JSON"""
        X = []  # Features (landmarks)
        y = []  # Labels (números/vocales/etc)
        
        data_dir = f"datos/{self.category}"
        
        if not os.path.exists(data_dir):
            return np.array([]), np.array([])
        
        for filename in os.listdir(data_dir):
            if filename.endswith('.json'):
                sign_name = filename.replace('.json', '')
                file_path = os.path.join(data_dir, filename)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    for sample in data.get('samples', []):
                        landmarks = sample.get('landmarks', [])
                        landmarks_left = sample.get('landmarks_left')
                        landmarks_right = sample.get('landmarks_right')
                        
                        if landmarks or (landmarks_left and landmarks_right):
                            # Convertir landmarks a formato numérico
                            features = self._extract_features(landmarks, landmarks_left, landmarks_right)
                            if features is not None:
                                X.append(features)
                                y.append(sign_name)
                                
                except Exception as e:
                    print(f"Error cargando {file_path}: {e}")
                    continue
        
        return np.array(X), np.array(y)
    
    def _extract_features(self, landmarks: List, landmarks_left: List = None, landmarks_right: List = None) -> Optional[np.ndarray]:
        """Extraer características de los landmarks (una o dos manos)"""
        try:
            features = []
            
            # Procesar landmarks de una mano (formato original)
            if landmarks:
                for landmark in landmarks:
                    if isinstance(landmark, str):
                        # Parsear string "x=0.5 y=0.5 z=0.0"
                        import re
                        coords = re.findall(r'x=([\d.-]+(?:e[+-]?\d+)?)\s+y=([\d.-]+(?:e[+-]?\d+)?)\s+z=([\d.-]+(?:e[+-]?\d+)?)', landmark)
                        if coords:
                            x, y, z = coords[0]
                            features.extend([float(x), float(y), float(z)])
                        else:
                            print(f"Error parseando landmark: {landmark}")
                            return None
                    elif isinstance(landmark, dict):
                        # Formato dict {"x": 0.5, "y": 0.5, "z": 0.0}
                        features.extend([
                            landmark.get('x', 0),
                            landmark.get('y', 0),
                            landmark.get('z', 0)
                        ])
                    else:
                        return None
            
            # Procesar landmarks de dos manos si están disponibles
            if landmarks_left and landmarks_right:
                # Limpiar features anteriores si tenemos dos manos
                features = []
                
                # Procesar mano izquierda
                for landmark in landmarks_left:
                    if isinstance(landmark, str):
                        # Parsear string "x=0.5 y=0.5 z=0.0"
                        import re
                        coords = re.findall(r'x=([\d.-]+(?:e[+-]?\d+)?)\s+y=([\d.-]+(?:e[+-]?\d+)?)\s+z=([\d.-]+(?:e[+-]?\d+)?)', landmark)
                        if coords:
                            x, y, z = coords[0]
                            features.extend([float(x), float(y), float(z)])
                        else:
                            print(f"Error parseando landmark izquierdo: {landmark}")
                            return None
                    elif isinstance(landmark, dict):
                        features.extend([
                            landmark.get('x', 0),
                            landmark.get('y', 0),
                            landmark.get('z', 0)
                        ])
                    else:
                        return None
                
                # Procesar mano derecha
                for landmark in landmarks_right:
                    if isinstance(landmark, str):
                        # Parsear string "x=0.5 y=0.5 z=0.0"
                        import re
                        coords = re.findall(r'x=([\d.-]+(?:e[+-]?\d+)?)\s+y=([\d.-]+(?:e[+-]?\d+)?)\s+z=([\d.-]+(?:e[+-]?\d+)?)', landmark)
                        if coords:
                            x, y, z = coords[0]
                            features.extend([float(x), float(y), float(z)])
                        else:
                            print(f"Error parseando landmark derecho: {landmark}")
                            return None
                    elif isinstance(landmark, dict):
                        features.extend([
                            landmark.get('x', 0),
                            landmark.get('y', 0),
                            landmark.get('z', 0)
                        ])
                    else:
                        return None
                
                # Para dos manos: 21 landmarks * 2 manos * 3 coordenadas = 126 features
                if len(features) != 126:
                    return None
                    
            else:
                # Para una mano: 21 landmarks * 3 coordenadas = 63 features
                if len(features) != 63:
                    return None
                
            return np.array(features)
            
        except Exception as e:
            print(f"Error extrayendo características: {e}")
            return None
    
    def train(self) -> Dict[str, any]:
        """Entrenar el modelo"""
        try:
            print(f"🔄 Entrenando modelo para {self.category}...")
            
            # Cargar datos
            X, y = self.load_training_data()
            
            if len(X) == 0:
                return {
                    "success": False,
                    "message": "No hay datos de entrenamiento disponibles",
                    "accuracy": 0.0,
                    "samples": 0
                }
            
            print(f"📊 Datos cargados: {len(X)} muestras, {len(np.unique(y))} clases")
            
            # Dividir datos (sin stratify si hay pocas muestras por clase)
            if len(X) >= 10 and len(np.unique(y)) > 1:
                try:
                    X_train, X_test, y_train, y_test = train_test_split(
                        X, y, test_size=0.2, random_state=42, stratify=y
                    )
                except ValueError:
                    # Si no se puede hacer stratify, dividir normalmente
                    X_train, X_test, y_train, y_test = train_test_split(
                        X, y, test_size=0.2, random_state=42
                    )
            else:
                # Si hay muy pocas muestras, usar todo para entrenamiento
                X_train, X_test, y_train, y_test = X, X, y, y
            
            # Entrenar modelo
            self.model.fit(X_train, y_train)
            
            # Evaluar
            y_pred = self.model.predict(X_test)
            self.accuracy_ = accuracy_score(y_test, y_pred)
            
            # Guardar modelo
            os.makedirs("models", exist_ok=True)
            joblib.dump(self.model, self.model_path)
            
            self.is_trained = True
            self.classes_ = self.model.classes_
            
            print(f" Modelo entrenado - Precisión: {self.accuracy_:.3f}")
            
            return {
                "success": True,
                "message": f"Modelo entrenado exitosamente",
                "accuracy": self.accuracy_,
                "samples": len(X),
                "classes": list(self.classes_),
                "model_path": self.model_path
            }
            
        except Exception as e:
            print(f" Error entrenando modelo: {e}")
            return {
                "success": False,
                "message": f"Error entrenando modelo: {str(e)}",
                "accuracy": 0.0,
                "samples": 0
            }
    
    def predict(self, landmarks: List, landmarks_left: List = None, landmarks_right: List = None) -> Dict[str, any]:
        """Hacer predicción con el modelo entrenado (una o dos manos)"""
        try:
            if not self.is_trained:
                # Intentar cargar modelo guardado
                if os.path.exists(self.model_path):
                    self.model = joblib.load(self.model_path)
                    self.is_trained = True
                    self.classes_ = self.model.classes_
                else:
                    return {
                        "prediction": "Modelo no entrenado",
                        "confidence": 0.0,
                        "error": "No hay modelo entrenado disponible"
                    }
            
            # Extraer características
            features = self._extract_features(landmarks, landmarks_left, landmarks_right)
            if features is None:
                return {
                    "prediction": "Landmarks inválidos",
                    "confidence": 0.0,
                    "error": "No se pudieron extraer características"
                }
            
            # Hacer predicción
            prediction = self.model.predict([features])[0]
            probabilities = self.model.predict_proba([features])[0]
            confidence = np.max(probabilities)
            
            return {
                "prediction": prediction,
                "confidence": float(confidence),
                "probabilities": {
                    cls: float(prob) for cls, prob in zip(self.classes_, probabilities)
                }
            }
            
        except Exception as e:
            print(f" Error en predicción: {e}")
            return {
                "prediction": "Error",
                "confidence": 0.0,
                "error": str(e)
            }

# Instancias globales para cada categoría
models = {
    "numeros": SignRecognitionModel("numeros"),
    "vocales": SignRecognitionModel("vocales"),
    "operaciones": SignRecognitionModel("operaciones"),
    "abecedario": SignRecognitionModel("abecedario")
}
