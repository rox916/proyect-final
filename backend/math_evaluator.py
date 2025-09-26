"""
Evaluador de expresiones matemáticas para el sistema de reconocimiento de señas
"""

import re
from typing import Union, List, Dict, Any

class MathEvaluator:
    """Evaluador de expresiones matemáticas"""
    
    def __init__(self):
        self.operations = {
            '+': lambda x, y: x + y,
            '-': lambda x, y: x - y,
            '*': lambda x, y: x * y,
            '/': lambda x, y: x / y if y != 0 else float('inf'),
            '^': lambda x, y: x ** y
        }
    
    def evaluate_expression(self, expression: str) -> Dict[str, Any]:
        """Evalúa una expresión matemática"""
        try:
            # Limpiar la expresión
            expression = expression.replace(' ', '')
            
            # Validar caracteres permitidos
            if not re.match(r'^[0-9+\-*/().^]+$', expression):
                return {
                    "result": None,
                    "error": "Expresión contiene caracteres no válidos",
                    "valid": False
                }
            
            # Evaluar la expresión
            result = eval(expression)
            
            return {
                "result": result,
                "error": None,
                "valid": True,
                "expression": expression
            }
            
        except ZeroDivisionError:
            return {
                "result": None,
                "error": "División por cero",
                "valid": False
            }
        except Exception as e:
            return {
                "result": None,
                "error": f"Error al evaluar: {str(e)}",
                "valid": False
            }
    
    def generate_math_problems(self, difficulty: str = "easy", count: int = 5) -> List[Dict[str, Any]]:
        """Genera problemas matemáticos para entrenamiento"""
        import random
        
        problems = []
        
        if difficulty == "easy":
            for _ in range(count):
                a = random.randint(1, 10)
                b = random.randint(1, 10)
                op = random.choice(['+', '-'])
                
                if op == '+' or (op == '-' and a >= b):
                    expression = f"{a} {op} {b}"
                    result = a + b if op == '+' else a - b
                    
                    problems.append({
                        "expression": expression,
                        "result": result,
                        "difficulty": "easy"
                    })
        
        return problems