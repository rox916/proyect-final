"""
Rutas para la Calculadora de Gestos
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ast
import operator

router = APIRouter()

# Operadores seguros para evaluación de expresiones
SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

class ExpressionRequest(BaseModel):
    expression: str

class ExpressionResponse(BaseModel):
    result: float
    expression: str
    success: bool
    error: str = None

def safe_eval(expression: str) -> float:
    """
    Evaluación segura de expresiones matemáticas
    Solo permite operaciones básicas: +, -, *, /, **
    """
    try:
        # Parsear la expresión
        tree = ast.parse(expression, mode='eval')
        
        def _eval(node):
            if isinstance(node, ast.Expression):
                return _eval(node.body)
            elif isinstance(node, ast.Constant):  # Python 3.8+
                return node.value
            elif isinstance(node, ast.Num):  # Python < 3.8
                return node.n
            elif isinstance(node, ast.BinOp):
                left = _eval(node.left)
                right = _eval(node.right)
                op_func = SAFE_OPERATORS.get(type(node.op))
                if op_func is None:
                    raise ValueError(f"Operador no permitido: {type(node.op)}")
                return op_func(left, right)
            elif isinstance(node, ast.UnaryOp):
                operand = _eval(node.operand)
                op_func = SAFE_OPERATORS.get(type(node.op))
                if op_func is None:
                    raise ValueError(f"Operador no permitido: {type(node.op)}")
                return op_func(operand)
            else:
                raise ValueError(f"Tipo de nodo no permitido: {type(node)}")
        
        result = _eval(tree)
        
        # Verificar que el resultado sea un número
        if not isinstance(result, (int, float)):
            raise ValueError("El resultado no es un número válido")
            
        return float(result)
        
    except Exception as e:
        raise ValueError(f"Error evaluando expresión: {str(e)}")

@router.post("/calculadora/evaluate", response_model=ExpressionResponse)
async def evaluate_expression(request: ExpressionRequest):
    """
    Evaluar una expresión matemática de forma segura
    """
    try:
        # Limpiar la expresión
        expression = request.expression.strip()
        
        if not expression:
            raise ValueError("La expresión no puede estar vacía")
        
        # Evaluar la expresión
        result = safe_eval(expression)
        
        return ExpressionResponse(
            result=result,
            expression=expression,
            success=True
        )
        
    except ValueError as e:
        return ExpressionResponse(
            result=0,
            expression=request.expression,
            success=False,
            error=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/calculadora/test")
async def test_calculadora():
    """
    Endpoint de prueba para la calculadora
    """
    return {
        "message": "Calculadora de Gestos funcionando",
        "operaciones_soportadas": ["+", "-", "*", "/", "**"],
        "ejemplos": [
            "2 + 3 = 5",
            "10 - 4 = 6", 
            "3 * 4 = 12",
            "15 / 3 = 5",
            "2 ** 3 = 8"
        ]
    }
