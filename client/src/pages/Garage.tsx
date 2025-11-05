import { useState, Suspense, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, SSAO, ToneMapping } from '@react-three/postprocessing'
import { Model as Car1Model } from '../models/Car1'
import { Model as Car2Model } from '../models/Car2'
import { Model as Car3Model } from '../models/Car3'
import { Model as Car4Model } from '../models/Car4'
import { Model as Car5Model } from '../models/Car5'
import { Model as Car6Model } from '../models/Car6'
import type { CareerProgress } from '../types/career'
import { loadCareerSaves } from '../utils/careerManager'

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

const cars = [
  {
    id: 1,
    Model: Car1Model,
    name: '1962 Pontiac Catalina',
    scale: 0.9,
    position: [-5, -1, 0] as [number, number, number],
    rotation: [-0.25, -Math.PI / -0.79, -0.1] as [number, number, number],
    shadowPosition: [-5, -0.9, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 2,
    Model: Car2Model,
    name: 'McLaren W1',
    scale: 1.3,
    position: [-5.4, -1, 0] as [number, number, number],
    rotation: [-0.11, - Math.PI /0.8, -0.1] as [number, number, number],
    shadowPosition: [-5.4, -1, 0] as [number, number, number],
    lightPosition: [-5.4, 8, 0] as [number, number, number]
  },
  {
    id: 3,
    Model: Car3Model,
    name: 'Car 3',
    scale: 1.1,
    position: [-5.3, -1, 0] as [number, number, number],
    rotation: [-0.11, -Math.PI / 3.8, 0.15] as [number, number, number],
    shadowPosition: [-5.3, -1.1, 0] as [number, number, number],
    lightPosition: [-5.3, 8, 0] as [number, number, number]
  },
  {
    id: 4,
    Model: Car4Model,
    name: 'Car 4',
    scale: 1.1,
    position: [-5, -1.1, 0] as [number, number, number],
    rotation: [-0.15, - Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-5, -1, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 5,
    Model: Car5Model,
    name: 'Car 5',
    scale:1.1,
    position: [-5, -1, 0] as [number, number, number],
    rotation: [-0.15, - Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-5, -0.9, 0] as [number, number, number],
    lightPosition: [-5, 8, 0] as [number, number, number]
  },
  {
    id: 6,
    Model: Car6Model,
    name: 'Car 6',
    scale: 1.1,
    position: [-5.5, -1.2, 0] as [number, number, number],
    rotation: [-0.15,  Math.PI / 4.5, 0.1] as [number, number, number],
    shadowPosition: [-3.5, -1.15, 0] as [number, number, number],
    lightPosition: [-5.5, 8, 0] as [number, number, number]
  },
]

function Garage() {
  const [activeTab, setActiveTab] = useState('GARAGE')
  const [currentCarIndex, setCurrentCarIndex] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const [xpLevel, setXpLevel] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Load player's total coins from localStorage
  useEffect(() => {
    console.log('[GARAGE DEBUG] useEffect triggered')
    console.log('[GARAGE DEBUG] location.state:', location.state)

    // Try to get player data from location state first
    const locationPlayerData = (location.state as { playerData?: CareerProgress })?.playerData
    console.log('[GARAGE DEBUG] locationPlayerData:', locationPlayerData)

    // Load all saves
    const saves = loadCareerSaves()
    console.log('[GARAGE DEBUG] Loaded saves:', saves)

    let player: CareerProgress | undefined

    if (locationPlayerData && locationPlayerData.username) {
      console.log('[GARAGE DEBUG] Looking for player by username:', locationPlayerData.username)
      // Find player by username from location state
      player = saves.players.find(
        p => p.username.toLowerCase() === locationPlayerData.username.toLowerCase()
      )
      console.log('[GARAGE DEBUG] Found player by username:', player)

      // Check if player just completed level 0 - show welcome message
      if (player && player.completedLevels.includes(0) && player.currentLevel === 1) {
        setShowWelcomeMessage(true)
        // Hide message after 15 seconds
        setTimeout(() => {
          setShowWelcomeMessage(false)
        }, 15000)
      }
    } else if (saves.players.length > 0) {
      console.log('[GARAGE DEBUG] No location state, using most recent player')
      // If no location state, use the most recently played player (highest timestamp)
      player = saves.players.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      )
      console.log('[GARAGE DEBUG] Most recent player:', player)
    }

    if (player) {
      console.log('[GARAGE DEBUG] Setting totalCoins to:', player.totalCoins)
      setTotalCoins(player.totalCoins || 0)
      // Calculate XP (10 coins = 1 XP)
      setXpLevel(Math.floor((player.totalCoins || 0) / 10))
      // Set current level (display as level + 1, so level 0 = "1", level 1 = "2", etc.)
      setCurrentLevel(player.currentLevel + 1)
    } else {
      console.error('[GARAGE DEBUG] ERROR: No player found!')
    }
  }, [location.state])

  const currentCar = cars[currentCarIndex]
  const CurrentCarModel = currentCar.Model

  const handlePrevious = () => {
    setCurrentCarIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const handleNext = () => {
    setCurrentCarIndex((prev) => (prev + 1) % cars.length)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      backgroundImage: 'url(/garage.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <Canvas
        shadows
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <PerspectiveCamera makeDefault position={[-6, 2, 6]} fov={50} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
          target={[-8, 0, 0]}
        />
          <ambientLight intensity={0.15} />
          <directionalLight
            position={currentCar.lightPosition}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <spotLight
            position={[currentCar.position[0], 6, 2]}
            angle={0.4}
            penumbra={1}
            intensity={0.5}
            castShadow
            target-position={currentCar.position}
          />
        <Suspense fallback={<Loader />}>
          <CurrentCarModel scale={currentCar.scale} position={currentCar.position} rotation={currentCar.rotation} />
        </Suspense>
        {/* Ground plane to receive shadows */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={currentCar.shadowPosition}>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.5} color="#000000" transparent={true} />
        </mesh>
        <Environment preset="warehouse" environmentIntensity={0.3} />
        <EffectComposer>
          <SSAO
            samples={16}
            radius={0.5}
            intensity={30}
            luminanceInfluence={0.6}
          />
          <ToneMapping
            adaptive={true}
            resolution={256}
            middleGrey={0.4}
            maxLuminance={8.0}
            averageLuminance={1.0}
            adaptationRate={1.0}
          />
        </EffectComposer>
      </Canvas>
      <nav style={{
        position: 'absolute',
        top: '50px',
        left: '70px',
        display: 'flex',
        gap: '3px',
        zIndex: 10,
        fontFamily: 'Arial, Helvetica, sans-serif',
        pointerEvents: 'none',
      }}>
        <button
          style={{
            backgroundColor: activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'HOME' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => {
            setActiveTab('HOME')
            navigate('/')
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'HOME' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'HOME' ? '#000000' : '#ffffff'
          }}
        >
          HOME
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'GARAGE' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => {
            setActiveTab('GARAGE')
            navigate('/garage')
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'GARAGE' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'GARAGE' ? '#000000' : '#ffffff'
          }}
        >
          GARAGE
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'SHOP' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => setActiveTab('SHOP')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'SHOP' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'SHOP' ? '#000000' : '#ffffff'
          }}
        >
          SHOP
        </button>
        <button
          style={{
            backgroundColor: activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
            color: activeTab === 'SETTINGS' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 600,
            fontStyle: 'italic',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
          }}
          onClick={() => setActiveTab('SETTINGS')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = activeTab === 'SETTINGS' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = activeTab === 'SETTINGS' ? '#000000' : '#ffffff'
          }}
        >
          SETTINGS
        </button>
      </nav>
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '70px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px 19px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, Helvetica, sans-serif',
        pointerEvents: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#f7bf08ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          }}>
            $
          </div>
          <span style={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            fontStyle: 'italic',
          }}>
            {totalCoins >= 1000 ? `${(totalCoins / 1000).toFixed(2)}K` : totalCoins}
          </span>
        </div>
        <div style={{
          width: '1px',
          height: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: '#ca4932ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff',
          }}>
            {currentLevel}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#ffcc00',
            fontWeight: 'bold',
            marginLeft: '4px',
          }}>
            XP: {xpLevel}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              lineHeight: '1.2',
            }}>
              0X67EF6....9EDF
            </span>
            <span style={{
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 400,
              lineHeight: '1.2',
            }}>
              RACER
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Grid - Left Side */}
      <div style={{
        position: 'absolute',
        left: '200px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {/* Top Speed Category */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(60, 60, 60, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%)',
            padding: '10px 20px',
            textAlign: 'center',
            borderBottom: '3px solid #4a90e2',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              TOP SPEED
            </span>
          </div>
          {/* Top Speed Items */}
          {[0, 1].map((idx) => (
            <div key={`speed-${idx}`} style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              background: 'linear-gradient(135deg, rgba(45, 45, 55, 0.95) 0%, rgba(30, 30, 40, 0.95) 100%)',
              border: '3px solid rgba(74, 144, 226, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.8)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.4)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            >
              {/* Upgrade Arrow */}
              {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 8px rgba(255, 87, 34, 0.5)',
                }}>
                  <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>↑</span>
                </div>
              )}
              {/* Star Rating */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '3px',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '12px',
              }}>
                <span style={{ color: '#f7bf08', fontSize: '18px', filter: 'drop-shadow(0 0 2px rgba(247, 191, 8, 0.5))' }}>★</span>
              </div>
              {/* Selection Arrow */}
              {idx === 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#4fc3f7',
                  fontSize: '28px',
                  filter: 'drop-shadow(0 2px 4px rgba(79, 195, 247, 0.6))',
                }}>
                  ▲
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Acceleration Category */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(60, 60, 60, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%)',
            padding: '10px 20px',
            textAlign: 'center',
            borderBottom: '3px solid #4a90e2',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              ACCELERATION
            </span>
          </div>
          {/* Acceleration Items */}
          {[0, 1].map((idx) => (
            <div key={`accel-${idx}`} style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              background: 'linear-gradient(135deg, rgba(45, 45, 55, 0.95) 0%, rgba(30, 30, 40, 0.95) 100%)',
              border: '3px solid rgba(74, 144, 226, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.8)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.4)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            >
              {/* Upgrade Arrow */}
              {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 8px rgba(255, 87, 34, 0.5)',
                }}>
                  <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>↑</span>
                </div>
              )}
              {/* Star Rating */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '3px',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '12px',
              }}>
                <span style={{ color: '#f7bf08', fontSize: '18px', filter: 'drop-shadow(0 0 2px rgba(247, 191, 8, 0.5))' }}>★</span>
              </div>
              {/* Selection Arrow */}
              {idx === 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#4fc3f7',
                  fontSize: '28px',
                  filter: 'drop-shadow(0 2px 4px rgba(79, 195, 247, 0.6))',
                }}>
                  ▲
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nitro Category */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(60, 60, 60, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%)',
            padding: '10px 20px',
            textAlign: 'center',
            borderBottom: '3px solid #4a90e2',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}>
              NITRO
            </span>
          </div>
          {/* Nitro Items */}
          {[0, 1].map((idx) => (
            <div key={`nitro-${idx}`} style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              background: 'linear-gradient(135deg, rgba(45, 45, 55, 0.95) 0%, rgba(30, 30, 40, 0.95) 100%)',
              border: '3px solid rgba(74, 144, 226, 0.4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.8)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(74, 144, 226, 0.4)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            >
              {/* Upgrade Arrow */}
              {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 8px rgba(255, 87, 34, 0.5)',
                }}>
                  <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>↑</span>
                </div>
              )}
              {/* Star Rating */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '3px',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '12px',
              }}>
                <span style={{ color: '#f7bf08', fontSize: '18px', filter: 'drop-shadow(0 0 2px rgba(247, 191, 8, 0.5))' }}>★</span>
              </div>
              {/* Selection Arrow */}
              {idx === 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: '#4fc3f7',
                  fontSize: '28px',
                  filter: 'drop-shadow(0 2px 4px rgba(79, 195, 247, 0.6))',
                }}>
                  ▲
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Car Navigation Arrows */}
      <button
        onClick={handlePrevious}
        style={{
          position: 'absolute',
          left: '100px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          fontSize: '60px',
          fontWeight: 'bold',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        ‹
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '100px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: '#fff',
          fontSize: '60px',
          fontWeight: 'bold',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
      >
        ›
      </button>

      {/* Car Stats Display - Bottom Center */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        {/* Top Speed */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(70, 130, 180, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(100, 160, 210, 0.5)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: 'bold',
              lineHeight: '1',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'monospace',
            }}>
              1066
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '2px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}>
              TOP SPEED
            </span>
          </div>
        </div>

        {/* Acceleration */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(70, 130, 180, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(100, 160, 210, 0.5)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: 'bold',
              lineHeight: '1',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'monospace',
            }}>
              1000
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '2px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}>
              ACCELERATION
            </span>
          </div>
        </div>

        {/* Handling */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(70, 130, 180, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(100, 160, 210, 0.5)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="2"/>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              color: '#ffffff',
              fontSize: '34px',
              fontWeight: 'bold',
              lineHeight: '1',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              fontFamily: 'monospace',
            }}>
              996
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: '2px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            }}>
              HANDLING
            </span>
          </div>
        </div>
      </div>

      {/* Car Info Display - Bottom Left */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        left: '70px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}>
        <div style={{
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          backgroundColor: '#f7bf08ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="black">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '33px',
            fontWeight: 'bold',
            lineHeight: '1.2',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}>
            {cars[currentCarIndex].name}
          </span>
          <div style={{
            display: 'flex',
            gap: '6px',
            marginTop: '9px',
          }}>
            <span style={{ color: '#f7bf08ff', fontSize: '30px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>★</span>
            <span style={{ color: '#f7bf08ff', fontSize: '30px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>★</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '30px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>★</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '30px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>★</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '30px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>★</span>
          </div>
        </div>
      </div>

      {/* Drive Button */}
      <button
        disabled={currentCarIndex !== 4}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '70px',
          backgroundColor: currentCarIndex === 4 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(100, 100, 100, 0.3)',
          color: currentCarIndex === 4 ? '#ffffff' : '#666666',
          border: 'none',
          padding: '18px 36px',
          fontSize: '27px',
          fontWeight: 600,
          fontStyle: 'italic',
          letterSpacing: '0.75px',
          cursor: currentCarIndex === 4 ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          opacity: currentCarIndex === 4 ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (currentCarIndex === 4) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.color = '#000000'
          }
        }}
        onMouseLeave={(e) => {
          if (currentCarIndex === 4) {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
            e.currentTarget.style.color = '#ffffff'
          }
        }}
        onClick={() => {
          if (currentCarIndex === 4) {
            // Car 5 (index 4) selected - navigate to career/1
            console.log('Car 5 selected, navigating to career/1')

            // Load player data from localStorage
            const saves = loadCareerSaves()
            if (saves.players.length > 0) {
              const mostRecentPlayer = saves.players.reduce((latest, current) =>
                current.timestamp > latest.timestamp ? current : latest
              )
              navigate('/career/1', { state: { playerData: mostRecentPlayer } })
            }
          }
        }}
      >
        {currentCarIndex === 4 ? 'SELECT' : 'LOCKED'}
      </button>

      {/* Welcome message after completing career/0 */}
      {showWelcomeMessage && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '25px 50px',
          borderRadius: '12px',
          border: '2px solid rgba(0, 200, 100, 0.8)',
          boxShadow: '0 0 30px rgba(0, 200, 100, 0.5)',
          maxWidth: '85%',
          textAlign: 'center',
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '20px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            margin: 0,
            lineHeight: '1.6',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          }}>
            Collect <span style={{ color: '#ffa500', fontWeight: 'bold' }}>coins</span> to unlock the next level. Each level unlocks <span style={{ color: '#00ff88', fontWeight: 'bold' }}>new cars</span> along with new modes like <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>blob</span>, <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>gmswap</span> all the way to <span style={{ color: '#ff4444', fontWeight: 'bold' }}>reclaiming your L2</span>. Start with this car and make your way up the <span style={{ color: '#ff00ff', fontWeight: 'bold' }}>blacklist</span>!
          </p>
        </div>
      )}
    </div>
  )
}

export default Garage
