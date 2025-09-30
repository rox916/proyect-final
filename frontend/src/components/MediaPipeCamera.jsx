import React, { useRef, useEffect, useState } from 'react'
import { Hands } from '@mediapipe/hands'
import './MediaPipeCamera.css'

const MediaPipeCamera = ({ onLandmarks, onHandDetected, dualHandMode = false, onDualHandDetected }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [bothHandsDetected, setBothHandsDetected] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initializeMediaPipe = async () => {
      try {
        console.log('🚀 Iniciando MediaPipe Camera...')
        
        // Obtener acceso a la cámara con mejor configuración
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280, max: 1920 }, 
            height: { ideal: 720, max: 1080 }, 
            facingMode: 'user',
            frameRate: { ideal: 30, max: 60 }
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
          maxNumHands: dualHandMode ? 2 : 1,
          modelComplexity: 1, // Máxima complejidad para mejor detección
          minDetectionConfidence: 0.5, // Reducir para detectar más fácilmente
          minTrackingConfidence: 0.5 // Reducir para mantener seguimiento
        })

        hands.onResults((results) => {
          if (!isMounted || !canvasRef.current || !videoRef.current) return

          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          // Configurar canvas con proporciones correctas
          const videoWidth = videoRef.current.videoWidth || 640
          const videoHeight = videoRef.current.videoHeight || 480
          
          // Mantener proporción 4:3
          const aspectRatio = 4/3
          let canvasWidth = videoWidth
          let canvasHeight = videoWidth / aspectRatio
          
          if (canvasHeight > videoHeight) {
            canvasHeight = videoHeight
            canvasWidth = videoHeight * aspectRatio
          }
          
          canvas.width = canvasWidth
          canvas.height = canvasHeight

          // Limpiar canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Dibujar video centrado
          const videoAspectRatio = videoWidth / videoHeight
          const canvasAspectRatio = canvasWidth / canvasHeight
          
          let drawWidth = canvasWidth
          let drawHeight = canvasHeight
          let offsetX = 0
          let offsetY = 0
          
          if (videoAspectRatio > canvasAspectRatio) {
            // Video es más ancho, ajustar por altura
            drawHeight = canvasHeight
            drawWidth = canvasHeight * videoAspectRatio
            offsetX = (canvasWidth - drawWidth) / 2
          } else {
            // Video es más alto, ajustar por ancho
            drawWidth = canvasWidth
            drawHeight = canvasWidth / videoAspectRatio
            offsetY = (canvasHeight - drawHeight) / 2
          }
          
          ctx.drawImage(videoRef.current, offsetX, offsetY, drawWidth, drawHeight)

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handsDetected = results.multiHandLandmarks.length
            const isBothHands = handsDetected === 2
            
            // Actualizar estado de ambas manos
            if (dualHandMode) {
              setBothHandsDetected(isBothHands)
              if (onDualHandDetected) onDualHandDetected(isBothHands)
            }
            
            // Dibujar indicador de manos detectadas
            ctx.fillStyle = '#00FF00'
            ctx.font = '20px Arial'
            ctx.fillText(`Manos: ${handsDetected}`, 10, 30)
            
            // Procesar cada mano detectada
            results.multiHandLandmarks.forEach((landmarks, handIndex) => {
              // Llamar callbacks para la primera mano (compatibilidad)
              if (handIndex === 0) {
                if (onLandmarks) onLandmarks(landmarks)
                if (onHandDetected) onHandDetected(true)
              }
              
              // Color diferente para cada mano
              const handColor = handIndex === 0 ? '#FF0000' : '#0000FF'
              const connectionColor = handIndex === 0 ? '#00FF00' : '#00FFFF'
              
              // Dibujar landmarks más visibles
              landmarks.forEach((landmark, index) => {
                // Calcular posición corregida considerando el offset y escalado del video
                const x = offsetX + (landmark.x * drawWidth)
                const y = offsetY + (landmark.y * drawHeight)
                
                // Punto más grande y visible
                ctx.beginPath()
                ctx.arc(x, y, 8, 0, 2 * Math.PI)
                ctx.fillStyle = handColor
                ctx.fill()
                ctx.strokeStyle = '#FFFFFF'
                ctx.lineWidth = 3
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

              ctx.strokeStyle = connectionColor
              ctx.lineWidth = 3
              connections.forEach(([start, end]) => {
                if (landmarks[start] && landmarks[end]) {
                  ctx.beginPath()
                  ctx.moveTo(
                    offsetX + (landmarks[start].x * drawWidth),
                    offsetY + (landmarks[start].y * drawHeight)
                  )
                  ctx.lineTo(
                    offsetX + (landmarks[end].x * drawWidth),
                    offsetY + (landmarks[end].y * drawHeight)
                  )
                  ctx.stroke()
                }
              })
            })

            console.log(`✅ ${handsDetected} mano(s) detectada(s) con landmarks`)
          } else {
            if (onHandDetected) onHandDetected(false)
            if (dualHandMode && onDualHandDetected) onDualHandDetected(false)
            setBothHandsDetected(false)
            console.log('❌ No se detectó mano')
            
            // Dibujar indicador de "no manos detectadas"
            ctx.fillStyle = '#FF0000'
            ctx.font = '20px Arial'
            ctx.fillText('No se detectan manos', 10, 30)
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
            setTimeout(processFrame, 100) // 10 FPS para mejor responsividad
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
    <div className="mediapipe-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="mediapipe-video"
      />
      <canvas
        ref={canvasRef}
        className="mediapipe-canvas"
      />
      
      {/* Status */}
      <div className="mediapipe-status">
        <div className={`mediapipe-status-item ${
          isInitialized ? 'mediapipe-status-active' : 'mediapipe-status-loading'
        }`}>
          {isInitialized ? '✓ MediaPipe' : '⏳ Cargando...'}
        </div>
        {dualHandMode && (
          <div className={`mediapipe-status-item ${
            bothHandsDetected ? 'mediapipe-status-active' : 'mediapipe-status-warning'
          }`}>
            {bothHandsDetected ? '🤲 Ambas manos detectadas' : '👋 Esperando ambas manos...'}
          </div>
        )}
        {error && (
          <div className="mediapipe-status-item mediapipe-status-error">
            <div>Error: {error}</div>
            <div className="mediapipe-error-message">Revisa permisos de cámara</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaPipeCamera
