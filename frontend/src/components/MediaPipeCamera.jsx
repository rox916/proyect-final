import React, { useRef, useEffect, useState } from 'react'
import { Hands } from '@mediapipe/hands'

const MediaPipeCamera = ({ onLandmarks, onHandDetected }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const initializeMediaPipe = async () => {
      try {
        console.log('🚀 Iniciando MediaPipe Camera...')
        
        // Obtener acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
          }
        })

        if (!isMounted) return

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // Esperar a que el video esté listo
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play()
              resolve()
            }
          })
        }

        if (!isMounted) return

        // Configurar MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        })

        hands.onResults((results) => {
          if (!isMounted || !canvasRef.current || !videoRef.current) return

          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          // Configurar canvas
          canvas.width = videoRef.current.videoWidth || 640
          canvas.height = videoRef.current.videoHeight || 480

          // Limpiar canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Dibujar video
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]
            
            // Llamar callbacks
            if (onLandmarks) onLandmarks(landmarks)
            if (onHandDetected) onHandDetected(true)
            
            // Dibujar landmarks
            landmarks.forEach((landmark, index) => {
              const x = landmark.x * canvas.width
              const y = landmark.y * canvas.height
              
              // Punto rojo
              ctx.beginPath()
              ctx.arc(x, y, 6, 0, 2 * Math.PI)
              ctx.fillStyle = '#FF0000'
              ctx.fill()
              ctx.strokeStyle = '#FFFFFF'
              ctx.lineWidth = 2
              ctx.stroke()
            })

            // Dibujar conexiones
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Pulgar
              [0, 5], [5, 6], [6, 7], [7, 8], // Índice
              [5, 9], [9, 10], [10, 11], [11, 12], // Medio
              [9, 13], [13, 14], [14, 15], [15, 16], // Anular
              [13, 17], [17, 18], [18, 19], [19, 20], // Meñique
              [0, 17] // Base
            ]

            ctx.strokeStyle = '#00FF00'
            ctx.lineWidth = 3
            connections.forEach(([start, end]) => {
              if (landmarks[start] && landmarks[end]) {
                ctx.beginPath()
                ctx.moveTo(
                  landmarks[start].x * canvas.width,
                  landmarks[start].y * canvas.height
                )
                ctx.lineTo(
                  landmarks[end].x * canvas.width,
                  landmarks[end].y * canvas.height
                )
                ctx.stroke()
              }
            })

            console.log('✅ Mano detectada con landmarks')
          } else {
            if (onHandDetected) onHandDetected(false)
            console.log('❌ No se detectó mano')
          }
        })

        handsRef.current = hands
        setIsInitialized(true)
        setError(null)

        // Procesar frames con delay
        const processFrame = async () => {
          if (!isMounted) return
          
          if (videoRef.current && handsRef.current) {
            try {
              await handsRef.current.send({ image: videoRef.current })
            } catch (err) {
              console.log('Frame processing error:', err)
            }
          }
          
          if (isMounted) {
            setTimeout(processFrame, 100) // 10 FPS
          }
        }

        // Iniciar procesamiento después de un delay
        setTimeout(processFrame, 1000)

        console.log('✅ MediaPipe Camera inicializado correctamente')

      } catch (err) {
        console.error('❌ Error inicializando MediaPipe Camera:', err)
        setError(err.message)
      }
    }

    initializeMediaPipe()

    return () => {
      isMounted = false
      if (handsRef.current) {
        try {
          handsRef.current.close()
        } catch (err) {
          console.log('Error closing hands:', err)
        }
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="relative" style={{ width: '100%', height: '500px' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded border"
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      {/* Status */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className={`px-3 py-1 rounded text-sm ${
          isInitialized ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isInitialized ? '✓ MediaPipe' : '⏳ Cargando...'}
        </div>
        {error && (
          <div className="px-3 py-1 rounded text-sm bg-red-500 text-white">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaPipeCamera
