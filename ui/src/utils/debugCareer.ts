// Debug utility to view career save data
import { loadCareerSaves } from './careerManager'

export function printCareerData() {
  const saves = loadCareerSaves()

  console.log('=== CAREER SAVE DATA ===')
  console.log('Total players:', saves.players.length)
  console.log('\nPlayers:')

  saves.players.forEach((player, index) => {
    console.log(`\n${index + 1}. ${player.username}`)
    console.log(`   Current Level: career/${player.currentLevel}`)
    console.log(`   Completed Levels: [${player.completedLevels.join(', ')}]`)
    console.log(`   Last Played: ${new Date(player.timestamp).toLocaleString()}`)
  })

  console.log('\n=== RAW JSON ===')
  console.log(JSON.stringify(saves, null, 2))

  return saves
}

export function clearCareerData() {
  localStorage.removeItem('racing_game_career_save')
  console.log('Career data cleared!')
}

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).printCareerData = printCareerData
  (window as any).clearCareerData = clearCareerData
}
