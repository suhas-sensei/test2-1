// Career progression types
export interface CareerProgress {
  username: string
  currentLevel: number // 0-5 (0 is intro)
  completedLevels: number[] // Array of completed level numbers
  timestamp: number // Last played timestamp
  totalCoins: number // Total coins collected across all levels
}

export interface CareerSave {
  players: CareerProgress[]
}

// Level spawn positions
export const LEVEL_SPAWN_POSITIONS: Record<number, { position: [number, number, number], rotation: number }> = {
  0: { position: [1081.0, 0.2, 525.0], rotation: Math.PI }, // Intro level (career/0) - rotated 180 degrees
  1: { position: [1081.0, 0.2, 525.0], rotation: Math.PI }, // Level 1 (career/1) - same spawn as level 0
  2: { position: [31337.9, 20, -10333.3], rotation: Math.PI }, // Level 2 (career/2)
  3: { position: [31437.9, 20, -10333.3], rotation: Math.PI }, // Level 3 (career/3)
  4: { position: [31537.9, 20, -10333.3], rotation: Math.PI }, // Level 4 (career/4)
  5: { position: [31637.9, 20, -10333.3], rotation: Math.PI }, // Level 5 (career/5)
}
