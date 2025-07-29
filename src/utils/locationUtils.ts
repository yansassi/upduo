import { supabase } from '../lib/supabase'

export interface State {
  abbr: string
  name: string
}

export interface City {
  id: string
  name: string
  state_abbr: string
  region: string
}

// Mapeamento de abreviações para nomes completos dos estados
const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
}

/**
 * Busca todos os estados únicos disponíveis no banco de dados
 * Agora funciona apenas para o Brasil, já que a tabela não tem country_code
 */
export const fetchStates = async (countryCode: string = 'BR'): Promise<State[]> => {
  console.log('LocationUtils: fetchStates called for country:', countryCode)
  
  // Como a tabela locations só tem dados do Brasil, ignoramos o countryCode
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('state_abbr')
      .not('state_abbr', 'is', null)
      .order('state_abbr')

    console.log('LocationUtils: fetchStates query result', { data, error })

    if (error) throw error

    // Remove duplicatas e cria array de estados
    const uniqueStates = Array.from(new Set(data?.map(item => item.state_abbr) || []))
    console.log('LocationUtils: unique states found', uniqueStates)
    
    const statesWithNames = uniqueStates.map(abbr => ({
      abbr,
      name: STATE_NAMES[abbr] || abbr
    }))
    
    console.log('LocationUtils: states with names', statesWithNames)
    return statesWithNames
  } catch (error) {
    console.error('Error fetching states:', error)
    return []
  }
}

/**
 * Busca todas as cidades de um estado específico
 * Agora funciona apenas para o Brasil
 */
export const fetchCitiesByState = async (stateAbbr: string, countryCode: string = 'BR'): Promise<City[]> => {
  console.log('LocationUtils: fetchCitiesByState called with:', { stateAbbr, countryCode })
  try {
    // Buscar TODAS as cidades do estado sem filtro de país (já que só temos Brasil)
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('state_abbr', stateAbbr)
      .order('name')

    console.log('LocationUtils: fetchCitiesByState query result', { data, error, stateAbbr })

    if (error) throw error

    const citiesCount = data?.length || 0
    console.log('LocationUtils: cities found for state', stateAbbr, ':', citiesCount, 'cities')
    
    
    
    // Log algumas cidades para verificar se estão sendo carregadas
    if (data && data.length > 0) {
      console.log('LocationUtils: First 10 cities:', data.slice(0, 10).map(c => c.name))
      console.log('LocationUtils: Last 10 cities:', data.slice(-10).map(c => c.name))
    }
    
    
    return data || []
  } catch (error) {
    console.error('LocationUtils: Error fetching cities for state', stateAbbr, ':', error)
    return []
  }
}

/**
 * Busca a abreviação do estado baseado no nome da cidade
 * Agora funciona apenas para o Brasil
 */
export const getStateAbbrByCity = async (cityName: string, countryCode: string = 'BR'): Promise<string | null> => {
  console.log('LocationUtils: getStateAbbrByCity called with:', { cityName, countryCode })
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('state_abbr')
      .eq('name', cityName)
      .maybeSingle()

    console.log('LocationUtils: getStateAbbrByCity query result', { data, error, cityName })

    if (error) throw error

    const result = data?.state_abbr || null
    console.log('LocationUtils: state abbreviation found for city', cityName, ':', result)
    return result
  } catch (error) {
    console.error('LocationUtils: Error getting state by city', cityName,  ':', error)
    return null
  }
}

/**
 * Busca uma cidade específica pelo nome
 * Agora funciona apenas para o Brasil
 */
export const getCityByName = async (cityName: string, countryCode: string = 'BR'): Promise<City | null> => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('name', cityName)
      .maybeSingle()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting city by name:', error)
    return null
  }
}

/**
 * Busca todas as localizações disponíveis no banco de dados
 * Agora funciona apenas para o Brasil
 */
export const fetchAllLocations = async (countryCode: string = 'BR'): Promise<City[]> => {
  console.log('LocationUtils: fetchAllLocations called for country:', countryCode)
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    console.log('LocationUtils: fetchAllLocations query result', { data, error })

    if (error) throw error

    const locationsCount = data?.length || 0
    console.log('LocationUtils: total locations found:', locationsCount)
    
    return data || []
  } catch (error) {
    console.error('LocationUtils: Error fetching all locations:', error)
    return []
  }
}

/**
 * Busca cidades (sem filtro de país, já que só temos Brasil)
 */
export const fetchCitiesByCountry = async (countryCode: string): Promise<City[]> => {
  console.log('LocationUtils: fetchCitiesByCountry called for country:', countryCode)
  
  // Como só temos dados do Brasil, retornamos todas as cidades
  return fetchAllLocations(countryCode)
}

/**
 * Retorna apenas o Brasil como país disponível
 */
export const fetchAvailableCountries = async (): Promise<string[]> => {
  console.log('LocationUtils: fetchAvailableCountries called')
  
  // Como só temos dados do Brasil na tabela locations
  return ['BR']
}