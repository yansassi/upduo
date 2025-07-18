export const HEROES = [
  'Aamon', 'Akai', 'Aldous', 'Alice', 'Alpha', 'Alucard', 'Angela', 'Argus', 'Atlas', 'Aulus',
  'Aurora', 'Badang', 'Balmond', 'Bane', 'Barats', 'Baxia', 'Beatrix', 'Belerick', 'Benedetta', 'Bruno',
  'Brody', 'Carmilla', 'Cecilion', 'Chang\'e', 'Chou', 'Claude', 'Clint', 'Cyclops', 'Diggie', 'Dyrroth',
  'Edith', 'Esmeralda', 'Estes', 'Eudora', 'Fanny', 'Faramis', 'Floryn', 'Franco', 'Fredrinn', 'Freya',
  'Gatotkaca', 'Gloo', 'Gord', 'Granger', 'Grock', 'Guinevere', 'Gusion', 'Hanabi', 'Hanzo', 'Harith',
  'Harley', 'Hayabusa', 'Helcurt', 'Hilda', 'Hylos', 'Irithel', 'Jawhead', 'Johnson', 'Joy', 'Kagura',
  'Kaja', 'Karina', 'Karrie', 'Khaleed', 'Khufra', 'Kimmy', 'Lancelot', 'Lapu-Lapu', 'Layla', 'Leomord',
  'Lesley', 'Ling', 'Lolita', 'Lunox', 'Luo Yi', 'Lylia', 'Masha', 'Mathilda', 'Melissa', 'Minotaur',
  'Minsitthar', 'Miya', 'Moskov', 'Nana', 'Natalia', 'Natan', 'Odette', 'Paquito', 'Pharsa',
  'Phoveus', 'Popol and Kupa', 'Rafaela', 'Roger', 'Ruby', 'Saber', 'Selena', 'Silvanna', 'Sun', 'Terizla',
  'Thamuz', 'Tigreal', 'Uranus', 'Vale', 'Valir', 'Vexana', 'Wanwan', 'X.Borg', 'Xavier', 'Yi Sun-shin',
  'Yin', 'Yu Zhong', 'Yve', 'Zhask', 'Zilong'
]

export const RANKS = [
  'Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory'
]

export const LINES = [
  'exp', 'jungle', 'mid', 'gold', 'roam'
]

export const getHeroImageUrl = (heroName: string) => {
  // Handle specific cases with exact URLs you provided
  switch (heroName) {
    case 'Lapu-Lapu':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Lapu_lapu.webp'
    case 'Luo Yi':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Luo_Yi.webp'
    case 'Paquito':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Paquito.webp'
    case 'Popol and Kupa':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Popol_and_kupa.webp'
    case 'X.Borg':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/X_Borg.webp'
    case 'Yi Sun-shin':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Yi_Sun_shin.webp'
    case 'Yu Zhong':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/Yu_zhong.webp'
    default:
      // Default behavior for all other heroes
      return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/${heroName}.webp`
  }
}

export const getRankImageUrl = (rank: string) => {
  // Handle specific cases with exact URLs you provided
  switch (rank) {
    case 'Warrior':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/warrior.webp'
    case 'Mythic':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/mythic.webp'
    case 'Mythical Glory':
      return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/mythical_glory.webp'
    default:
      // Default behavior for all other ranks
      return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/${rank}.webp`
  }
}

export const getLineImageUrl = (line: string) => {
  // Handle specific case with exact URL you provided
  if (line === 'roam') {
    return 'https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgline/Roam.webp'
  }
  
  // Default behavior for all other lines
  return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgline/${line}.webp`
}