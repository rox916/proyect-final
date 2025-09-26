"""
Almacenamiento en memoria para el Sistema Inteligente de Reconocimiento de Señas
"""

from datetime import datetime
from typing import Dict, Any, List
import json
import os

class MemoryStore:
    """Almacenamiento en memoria simple"""
    
    def __init__(self):
        self.data_file = "data.json"
        self.users: Dict[int, Any] = {}
        self.categories: Dict[int, Any] = {}
        self.samples: Dict[int, Any] = {}
        self.models: Dict[int, Any] = {}
        self.load_data()
    
    def load_data(self):
        """Cargar datos desde archivo JSON"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.users = {int(k): v for k, v in data.get('users', {}).items()}
                    self.categories = {int(k): v for k, v in data.get('categories', {}).items()}
                    self.samples = {int(k): v for k, v in data.get('samples', {}).items()}
                    self.models = {int(k): v for k, v in data.get('models', {}).items()}
            except Exception as e:
                print(f"Error cargando datos: {e}")
                self._initialize_default_data()
        else:
            self._initialize_default_data()
    
    def save_data(self):
        """Guardar datos en archivo JSON"""
        try:
            data = {
                'users': self.users,
                'categories': self.categories,
                'samples': self.samples,
                'models': self.models
            }
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        except Exception as e:
            print(f"Error guardando datos: {e}")
    
    def _initialize_default_data(self):
        """Inicializar con datos por defecto"""
        # Usuario por defecto
        self.users[1] = {
            "id": 1,
            "name": "Usuario Demo",
            "email": "demo@example.com",
            "created_at": self.get_current_timestamp()
        }
        
        # Categorías por defecto
        default_categories = [
            {"name": "A, E, I, O, U", "description": "Vocales básicas", "type": "vocales"},
            {"name": "Números", "description": "Números del 0 al 9", "type": "numeros"},
            {"name": "Operaciones", "description": "Suma, resta, multiplicación, división", "type": "operaciones"},
            {"name": "Expresiones Algebraicas", "description": "Variables y operaciones algebraicas", "type": "algebraicas"}
        ]
        
        for i, cat_data in enumerate(default_categories, 1):
            self.categories[i] = {
                "id": i,
                "name": cat_data["name"],
                "description": cat_data["description"],
                "type": cat_data["type"],
                "user_id": 1,
                "sample_count": 0,
                "created_at": self.get_current_timestamp()
            }
        
        self.save_data()
    
    def get_current_timestamp(self) -> str:
        """Obtener timestamp actual"""
        return datetime.now().isoformat()
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas"""
        return {
            "users": len(self.users),
            "categories": len(self.categories),
            "samples": len(self.samples),
            "models": len(self.models)
        }

# Instancia global
store = MemoryStore()
