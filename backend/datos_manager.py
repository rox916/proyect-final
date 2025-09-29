"""
Gestor de datos para el Sistema Inteligente de Reconocimiento de Señas
Guarda datos en carpetas separadas por categoría
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List

class DatosManager:
    """Gestor de datos por categorías separadas"""
    
    def __init__(self):
        self.base_dir = "datos"
        self.categories = {
            "vocales": "vocales",
            "abecedario": "abecedario",
            "numeros": "numeros", 
            "operaciones": "operaciones",
            "algebraicas": "algebraicas"
        }
        
        # Crear directorios si no existen
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Crear directorios de categorías si no existen"""
        for category_dir in self.categories.values():
            os.makedirs(os.path.join(self.base_dir, category_dir), exist_ok=True)
    
    def save_sample(self, category: str, sign: str, landmarks: List[Dict], user_id: int = 1, landmarks_left: List[Dict] = None, landmarks_right: List[Dict] = None):
        """Guardar muestra en archivo específico de la categoría"""
        try:
            category_dir = self.categories.get(category)
            if not category_dir:
                raise ValueError(f"Categoría '{category}' no válida")
            
            # Crear archivo específico para la seña
            filename = f"{sign.lower()}.json"
            filepath = os.path.join(self.base_dir, category_dir, filename)
            
            # Cargar datos existentes o crear nuevo
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = {
                    "sign": sign,
                    "category": category,
                    "samples": [],
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat()
                }
            
            # Crear nueva muestra
            new_sample = {
                "id": len(data["samples"]) + 1,
                "landmarks": landmarks,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            # Agregar landmarks de dos manos si están disponibles
            if landmarks_left:
                new_sample["landmarks_left"] = landmarks_left
            if landmarks_right:
                new_sample["landmarks_right"] = landmarks_right
            
            # Agregar muestra
            data["samples"].append(new_sample)
            data["last_updated"] = datetime.now().isoformat()
            data["total_samples"] = len(data["samples"])
            
            # Guardar archivo
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            
            hand_type = "dos manos" if landmarks_left and landmarks_right else "una mano"
            print(f" Muestra guardada: {category}/{sign} ({hand_type}) - Total: {len(data['samples'])}")
            return new_sample
            
        except Exception as e:
            print(f" Error guardando muestra: {e}")
            raise
    
    def get_samples(self, category: str, sign: str = None):
        """Obtener muestras de una categoría o seña específica"""
        try:
            category_dir = self.categories.get(category)
            if not category_dir:
                raise ValueError(f"Categoría '{category}' no válida")
            
            if sign:
                # Obtener muestras de una seña específica
                filename = f"{sign.lower()}.json"
                filepath = os.path.join(self.base_dir, category_dir, filename)
                
                if os.path.exists(filepath):
                    with open(filepath, 'r', encoding='utf-8') as f:
                        return json.load(f)
                else:
                    return {"samples": [], "total_samples": 0}
            else:
                # Obtener todas las muestras de la categoría
                all_samples = []
                category_path = os.path.join(self.base_dir, category_dir)
                
                for filename in os.listdir(category_path):
                    if filename.endswith('.json'):
                        filepath = os.path.join(category_path, filename)
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            all_samples.extend(data.get("samples", []))
                
                return {"samples": all_samples, "total_samples": len(all_samples)}
                
        except Exception as e:
            print(f" Error obteniendo muestras: {e}")
            return {"samples": [], "total_samples": 0}
    
    def get_category_stats(self, category: str):
        """Obtener estadísticas de una categoría"""
        try:
            category_dir = self.categories.get(category)
            if not category_dir:
                return {"error": f"Categoría '{category}' no válida"}
            
            category_path = os.path.join(self.base_dir, category_dir)
            stats = {
                "category": category,
                "signs": {},
                "total_samples": 0,
                "last_updated": None
            }
            
            if os.path.exists(category_path):
                for filename in os.listdir(category_path):
                    if filename.endswith('.json'):
                        sign_name = filename.replace('.json', '').upper()
                        filepath = os.path.join(category_path, filename)
                        
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            
                        stats["signs"][sign_name] = {
                            "samples": len(data.get("samples", [])),
                            "last_updated": data.get("last_updated")
                        }
                        stats["total_samples"] += len(data.get("samples", []))
                        
                        # Actualizar última actualización
                        if not stats["last_updated"] or data.get("last_updated", "") > stats["last_updated"]:
                            stats["last_updated"] = data.get("last_updated")
            
            return stats
            
        except Exception as e:
            print(f" Error obteniendo estadísticas: {e}")
            return {"error": str(e)}
    
    def get_user_total_samples(self, user_id: int):
        """Obtener el total de muestras de un usuario en todas las categorías"""
        try:
            total_samples = 0
            user_samples = []
            
            for category in self.categories.keys():
                data = self.get_samples(category)
                category_user_samples = [
                    sample for sample in data.get("samples", [])
                    if sample.get("user_id") == user_id
                ]
                user_samples.extend(category_user_samples)
                total_samples += len(category_user_samples)
            
            return {
                "total_samples": total_samples,
                "samples": user_samples,
                "by_category": self._get_samples_by_category(user_id)
            }
            
        except Exception as e:
            print(f" Error obteniendo total de muestras del usuario: {e}")
            return {"total_samples": 0, "samples": [], "by_category": {}}
    
    def _get_samples_by_category(self, user_id: int):
        """Obtener muestras del usuario agrupadas por categoría"""
        try:
            by_category = {}
            
            for category in self.categories.keys():
                data = self.get_samples(category)
                category_user_samples = [
                    sample for sample in data.get("samples", [])
                    if sample.get("user_id") == user_id
                ]
                by_category[category] = {
                    "count": len(category_user_samples),
                    "samples": category_user_samples
                }
            
            return by_category
            
        except Exception as e:
            print(f" Error agrupando muestras por categoría: {e}")
            return {}

    def delete_sign_samples(self, category: str, sign: str):
        """Eliminar todas las muestras de una seña específica"""
        try:
            category_dir = self.categories.get(category)
            if not category_dir:
                raise ValueError(f"Categoría '{category}' no válida")
            
            filename = f"{sign.lower()}.json"
            filepath = os.path.join(self.base_dir, category_dir, filename)
            
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f" Eliminadas todas las muestras de {category}/{sign}")
                return True
            else:
                print(f"No se encontraron muestras para {category}/{sign}")
                return False
                
        except Exception as e:
            print(f" Error eliminando muestras: {e}")
            return False

# Instancia global
datos_manager = DatosManager()
