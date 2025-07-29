/**
 * Utility functions for country handling
 */

export interface Country {
  code: string
  name: string
  flag: string
}

// Lista de países principais para o aplicativo
export const COUNTRIES: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia', flag: '🇧🇴' },
  { code: 'EC', name: 'Equador', flag: '🇪🇨' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Holanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'CZ', name: 'República Tcheca', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungria', flag: '🇭🇺' },
  { code: 'RO', name: 'Romênia', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgária', flag: '🇧🇬' },
  { code: 'HR', name: 'Croácia', flag: '🇭🇷' },
  { code: 'RS', name: 'Sérvia', flag: '🇷🇸' },
  { code: 'RU', name: 'Rússia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ucrânia', flag: '🇺🇦' },
  { code: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: 'GR', name: 'Grécia', flag: '🇬🇷' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'MY', name: 'Malásia', flag: '🇲🇾' },
  { code: 'TH', name: 'Tailândia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnã', flag: '🇻🇳' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonésia', flag: '🇮🇩' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'PK', name: 'Paquistão', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nova Zelândia', flag: '🇳🇿' },
  { code: 'ZA', name: 'África do Sul', flag: '🇿🇦' },
  { code: 'EG', name: 'Egito', flag: '🇪🇬' },
  { code: 'MA', name: 'Marrocos', flag: '🇲🇦' },
  { code: 'NG', name: 'Nigéria', flag: '🇳🇬' },
  { code: 'KE', name: 'Quênia', flag: '🇰🇪' },
  { code: 'GH', name: 'Gana', flag: '🇬🇭' },
  { code: 'ET', name: 'Etiópia', flag: '🇪🇹' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'AE', name: 'Emirados Árabes Unidos', flag: '🇦🇪' },
  { code: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: 'QA', name: 'Catar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrein', flag: '🇧🇭' },
  { code: 'OM', name: 'Omã', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordânia', flag: '🇯🇴' },
  { code: 'LB', name: 'Líbano', flag: '🇱🇧' },
  { code: 'IQ', name: 'Iraque', flag: '🇮🇶' },
  { code: 'IR', name: 'Irã', flag: '🇮🇷' }
]

/**
 * Get country by code
 */
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code)
}

/**
 * Get country name by code
 */
export const getCountryName = (code: string): string => {
  const country = getCountryByCode(code)
  return country ? country.name : code
}

/**
 * Get country flag by code
 */
export const getCountryFlag = (code: string): string => {
  const country = getCountryByCode(code)
  return country ? country.flag : '🌍'
}

/**
 * Search countries by name
 */
export const searchCountries = (query: string): Country[] => {
  if (!query.trim()) return COUNTRIES
  
  const lowerQuery = query.toLowerCase()
  return COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  )
}