/**
 * Utility functions for calculating compatibility between players
 */

export interface CompatibilityFactors {
  lineCompatibility: number
  heroSynergy: number
  rankProximity: number
  locationProximity: number
  overallScore: number
}

/**
 * Calculate overall compatibility between two players
 */
export const calculateCompatibility = (
  userProfile: {
    favorite_lines: string[]
    favorite_heroes: string[]
    current_rank: string
    city: string
  },
  targetProfile: {
    favorite_lines: string[]
    favorite_heroes: string[]
    current_rank: string
    city: string
  }
): CompatibilityFactors => {
  const lineCompatibility = calculateLineCompatibility(
    userProfile.favorite_lines,
    targetProfile.favorite_lines
  )
  
  const heroSynergy = calculateHeroSynergy(
    userProfile.favorite_heroes,
    targetProfile.favorite_heroes
  )
  
  const rankProximity = calculateRankProximity(
    userProfile.current_rank,
    targetProfile.current_rank
  )
  
  const locationProximity = calculateLocationProximity(
    userProfile.city,
    targetProfile.city
  )
  
  // Weighted overall score
  const overallScore = (
    lineCompatibility * 0.4 +
    heroSynergy * 0.3 +
    rankProximity * 0.2 +
    locationProximity * 0.1
  )
  
  return {
    lineCompatibility,
    heroSynergy,
    rankProximity,
    locationProximity,
    overallScore
  }
}

/**
 * Calculate compatibility between player lines
 * Returns a score from 0 to 1
 */
export const calculateLineCompatibility = (userLines: string[], targetLines: string[]): number => {
  // Define complementary line pairs for duo queue
  const complementaryPairs: Record<string, string[]> = {
    'gold': ['roam', 'jungle'], // ADC works well with support and jungle
    'mid': ['jungle', 'roam'],  // Mid works well with jungle and roam
    'exp': ['roam', 'jungle'],  // Exp lane works well with roam and jungle
    'jungle': ['gold', 'mid', 'exp'], // Jungle works with all lanes
    'roam': ['gold', 'mid', 'exp']    // Support works with all lanes
  }
  
  let maxCompatibility = 0
  
  for (const userLine of userLines) {
    const complementary = complementaryPairs[userLine] || []
    for (const targetLine of targetLines) {
      if (complementary.includes(targetLine)) {
        // Perfect complementary match
        maxCompatibility = Math.max(maxCompatibility, 1.0)
      } else if (userLine === targetLine) {
        // Same line - might compete for farm/position
        maxCompatibility = Math.max(maxCompatibility, 0.3)
      }
    }
  }
  
  return maxCompatibility
}

/**
 * Calculate hero synergy between players
 * Returns a score from 0 to 1
 */
