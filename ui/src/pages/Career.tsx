import { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { Model as MapModel } from '../models/Map'
import { Model as Car1Model } from '../models/Car1'
import { Model as BitcoinModel } from '../models/Bitcoin'
import * as THREE from 'three'
import type { CarState } from '../carPhysics'
import { updateCarPhysics } from '../carPhysics'
import type { CareerProgress } from '../types/career'
import { LEVEL_SPAWN_POSITIONS } from '../types/career'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { completeLevel, loadCareerSaves } from '../utils/careerManager'
import '../utils/debugCareer' // Enable debug functions

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

// Bitcoin collectible component with spinning animation and collision detection
interface BitcoinCollectibleProps {
  position: [number, number, number]
  onCollect: () => void
  carPosition: THREE.Vector3
}

function BitcoinCollectible({ position, onCollect, carPosition }: BitcoinCollectibleProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [collected, setCollected] = useState(false)
  const collectionRadius = 2.0 // Collision detection radius

  useFrame(({ clock }) => {
    if (!meshRef.current || collected) return

    // Spinning animation
    meshRef.current.rotation.y = clock.getElapsedTime() * 2

    // Collision detection with car
    const coinPos = new THREE.Vector3(...position)
    const distance = carPosition.distanceTo(coinPos)

    if (distance < collectionRadius) {
      setCollected(true)
      onCollect()
    }
  })

  if (collected) return null

  return (
    <group ref={meshRef} position={position}>
      {/* Scale down the Bitcoin model to appropriate size */}
      <BitcoinModel scale={0.01} />
    </group>
  )
}

interface CarControllerProps {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  onPositionChange?: (position: THREE.Vector3) => void
  onRotationChange?: (rotation: number) => void
  onSpeedChange?: (speed: number) => void
  onTireMarksUpdate?: (marks: TireMark[]) => void
  reachedTarget?: boolean
}

// Camera follow component
function CameraFollow({ target }: { target: React.RefObject<THREE.Group | null> }) {
  const { camera } = useThree()
  const cameraOffset = useRef(new THREE.Vector3(0, 1.5, -3)) // Camera position behind car (closer view)
  const targetPosition = useRef(new THREE.Vector3())
  const currentPosition = useRef(new THREE.Vector3())
  const lookAtPosition = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!target.current) return

    // Calculate desired camera position behind the car
    const carPosition = target.current.position
    const carRotation = target.current.rotation.y

    // Position camera close behind and low (intimate rear view)
    targetPosition.current.x = carPosition.x - Math.sin(carRotation) * cameraOffset.current.z
    targetPosition.current.y = carPosition.y + cameraOffset.current.y
    targetPosition.current.z = carPosition.z - Math.cos(carRotation) * cameraOffset.current.z

    // Smooth camera movement (lerp)
    currentPosition.current.lerp(targetPosition.current, 0.1)
    camera.position.copy(currentPosition.current)

    // Look at the car
    lookAtPosition.current.x = carPosition.x - Math.sin(carRotation) * 0.1
    lookAtPosition.current.y = carPosition.y + 0.05
    lookAtPosition.current.z = carPosition.z - Math.cos(carRotation) * 0.1

    camera.lookAt(lookAtPosition.current)
  })

  return null
}

// Minimap camera - top-down view that rotates with car
function MinimapCamera({ position, rotation }: { position: THREE.Vector3, rotation: number }) {
  const { camera } = useThree()

  useFrame(() => {
    // Position camera directly above the car (closer for scaled environment)
    camera.position.set(position.x, position.y + 30, position.z)
    // Look straight down at the car
    camera.lookAt(position.x, position.y, position.z)

    // Rotate the camera's up vector to match car rotation
    // This makes the map rotate so the car always points "up" on the minimap
    const upX = Math.sin(rotation)
    const upZ = Math.cos(rotation)
    camera.up.set(upX, 0, upZ)
  })

  return null
}

