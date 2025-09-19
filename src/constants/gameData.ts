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
  // Padroniza o nome do herói para corresponder ao formato do arquivo.
  // Substitui espaços, apóstrofos, hífens e pontos por underscores.
  // Remove quaisquer outros caracteres que não sejam alfanuméricos ou underscores.
  let standardizedHeroName = heroName
    .replace(/[\s'-.]/g, '_') // Substitui espaços, apóstrofos, hífens e pontos por underscores
    .replace(/[^a-zA-Z0-9_]/g, ''); // Remove quaisquer outros caracteres não alfanuméricos ou underscores

  // Casos específicos que já estão padronizados ou têm exceções
  switch (heroName) {
    case 'Lapu-Lapu':
      standardizedHeroName = 'Lapu_lapu';
      break;
    case 'Luo Yi':
      standardizedHeroName = 'Luo_Yi';
      break;
    case 'Paquito':
      standardizedHeroName = 'Paquito';
      break;
    case 'Popol and Kupa':
      standardizedHeroName = 'Popol_and_kupa';
      break;
    case 'X.Borg':
      standardizedHeroName = 'X_Borg';
      break;
    case 'Yi Sun-shin':
      standardizedHeroName = 'Yi_Sun_shin';
      break;
    case 'Yu Zhong':
      standardizedHeroName = 'Yu_zhong';
      break;
    // Adicione outros casos específicos se necessário, por exemplo:
    // case 'Chang\'e':
    //   standardizedHeroName = 'Chang_e';
    //   break;
  }

  return `https://upduo.top/img/hero/${standardizedHeroName}.webp`;
}

export const getRankImageUrl = (rank: string) => {
  // Handle specific cases with exact URLs you provided
  switch (rank) {
    case 'Warrior':
      return 'https://upduo.top/img/rank/warrior.webp'
    case 'Mythic':
      return 'https://upduo.top/img/rank/mythic.webp'
    case 'Mythical Glory':
      return 'https://upduo.top/img/rank/mythical_glory.webp'
    default:
      // Default behavior for all other ranks
      return `https://upduo.top/img/rank/${rank}.webp`
  }
}

export const getLineImageUrl = (line: string) => {
  // Handle specific case with exact URL you provided
  if (line === 'roam') {
    return 'https://upduo.top/img/line/Roam.webp'
  }
  
  // Default behavior for all other lines
  return `https://upduo.top/img/line/${line}.webp`
}