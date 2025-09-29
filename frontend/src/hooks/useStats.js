import { useState, useEffect, useCallback, useMemo } from 'react'

// Función auxiliar para definir los signos por categoría
const getCategorySigns = (category) => {
    // Definición completa de categorías (NECESITAS ESTO AQUÍ para construir el gráfico)
    const ALL_SIGNS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    const categories = {
        vocales: ['A', 'E', 'I', 'O', 'U'],
        abecedario: ALL_SIGNS,
        numeros: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        operaciones: ['+', '-', '*', '/', '='],
        algebraicas: ['x', 'y', 'z', '(', ')', '^']
    };
    return categories[category] || [];
};

export const useStats = (category, userId = 1) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Usamos useCallback para memoizar la función de carga
    const loadStats = useCallback(async () => {
        if (!category) return;
        setLoading(true)
        setError(null)
        
        try {
            // Asegúrate de que la URL y el endpoint coincidan con tu backend
            const response = await fetch(`http://localhost:8000/api/v1/${category}/stats/${userId}`)
            
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                setError('Error cargando estadísticas')
                setStats({ total_samples: 0, signs: {} }); // Estado vacío en caso de error
            }
        } catch (err) {
            setError('Error de conexión')
            setStats({ total_samples: 0, signs: {} }); // Estado vacío en caso de error
            console.error('Error cargando stats:', err)
        } finally {
            setLoading(false)
        }
    }, [category, userId]) // Dependencias de useCallback

    useEffect(() => {
        loadStats()
    }, [category, userId, loadStats]) // Dependencias de useEffect


    // Generar los datos para el gráfico (memoizado)
    const chartData = useMemo(() => {
        // Si no hay datos, devolvemos un objeto vacío para evitar errores
        if (!stats || !stats.signs) {
            return { labels: [], datasets: [] };
        }
        
        // Obtenemos solo las señas de la categoría actual
        const currentSigns = getCategorySigns(category);
        const labels = currentSigns;
        
        // Mapeamos los conteos desde el objeto stats.signs del backend
        const dataValues = currentSigns.map(sign => stats.signs[sign]?.samples || 0);
        
        return {
            labels,
            datasets: [
                {
                    label: 'Muestras Capturadas',
                    data: dataValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 4, // Bordes redondeados
                },
            ],
        };
    }, [stats, category]); // Se recalcula solo si stats o category cambian

    return {
        stats,
        loading,
        error,
        refetch: loadStats,
        chartData // 👈 Exportamos los datos del gráfico
    }
}
