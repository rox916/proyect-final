import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Opciones del gráfico de barras
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Ocultamos la leyenda
    },
    title: {
      display: false,
    },
    tooltip: {
        callbacks: {
            // Muestra el label del dataset y el valor (e.g., "Muestras Capturadas: 10")
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                label += context.parsed.y;
                return label;
            }
        }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Cantidad de Muestras',
        font: {
            size: 14,
            weight: 'bold'
        }
      },
      ticks: {
          stepSize: 1, // Asegura que solo se muestren números enteros
          font: {
              size: 12
          }
      }
    },
    x: {
        grid: {
            display: false // Oculta las líneas de la cuadrícula en el eje X
        },
        ticks: {
            font: {
                size: 14,
                weight: 'bold'
            }
        }
    }
  }
};

/**
 * Componente que renderiza un gráfico de barras con los datos de muestras.
 * @param {object} props - Propiedades del componente
 * @param {object} props.data - Objeto de datos compatible con Chart.js (labels y datasets)
 * @returns {JSX.Element} El componente del gráfico
 */
const SamplesChart = ({ data }) => {
  
  // Clonamos las opciones por defecto para ajustarlas con el valor máximo dinámico si es necesario
  const options = useMemo(() => {
    // Calcular el valor máximo en los datos para establecer un límite superior en el eje Y
    const maxDataValue = data.datasets?.[0]?.data.reduce((max, current) => Math.max(max, current), 0) || 0;
    
    // Si el máximo es 0, establecemos un límite superior visible (ej. 10)
    const suggestedMax = maxDataValue < 5 ? 10 : maxDataValue + Math.ceil(maxDataValue * 0.1); // 10% de margen

    return {
        ...defaultOptions,
        scales: {
            ...defaultOptions.scales,
            y: {
                ...defaultOptions.scales.y,
                suggestedMax: suggestedMax,
            }
        }
    };
  }, [data]);
  
  // Asegúrate de que haya datos antes de renderizar
  if (!data || data.labels.length === 0) {
    return <div className="text-center text-muted py-5">No hay datos de muestras disponibles para graficar.</div>;
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* El componente Bar de react-chartjs-2 */}
      <Bar options={options} data={data} />
    </div>
  );
};

export default SamplesChart;