// Static fullmap camera - shows entire map with drag support
function FullMapCamera({ offset }: { offset: { x: number, z: number } }) {
  const { camera } = useThree()

  useFrame(() => {
    // Camera position with drag offset (adjusted for scaled environment)
    camera.position.set(800 + offset.x, 100, 800 + offset.z)
    camera.lookAt(800 + offset.x, 0, 800 + offset.z)
    camera.up.set(0, 0, 1)
  })

  return null
}

// Blinking arrow indicator for fullscreen map
function BlinkingArrow({ position, rotation }: { position: THREE.Vector3, rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    // Pulsing effect using sine wave
    const pulseScale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3
    const opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.5

    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulseScale)
    }
    if (glowRef.current && glowRef.current.material) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      material.opacity = opacity
    }
  })

  // Create arrow shape (pointing up/forward)
  const arrowShape = new THREE.Shape()
  // Arrow head (triangle)
  arrowShape.moveTo(0, 3)       // Top point
  arrowShape.lineTo(-1.5, 1)    // Bottom left
  arrowShape.lineTo(-0.5, 1)    // Neck left
  arrowShape.lineTo(-0.5, -1)   // Tail left
  arrowShape.lineTo(0.5, -1)    // Tail right
  arrowShape.lineTo(0.5, 1)     // Neck right
  arrowShape.lineTo(1.5, 1)     // Bottom right
  arrowShape.lineTo(0, 3)       // Back to top

  return (
    <group position={[position.x, position.y + 0.5, position.z]} rotation={[0, rotation, 0]}>
      {/* Main purple arrow */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[arrowShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshBasicMaterial color="#bb00ff" />
      </mesh>
      {/* Pulsing purple glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} scale={1.2}>
        <extrudeGeometry args={[arrowShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
      </mesh>
      {/* White core for visibility */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={0.6}>
        <extrudeGeometry args={[arrowShape, { depth: 0.25, bevelEnabled: false }]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Directional arrow on top of car pointing to target
function DirectionalArrow({ carPosition, targetPosition }: { carPosition: THREE.Vector3, targetPosition: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // Calculate direction from car to target
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, carPosition)
    direction.y = 0 // Keep arrow horizontal
    direction.normalize()

    // Calculate rotation angle to point toward target
    const angle = Math.atan2(direction.x, direction.z)

    // Position arrow ahead of the car in the direction of the target
    const offset = 3.0 // Distance ahead of car
    const arrowX = carPosition.x + direction.x * offset
    const arrowZ = carPosition.z + direction.z * offset

    groupRef.current.position.x = arrowX
    groupRef.current.position.z = arrowZ

    // Update arrow rotation to point toward target (reversed by 180 degrees)
    groupRef.current.rotation.y = angle + Math.PI

    // Bobbing animation
    groupRef.current.position.y = carPosition.y + 2.5 + Math.sin(clock.getElapsedTime() * 2) * 0.15
  })

  // Create arrow shape (pointing up/forward)
  const arrowShape = new THREE.Shape()
  arrowShape.moveTo(0, 0.8)       // Top point
  arrowShape.lineTo(-0.4, 0.3)    // Bottom left
  arrowShape.lineTo(-0.15, 0.3)   // Neck left
  arrowShape.lineTo(-0.15, -0.3)  // Tail left
  arrowShape.lineTo(0.15, -0.3)   // Tail right
  arrowShape.lineTo(0.15, 0.3)    // Neck right
  arrowShape.lineTo(0.4, 0.3)     // Bottom right
  arrowShape.lineTo(0, 0.8)       // Back to top

  return (
    <group ref={groupRef} position={[carPosition.x, carPosition.y + 2.5, carPosition.z]}>
      {/* Main light orange arrow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[arrowShape, { depth: 0.1, bevelEnabled: false }]} />
        <meshBasicMaterial color="#ffb366" />
      </mesh>
      {/* Orange glow outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1.15}>
        <extrudeGeometry args={[arrowShape, { depth: 0.08, bevelEnabled: false }]} />
        <meshBasicMaterial color="#ff8c1a" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// Tire marks component - shows skid marks when braking
interface TireMark {
  leftPosition: THREE.Vector3
  rightPosition: THREE.Vector3
  rotation: number
  timestamp: number
}

function TireMarks({ marks }: { marks: TireMark[] }) {
  const meshRefs = useRef<THREE.Mesh[]>([])

  useFrame(() => {
    // Fade out old tire marks over time
    const currentTime = Date.now()
    meshRefs.current.forEach((mesh, index) => {
      if (mesh && marks[Math.floor(index / 2)]) {
        const age = currentTime - marks[Math.floor(index / 2)].timestamp
        const maxAge = 8000 // Fade over 8 seconds
        const opacity = Math.max(0, 1 - age / maxAge)
        if (mesh.material && mesh.material instanceof THREE.MeshBasicMaterial) {
          mesh.material.opacity = opacity
        }
      }
    })
  })

  return (
    <>
      {marks.map((mark, index) => (
        <group key={index}>
          {/* Left tire mark */}
          <mesh
            ref={(ref) => { if (ref) meshRefs.current[index * 2] = ref }}
            position={[mark.leftPosition.x, mark.leftPosition.y + 0.002, mark.leftPosition.z]}
            rotation={[-Math.PI / 2, 0, mark.rotation]}
          >
            <planeGeometry args={[0.08, 0.15]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Right tire mark */}
          <mesh
            ref={(ref) => { if (ref) meshRefs.current[index * 2 + 1] = ref }}
            position={[mark.rightPosition.x, mark.rightPosition.y + 0.002, mark.rightPosition.z]}
            rotation={[-Math.PI / 2, 0, mark.rotation]}
          >
            <planeGeometry args={[0.08, 0.15]} />
            <meshBasicMaterial color="#1a1a1a" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CarController({ position: initialPosition, rotation: initialRotation, scale, onPositionChange, onRotationChange, onSpeedChange, onTireMarksUpdate, reachedTarget }: CarControllerProps) {
  const carRef = useRef<THREE.Group>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const tireMarks = useRef<TireMark[]>([])
  const lastMarkTime = useRef<number>(0)

  // Random steering for auto-drive
  const randomSteerTime = useRef<number>(0)
  const currentRandomSteer = useRef<'left' | 'right' | 'none'>('none')

  // Initialize car state with physics
  const carState = useRef<CarState>({
    velocity: new THREE.Vector3(0, 0, 0),
    angularVelocity: 0,
    position: new THREE.Vector3(...initialPosition),
    rotation: initialRotation[1],
    verticalVelocity: 0
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_state, delta) => {
    if (!carRef.current) return

    // Random steering logic when reached target
    if (reachedTarget) {
      randomSteerTime.current += delta

      // Change steering direction every 0.3-0.8 seconds randomly
      if (randomSteerTime.current > 0.3 + Math.random() * 0.5) {
        const rand = Math.random()
        if (rand < 0.4) {
          currentRandomSteer.current = 'left'
        } else if (rand < 0.8) {
          currentRandomSteer.current = 'right'
        } else {
          currentRandomSteer.current = 'none'
        }
        randomSteerTime.current = 0
      }
    }

    // Prepare controls for physics update
    // If reached target, disable all controls except force forward with random steering
    const controls = reachedTarget ? {
      forward: true,  // Keep W pressed
      backward: false,
      left: currentRandomSteer.current === 'left',
      right: currentRandomSteer.current === 'right',
    } : {
      forward: keysPressed.current['w'] || false,
      backward: keysPressed.current['s'] || false,
      left: keysPressed.current['a'] || false,
      right: keysPressed.current['d'] || false,
    }

    // Update physics with delta multiplier for smooth movement
    const deltaMultiplier = delta * 60 // Normalize to 60fps
    carState.current = updateCarPhysics(carState.current, controls, deltaMultiplier)

    // Detect braking and create tire marks
    const currentSpeed = Math.sqrt(
      carState.current.velocity.x * carState.current.velocity.x +
      carState.current.velocity.z * carState.current.velocity.z
    )
    const isBraking = controls.backward && currentSpeed > 0.05 // Braking while moving forward
    const currentTime = Date.now()

    // Create tire marks every 50ms while braking
    if (isBraking && currentTime - lastMarkTime.current > 50) {
      // Calculate tire positions (left and right wheels)
      const tireWidth = 1.0 // Distance between left and right tires (scaled down 100x from 100)
      const rightDir = new THREE.Vector3(
        Math.cos(carState.current.rotation),
        0,
        -Math.sin(carState.current.rotation)
      )

      const leftPos = carState.current.position.clone().add(
        rightDir.clone().multiplyScalar(-tireWidth / 2)
      )
      const rightPos = carState.current.position.clone().add(
        rightDir.clone().multiplyScalar(tireWidth / 2)
      )

      // Add new tire mark
      tireMarks.current.push({
        leftPosition: leftPos,
        rightPosition: rightPos,
        rotation: carState.current.rotation,
        timestamp: currentTime,
      })

      // Keep only recent marks (last 200 marks = ~10 seconds at 50ms interval)
      if (tireMarks.current.length > 200) {
        tireMarks.current.shift()
      }

      lastMarkTime.current = currentTime

      // Notify parent to update tire marks
      if (onTireMarksUpdate) {
        onTireMarksUpdate([...tireMarks.current])
      }
    }

    // Apply updated state to car
    carRef.current.position.copy(carState.current.position)
    carRef.current.rotation.y = carState.current.rotation

    // Notify parent of position, rotation, and speed changes
    if (onPositionChange) {
      onPositionChange(carState.current.position)
    }
    if (onRotationChange) {
      onRotationChange(carState.current.rotation)
    }
    if (onSpeedChange) {
      onSpeedChange(currentSpeed)
    }
  })

  return (
    <>
      <group ref={carRef}>
        {/* Add Math.PI/2 + Math.PI to rotation (rotate car 180 degrees) */}
        <Car1Model scale={scale} rotation={[initialRotation[0], initialRotation[1] + Math.PI / 2 + Math.PI, initialRotation[2]]} />
      </group>
      <CameraFollow target={carRef} />
    </>
  )
}

function Career() {
  const { level } = useParams<{ level: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  // Get level from URL parameter
  const levelNumber = parseInt(level || '0', 10)

  // Get player data from location state, or load from localStorage if not available
  const [playerData, setPlayerData] = useState<CareerProgress | null>(() => {
    const locationPlayerData = (location.state as { playerData?: CareerProgress })?.playerData

    if (locationPlayerData) {
      console.log('[CAREER DEBUG] Player data from location state:', locationPlayerData)
      return locationPlayerData
    }

    // If no location state, try to load the most recent player from localStorage
    console.log('[CAREER DEBUG] No location state, loading from localStorage')
    const saves = loadCareerSaves()

    if (saves.players.length > 0) {
      const mostRecentPlayer = saves.players.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      )
      console.log('[CAREER DEBUG] Loaded most recent player from localStorage:', mostRecentPlayer)
      return mostRecentPlayer
    }

    console.warn('[CAREER DEBUG] No players found in localStorage!')
    return null
  })

  // Career mode state
  const [_currentLevel, _setCurrentLevel] = useState<number>(levelNumber)
  const spawnData = LEVEL_SPAWN_POSITIONS[levelNumber]
  const [spawnPosition] = useState<[number, number, number]>(spawnData.position)
  const [spawnRotation] = useState<number>(spawnData.rotation)

  // Game state
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3>(new THREE.Vector3(...spawnData.position))
  const [currentRotation, setCurrentRotation] = useState<number>(spawnData.rotation)
  const [_currentSpeed, setCurrentSpeed] = useState<number>(0)
  const [showFullMap, setShowFullMap] = useState<boolean>(false)
  const [mapOffset, setMapOffset] = useState<{ x: number, z: number }>({ x: 0, z: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const [tireMarks, setTireMarks] = useState<TireMark[]>([])
  const mapRef = useRef<THREE.Group>(null)

  // XP and coins state (only for level 0)
  const [coinsCollected, setCoinsCollected] = useState<number>(0)
  const [xpPoints, setXpPoints] = useState<number>(0)

  // Level completion state
  const [reachedTarget, setReachedTarget] = useState<boolean>(false)
  const [showBlackScreen, setShowBlackScreen] = useState<boolean>(false)

  // Subtitle system
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false)

  // Generate Bitcoin positions for level 0 only
  const bitcoinPositions: [number, number, number][] = levelNumber === 0 ? [
    [1081.1, 0.5, 556.3],
    [1081.1, 0.5, 561.3],
    [1081.1, 0.5, 566.3],
    [1081.1, 0.5, 571.3],
    [1081.1, 0.5, 576.3],
    [1081.1, 0.5, 580],
    // First set: 3 coins at X: 1080.6, Y: 0.2, Z: 611.2, spaced 5 units apart
    [1080.6, 0.2, 611.2],
    [1080.6, 0.2, 616.2],
    [1080.6, 0.2, 621.2],
    // Custom positioned coins
    [1075.9, 0.2, 634.6],
    [1074.0, 0.2, 638.8],
    [1071.4, 0.2, 644.5],
    // Coins from Z: 664.6 onwards, spaced 10 units apart
    [1066.1, 0.2, 664.6],
    [1066.1, 0.2, 674.6],
    [1066.1, 0.2, 684.6],
    [1066.1, 0.2, 694.6],
    [1066.1, 0.2, 704.6],
    // Coins from Z: 727.7 onwards
    [1065.8, 0.2, 727.7],
    [1065.8, 0.2, 732],
    [1065.8, 0.2, 738],
    [1065.8, 0.2, 744],
  ] : []

  // Handle coin collection
  const handleCoinCollect = () => {
    setCoinsCollected(prev => {
      const newCount = prev + 1
      console.log('[CAREER DEBUG] Coin collected! New count:', newCount)
      // Calculate XP (10 coins = 1 XP)
      const newXp = Math.floor(newCount / 10)
      setXpPoints(newXp)
      return newCount
    })
  }

  // Show subtitle 8 seconds into level 0
  useEffect(() => {
    if (levelNumber === 0) {
      const timer = setTimeout(() => {
        setShowSubtitle(true)
        // Hide subtitle after 10 seconds
        setTimeout(() => {
          setShowSubtitle(false)
        }, 10000)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [levelNumber])

  // Check if player reached target zone
  useEffect(() => {
    if (reachedTarget) return

    const targetX = 1065.8
    const targetZ = 752.0
    const xRange = 10 // From 1060 to 1070 (±5 from center)

    const isInTargetZone =
      currentPosition.x >= targetX - xRange &&
      currentPosition.x <= targetX + xRange &&
      currentPosition.z >= targetZ - 10 &&
      currentPosition.z <= targetZ + 10

    if (isInTargetZone && !reachedTarget) {
      console.log('[CAREER DEBUG] Reached target zone!')
      setReachedTarget(true)

      // Save progress and show black screen after 3 seconds
      setTimeout(() => {
        // Save player progress with coins collected
        console.log('[CAREER DEBUG] About to save progress. PlayerData:', playerData)
        console.log('[CAREER DEBUG] Level number:', levelNumber)
        console.log('[CAREER DEBUG] Coins collected:', coinsCollected)

        if (playerData && playerData.username) {
          completeLevel(playerData.username, levelNumber, coinsCollected)
          console.log('[CAREER DEBUG] completeLevel called successfully')
        } else {
          console.error('[CAREER DEBUG] ERROR: No playerData or username!')
        }

        setShowBlackScreen(true)

        // Redirect to garage after 1 second of black screen
        setTimeout(() => {
          console.log('[CAREER DEBUG] Navigating to garage with playerData:', playerData)
          navigate('/garage', { state: { playerData } })
        }, 1000)
      }, 3000)
    }
  }, [currentPosition, reachedTarget, playerData, levelNumber, navigate, coinsCollected])

  // Handle M key to toggle full map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        setShowFullMap(prev => {
          const newValue = !prev
          // When opening the map, center it on the car's current position
          if (newValue) {
            setMapOffset({
              x: currentPosition.x - 900,
              z: currentPosition.z - 900
            })
          }
          return newValue
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPosition])

  // Handle mouse dragging on full map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    // Convert screen space delta to world space (scale factor based on zoom)
    const scaleFactor = 0.5 // Adjust sensitivity (scaled down 100x from 50)
    setMapOffset(prev => ({
      x: prev.x + deltaX * scaleFactor,
      z: prev.z + deltaY * scaleFactor
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)',
    }}>
      <Canvas
        shadows
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Camera will be controlled by CameraFollow component */}
        <PerspectiveCamera makeDefault position={[31137.9, 55, -10413.3]} fov={75} far={100000} />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[1000, 500, 1000]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={2000}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />
        <hemisphereLight args={['#87CEEB', '#68A0B0', 0.5]} />

        <Suspense fallback={<Loader />}>
          {/* Map at position (800, 0, 800) */}
          <group ref={mapRef}>
            <MapModel position={[800, 0, 800]} scale={0.01} />
          </group>

          {/* White car (Car1 - 1962 Pontiac Catalina) with WASD controls */}
          <CarController
            key={`car-${spawnPosition.join('-')}`}
            position={spawnPosition}
            scale={0.6}
            rotation={[0, spawnRotation, 0]}
            onPositionChange={setCurrentPosition}
            onRotationChange={setCurrentRotation}
            onSpeedChange={setCurrentSpeed}
            onTireMarksUpdate={setTireMarks}
            reachedTarget={reachedTarget}
          />

          {/* Render tire marks */}
          <TireMarks marks={tireMarks} />

          {/* Directional arrow pointing to target */}
          <DirectionalArrow
            carPosition={currentPosition}
            targetPosition={new THREE.Vector3(1066.1, 0.2, 757.8)}
          />

          {/* Bitcoin collectibles for level 0 only */}
          {levelNumber === 0 && bitcoinPositions.map((position, index) => (
            <BitcoinCollectible
              key={`bitcoin-${index}`}
              position={position}
              onCollect={handleCoinCollect}
              carPosition={currentPosition}
            />
          ))}
        </Suspense>

        <Environment preset="sunset" />

        {/* Ground plane */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[5000, 5000]} />
          <meshStandardMaterial color="#90EE90" />
        </mesh>
      </Canvas>

      {/* UI Overlay - Top Left Info */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        zIndex: 10,
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '20px',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
      }}>

        <p style={{ margin: '5px 0', fontSize: '16px' }}>Starting Position: (31137.9, 10, -10333.3)</p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>Map Position: (800, 0, 800)</p>
        <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '15px' }}>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: 'bold', color: '#4fc3f7' }}>CURRENT POSITION:</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            X: {currentPosition.x.toFixed(1)} | Y: {currentPosition.y.toFixed(1)} | Z: {currentPosition.z.toFixed(1)}
          </p>
        </div>

      </div>

      {/* Coins Display - Top Right (only for level 0) */}
      {levelNumber === 0 && (
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '15px 25px',
          borderRadius: '50px',
          border: '2px solid #ffa500',
          boxShadow: '0 4px 20px rgba(255, 165, 0, 0.4)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ffa500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#000',
            boxShadow: '0 0 15px rgba(255, 165, 0, 0.6)',
          }}>
            $
          </div>
          <span style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'Arial, Helvetica, sans-serif',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}>
            {coinsCollected}
          </span>
        </div>
      )}

      {/* XP Bar (only for level 0) - Right side */}
      {levelNumber === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '30px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
        }}>
          {/* XP Display */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #ffcc00',
            boxShadow: '0 0 20px rgba(255, 204, 0, 0.5)',
            minWidth: '120px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#ffcc00',
              marginBottom: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
              XP Points
            </div>
            <div style={{
              fontSize: '32px',
              color: '#fff',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(255, 204, 0, 0.8)',
            }}>
              {xpPoints}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#aaa',
              marginTop: '5px',
            }}>
              +{xpPoints > 0 ? xpPoints : 0} XP
            </div>
          </div>

          {/* Coins Counter */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ffa500',
            minWidth: '120px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '14px',
              color: '#ffa500',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}>
              COINS
            </div>
            <div style={{
              fontSize: '24px',
              color: '#fff',
              fontWeight: 'bold',
            }}>
              {coinsCollected}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#888',
              marginTop: '5px',
            }}>
              {10 - (coinsCollected % 10)} to next XP
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100px',
            height: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '50px',
            padding: '10px',
            border: '2px solid #333',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${(coinsCollected % 10) * 10}%`,
              backgroundColor: '#ffcc00',
              transition: 'height 0.3s ease',
              borderRadius: '40px',
              boxShadow: '0 0 10px rgba(255, 204, 0, 0.8)',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              zIndex: 1,
            }}>
              {coinsCollected % 10}/10
            </div>
          </div>
        </div>
      )}

      {/* Full Map Overlay */}
      {showFullMap && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div style={{
            width: '90vw',
            height: '90vh',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <Canvas
              orthographic
              camera={{
                position: [800, 100, 800],
                zoom: 2,
                near: 1,
                far: 500
              }}
              style={{ width: '100%', height: '100%' }}
              gl={{ alpha: false, antialias: true }}
            >
              <FullMapCamera offset={mapOffset} />
              <ambientLight intensity={1.2} />
              <directionalLight position={[800, 100, 800]} intensity={1.8} color="#ffffff" />

              <Suspense fallback={null}>
                <MapModel position={[800, 0, 800]} scale={0.01} />

                {/* Blinking blue arrow showing current location */}
                <BlinkingArrow position={currentPosition} rotation={currentRotation} />
              </Suspense>
            </Canvas>

            {/* Close instruction */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              padding: '15px 30px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '10px',
              pointerEvents: 'none',
            }}>
              Press M to close map
            </div>
          </div>
        </div>
      )}

      {/* Minimap - Bottom Left (GTA-style) */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 10,
        width: '280px',
        height: '200px',
        border: '3px solid rgba(40, 40, 40, 0.9)',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 15, 20, 0.95)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0,0,0,0.5)',
      }}>
        <Canvas
          orthographic
          camera={{
            position: [currentPosition.x, 30, currentPosition.z],
            zoom: 6,
            near: 0.1,
            far: 100
          }}
          style={{ width: '100%', height: '100%' }}
          gl={{ alpha: false, antialias: true }}
        >
          <MinimapCamera position={currentPosition} rotation={currentRotation} />
          <ambientLight intensity={1.0} />
          <directionalLight position={[currentPosition.x, 50, currentPosition.z]} intensity={1.2} color="#ffffff" />

          <Suspense fallback={null}>
            {/* Map in minimap */}
            <MapModel position={[800, 0, 800]} scale={0.01} />

            {/* Car indicator - Simple triangle like GTA */}
            <group position={[currentPosition.x, currentPosition.y + 1.2, currentPosition.z]} rotation={[0, currentRotation, 0]}>
              {/* Main triangle */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.25, 0.45, 3]} />
                <meshBasicMaterial color="#4dd2ff" />
              </mesh>
              {/* Border/outline */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <coneGeometry args={[0.28, 0.48, 3]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* Subtitle display */}
      {showSubtitle && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '20px 40px',
          borderRadius: '10px',
          border: '2px solid rgba(255, 0, 0, 0.8)',
          boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
          maxWidth: '80%',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '18px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            margin: 0,
            lineHeight: '1.5',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          }}>
            <span style={{ color: '#ff4444', fontWeight: 'bold' }}>Razor</span> has initiated a <span style={{ color: '#ff4444', fontWeight: 'bold' }}>51% attack</span> on your chain, you have to end the race fast! Head over to the direction the arrow marks.
          </p>
        </div>
      )}

      {/* Black screen overlay when level is complete */}
      {showBlackScreen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          zIndex: 1000,
        }} />
      )}
    </div>
  )
}

export default Career
