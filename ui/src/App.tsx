import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CareerModePopup } from './components/CareerModePopup'
import type { CareerProgress } from './types/career'
import { loadCareerSaves } from './utils/careerManager'

function App() {
  const [activeTab, setActiveTab] = useState('HOME')
  const [showCareerPopup, setShowCareerPopup] = useState(false)
  const [totalCoins, setTotalCoins] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const navigate = useNavigate()

  // Load player stats from localStorage
  useEffect(() => {
    const saves = loadCareerSaves()
    if (saves.players.length > 0) {
      // Get most recent player
      const mostRecentPlayer = saves.players.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest
      )
      setTotalCoins(mostRecentPlayer.totalCoins || 0)
      // Set current level (career level 0-5, display as 1-6)
      setCurrentLevel(mostRecentPlayer.currentLevel + 1)
    }
  }, [])

  const handleCareerStart = (player: CareerProgress) => {
    setShowCareerPopup(false)
    // Navigate to career page with level number in URL
    navigate(`/career/${player.currentLevel}`, { state: { playerData: player } })
  }

  const c1 = {
    title: 'CAREER',
    subtitle: 'BUILD YOUR OWN IDENTITY',
    backgroundColor: 'rgba(220, 53, 69, 0.85)',
    backgroundImage: '/c1.jpg',
    flex: 1.2,
  }

  const c2 = {
    title: 'QUICK MATCH',
    subtitle: 'RUN THE RUN NOW!',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backgroundImage: '/c2.jpg',
    flex: 0.9,
  }

  const c3 = {
    title: 'CHAMPIONSHIP',
    subtitle: 'THE BATTLE OF LEGENDS BEGINS HERE',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backgroundImage: '/c3.jpg',
    flex: 1.1,
  }

  const c4 = {
    title: 'EXPLORE THE WORLD',
    subtitle: 'HEY! LETS MOVE ON',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backgroundImage: '/c4.png',
    flex: 0.8,
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      backgroundImage: 'url(/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1,
      }}></div>
      <nav style={{
        position: 'absolute',
        top: '50px',
        left: '70px',
        display: 'flex',
        gap: '3px',
        zIndex: 10,
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          }}
          onClick={() => setActiveTab('HOME')}
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
        top: '130px',
        left: '70px',
        right: '70px',
        display: 'flex',
        gap: '20px',
        zIndex: 10,
      }}>
        {[c1, c2, c3, c4].map((card, index) => (
          <div
            key={index}
            style={{
              flex: card.flex,
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (card.title === 'CAREER') {
                setShowCareerPopup(true)
              }
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.4)'
            const img = e.currentTarget.querySelector('.card-image') as HTMLElement
            const text = e.currentTarget.querySelector('.card-text') as HTMLElement
            if (img) img.style.transform = 'scale(1.1)'
            if (text) text.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
            const img = e.currentTarget.querySelector('.card-image') as HTMLElement
            const text = e.currentTarget.querySelector('.card-text') as HTMLElement
            if (img) img.style.transform = 'scale(1)'
            if (text) text.style.transform = 'scale(1)'
          }}>
            <div className="card-image" style={{
              height: '450px',
              backgroundImage: `url(${card.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.5s ease',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                opacity: 0.15,
                pointerEvents: 'none',
              }}></div>
            </div>
            <div className="card-text" style={{
              backgroundColor: card.backgroundColor,
              padding: '20px 30px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.5s ease',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                opacity: 0.15,
                pointerEvents: 'none',
              }}></div>
              <h2 style={{
                color: '#ffffff',
                fontSize: '32px',
                fontWeight: 700,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                margin: '0 0 5px 0',
                position: 'relative',
                zIndex: 1,
              }}>{card.title}</h2>
              <p style={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 400,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                margin: 0,
                position: 'relative',
                zIndex: 1,
              }}>{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
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
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '70px',
        zIndex: 10,
      }}>
        <img src="/logo.png" alt="Logo" style={{
          maxWidth: '150px',
          height: 'auto',
        }} />
      </div>
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        height: '100%',
      }}>
        {/* Content will go here */}
      </div>

      {/* Career Mode Popup */}
      {showCareerPopup && (
        <CareerModePopup
          onStart={handleCareerStart}
          onClose={() => setShowCareerPopup(false)}
        />
      )}
    </div>
  )
}

export default App
