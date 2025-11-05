import { useState } from 'react'
import { findPlayer, createNewPlayer } from '../utils/careerManager'
import type { CareerProgress } from '../types/career'

interface CareerModePopupProps {
  onStart: (playerData: CareerProgress) => void
  onClose: () => void
}

export function CareerModePopup({ onStart, onClose }: CareerModePopupProps) {
  const [mode, setMode] = useState<'menu' | 'new-game' | 'continue'>('menu')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const handleNewGame = () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    // Check if username already exists
    const existingPlayer = findPlayer(username)
    if (existingPlayer) {
      setError('Username already exists. Please choose another or use Continue.')
      return
    }

    // Create new player
    const newPlayer = createNewPlayer(username)
    onStart(newPlayer)
  }

  const handleContinue = () => {
    if (!username.trim()) {
      setError('Please enter your username')
      return
    }

    // Find existing player
    const player = findPlayer(username)
    if (!player) {
      setError('Player not found. Please check your username or start a New Game.')
      return
    }

    onStart(player)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '3px solid #00ff00',
          borderRadius: '10px',
          padding: '40px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
        }}
      >
        {mode === 'menu' && (
          <>
            <h1
              style={{
                color: '#00ff00',
                textAlign: 'center',
                marginBottom: '30px',
                fontSize: '32px',
                fontFamily: 'monospace',
                textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
              }}
            >
              CAREER MODE
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button
                onClick={() => setMode('new-game')}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  backgroundColor: '#00ff00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00cc00'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00ff00'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                NEW GAME
              </button>

              <button
                onClick={() => setMode('continue')}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  backgroundColor: '#0088ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0066cc'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0088ff'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                CONTINUE
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  backgroundColor: '#ff0000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#cc0000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff0000'
                }}
              >
                BACK
              </button>
            </div>
          </>
        )}

        {mode === 'new-game' && (
          <>
            <h2
              style={{
                color: '#00ff00',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: 'monospace',
              }}
            >
              NEW GAME
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: '#fff',
                  fontFamily: 'monospace',
                  display: 'block',
                  marginBottom: '10px',
                }}
              >
                Enter Username:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleNewGame()
                }}
                placeholder="Your name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#2a2a2a',
                  color: '#00ff00',
                  border: '2px solid #00ff00',
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: '#ff0000',
                  fontFamily: 'monospace',
                  marginBottom: '15px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleNewGame}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#00ff00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                START
              </button>
              <button
                onClick={() => {
                  setMode('menu')
                  setUsername('')
                  setError('')
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                BACK
              </button>
            </div>
          </>
        )}

        {mode === 'continue' && (
          <>
            <h2
              style={{
                color: '#0088ff',
                textAlign: 'center',
                marginBottom: '20px',
                fontFamily: 'monospace',
              }}
            >
              CONTINUE GAME
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  color: '#fff',
                  fontFamily: 'monospace',
                  display: 'block',
                  marginBottom: '10px',
                }}
              >
                Enter Username:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleContinue()
                }}
                placeholder="Your name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#2a2a2a',
                  color: '#0088ff',
                  border: '2px solid #0088ff',
                  borderRadius: '5px',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: '#ff0000',
                  fontFamily: 'monospace',
                  marginBottom: '15px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleContinue}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#0088ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                CONTINUE
              </button>
              <button
                onClick={() => {
                  setMode('menu')
                  setUsername('')
                  setError('')
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                BACK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