export const calculateHeroSynergy = (userHeroes: string[], targetHeroes: string[]): number => {
  // Define hero synergy groups based on roles and combos
  const synergyGroups: Record<string, string[]> = {
    // Tank + ADC synergies
    'Tigreal': ['Layla', 'Miya', 'Bruno', 'Clint', 'Moskov'],
    'Franco': ['Granger', 'Bruno', 'Karrie', 'Wanwan'],
    'Johnson': ['Odette', 'Aurora', 'Kagura', 'Chang\'e'],
    'Khufra': ['Granger', 'Bruno', 'Karrie'],
    'Grock': ['Layla', 'Hanabi', 'Miya'],
    
    // Support + ADC synergies
    'Angela': ['Granger', 'Bruno', 'Karrie', 'Wanwan', 'Claude'],
    'Estes': ['Layla', 'Miya', 'Hanabi', 'Irithel'],
    'Rafaela': ['Bruno', 'Clint', 'Moskov', 'Yi Sun-shin'],
    'Diggie': ['Granger', 'Karrie', 'Wanwan'],
    'Mathilda': ['Bruno', 'Granger', 'Claude'],
    
    // Assassin + Mage synergies
    'Gusion': ['Aurora', 'Eudora', 'Kagura', 'Cyclops'],
    'Lancelot': ['Odette', 'Chang\'e', 'Lunox', 'Pharsa'],
    'Hayabusa': ['Pharsa', 'Cyclops', 'Harley', 'Lylia'],
    'Ling': ['Aurora', 'Eudora', 'Vale'],
    'Benedetta': ['Kagura', 'Lunox', 'Yve'],
    
    // Fighter + Support synergies
    'Chou': ['Angela', 'Estes', 'Rafaela'],
    'Paquito': ['Mathilda', 'Diggie', 'Angela'],
    'Yu Zhong': ['Estes', 'Angela', 'Floryn'],
    'Phoveus': ['Rafaela', 'Diggie', 'Mathilda'],
    
    // Marksman synergies (reverse mapping)
    'Granger': ['Franco', 'Angela', 'Diggie', 'Mathilda'],
    'Bruno': ['Tigreal', 'Franco', 'Angela', 'Rafaela'],
    'Karrie': ['Franco', 'Angela', 'Diggie', 'Khufra'],
    'Wanwan': ['Angela', 'Franco', 'Diggie'],
    'Claude': ['Angela', 'Mathilda', 'Tigreal'],
    
    // Mage synergies (reverse mapping)
    'Kagura': ['Johnson', 'Gusion', 'Benedetta'],
    'Lunox': ['Lancelot', 'Benedetta', 'Chang\'e'],
    'Aurora': ['Johnson', 'Gusion', 'Ling'],
    'Pharsa': ['Lancelot', 'Hayabusa', 'Ling'],
    'Cyclops': ['Gusion', 'Hayabusa', 'Harley']
  }
  
  let maxSynergy = 0
  
  for (const userHero of userHeroes) {
    const synergyHeroes = synergyGroups[userHero] || []
    for (const targetHero of targetHeroes) {
      if (synergyHeroes.includes(targetHero)) {
        // High synergy combo
        maxSynergy = Math.max(maxSynergy, 1.0)
      } else if (userHero === targetHero) {
        // Same hero - neutral (both can play it)
        maxSynergy = Math.max(maxSynergy, 0.5)
      }
    }
  }
  
  return maxSynergy
}

/**
 * Calculate rank proximity between players
 * Returns a score from 0 to 1
 */
export const calculateRankProximity = (userRank: string, targetRank: string): number => {
  const rankOrder = [
    'Warrior', 'Elite', 'Master', 'Grandmaster', 
    'Epic', 'Legend', 'Mythic', 'Mythical Glory'
  ]
  
  const userIndex = rankOrder.indexOf(userRank)
  const targetIndex = rankOrder.indexOf(targetRank)
  
  if (userIndex === -1 || targetIndex === -1) return 0.5
  
  const difference = Math.abs(userIndex - targetIndex)
  
  // Perfect match (same rank)
  if (difference === 0) return 1.0
  // One rank difference
  if (difference === 1) return 0.8
  // Two ranks difference
  if (difference === 2) return 0.6
  // Three ranks difference
  if (difference === 3) return 0.4
  // Four or more ranks difference
  return Math.max(0.1, 1 - (difference * 0.15))
}

/**
 * Calculate location proximity between players
 * Returns a score from 0 to 1
 */
export const calculateLocationProximity = (userCity: string, targetCity: string): number => {
  // Same city - perfect match
  if (userCity === targetCity) return 1.0
  
  // Different cities - could implement state-based proximity in the future
  // For now, different cities get a moderate score
  return 0.6
}

/**
 * Get compatibility description based on score
 */
export const getCompatibilityDescription = (score: number): string => {
  if (score >= 0.8) return 'Excelente compatibilidade'
  if (score >= 0.6) return 'Boa compatibilidade'
  if (score >= 0.4) return 'Compatibilidade moderada'
  if (score >= 0.2) return 'Baixa compatibilidade'
  return 'Pouca compatibilidade'
}

/**
 * Get compatibility color based on score
 */
export const getCompatibilityColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600'
  if (score >= 0.6) return 'text-blue-600'
  if (score >= 0.4) return 'text-yellow-600'
  if (score >= 0.2) return 'text-orange-600'
  return 'text-red-600'
}