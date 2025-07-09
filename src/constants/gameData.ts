export const HEROES = [
  'Aamon', 'Akai', 'Aldous', 'Alice', 'Alpha', 'Alucard', 'Angela', 'Argus', 'Atlas', 'Aulus',
  'Aurora', 'Badang', 'Balmond', 'Bane', 'Barats', 'Baxia', 'Beatrix', 'Belerick', 'Benedetta', 'Bruno',
  'Brody', 'Carmilla', 'Cecilion', 'Chang\'e', 'Chou', 'Claude', 'Clint', 'Cyclops', 'Diggie', 'Dyrroth',
  'Edith', 'Esmeralda', 'Estes', 'Eudora', 'Fanny', 'Faramis', 'Floryn', 'Franco', 'Fredrinn', 'Freya',
  'Gatotkaca', 'Gloo', 'Gord', 'Granger', 'Grock', 'Guinevere', 'Gusion', 'Hanabi', 'Hanzo', 'Harith',
  'Harley', 'Hayabusa', 'Helcurt', 'Hilda', 'Hylos', 'Irithel', 'Jawhead', 'Johnson', 'Joy', 'Kagura',
  'Kaja', 'Karina', 'Karrie', 'Khaleed', 'Khufra', 'Kimmy', 'Lancelot', 'Lapu-Lapu', 'Layla', 'Leomord',
  'Lesley', 'Ling', 'Lolita', 'Lunox', 'Luo Yi', 'Lylia', 'Masha', 'Mathilda', 'Melissa', 'Minotaur',
  'Minsitthar', 'Miya', 'Moskov', 'Nana', 'Natalia', 'Natan', 'Odette', 'Pacquito', 'Paquito', 'Pharsa',
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
  return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imghero/${heroName}.webp`
}

export const getRankImageUrl = (rank: string) => {
  return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgelo/${rank}.webp`
}

export const getLineImageUrl = (line: string) => {
  return `https://dleovjfidkqozocszllj.supabase.co/storage/v1/object/public/imgline/${line}.webp`
}