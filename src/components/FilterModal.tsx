import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Filter, MapPin, Trophy, Sword, Target, Calendar, Crown, RotateCcw } from 'lucide-react'
import { HEROES, RANKS, LINES, getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { fetchStates, fetchCitiesByState, State, City } from '../utils/locationUtils'

export interface FilterCriteria {
  minAge: number
  maxAge: number
  selectedRanks: string[]
  selectedCities: string[]
  selectedStates: string[]
  selectedLines: string[]
  selectedHeroes: string[]
  maxDistance: number // em km, para futuro uso com geolocalização
  compatibilityMode: boolean // priorizar compatibilidade de linha/herói
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterCriteria
  onFiltersChange: (filters: FilterCriteria) => void
  onApplyFilters: () => void
  isPremium: boolean
}

const DEFAULT_FILTERS: FilterCriteria = {
  minAge: 18,
  maxAge: 35,
  selectedRanks: [],
  selectedCities: [],
  selectedStates: [],
  selectedLines: [],
  selectedHeroes: [],
  maxDistance: 100,
  compatibilityMode: true
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  isPremium
}) => {
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [heroSearch, setHeroSearch] = useState('')
  const [showHeroGrid, setShowHeroGrid] = useState(false)
  const [showLineGrid, setShowLineGrid] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadStates()
    }
  }, [isOpen])

  useEffect(() => {
    if (filters.selectedStates.length > 0) {
      loadCitiesForStates()
    } else {
      setCities([])
    }
  }, [filters.selectedStates])

  const loadStates = async () => {
    const statesData = await fetchStates()
    setStates(statesData)
  }

  const loadCitiesForStates = async () => {
    if (filters.selectedStates.length === 0) return
    
    setLoadingCities(true)
    try {
      const allCities: City[] = []
      for (const stateAbbr of filters.selectedStates) {
        const stateCities = await fetchCitiesByState(stateAbbr)
        allCities.push(...stateCities)
      }
      setCities(allCities)
    } catch (error) {
      console.error('Error loading cities:', error)
    } finally {
      setLoadingCities(false)
    }
  }

  const updateFilters = (updates: Partial<FilterCriteria>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const resetFilters = () => {
    onFiltersChange(DEFAULT_FILTERS)
  }

  const filteredHeroes = HEROES.filter(hero =>
    hero.toLowerCase().includes(heroSearch.toLowerCase())
  )

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.minAge !== DEFAULT_FILTERS.minAge || filters.maxAge !== DEFAULT_FILTERS.maxAge) count++
    if (filters.selectedRanks.length > 0) count++
    if (filters.selectedCities.length > 0) count++
    if (filters.selectedStates.length > 0) count++
    if (filters.selectedLines.length > 0) count++
    if (filters.selectedHeroes.length > 0) count++
    if (!filters.compatibilityMode) count++
    return count
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Filtros Avançados</h3>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Recurso Premium</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {getActiveFiltersCount()} filtros ativos
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={resetFilters}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Resetar filtros"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {!isPremium ? (
              /* Premium Upsell */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">Filtros Avançados</h4>
                <p className="text-gray-600 mb-6">
                  Encontre exatamente o tipo de duo que você procura com nossos filtros avançados.
                  Disponível apenas para usuários Premium!
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Filtrar por idade</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>Filtrar por elo</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span>Filtrar por localização</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Sword className="w-4 h-4 text-red-500" />
                    <span>Compatibilidade de heróis</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const whatsappNumber = '5545988349638'
                    const message = encodeURIComponent('Olá! Quero ser premium do UpDuo para usar os filtros avançados. Pode me ajudar?')
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Crown className="w-5 h-5" />
                  <span>Assinar Premium - R$ 25</span>
                </button>
              </div>
            ) : (
              /* Premium Filters */
              <div className="p-6 space-y-8">
                {/* Compatibility Mode */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Modo de Compatibilidade</h4>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.compatibilityMode}
                      onChange={(e) => updateFilters({ compatibilityMode: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-gray-800 font-medium">Priorizar compatibilidade</span>
                      <p className="text-sm text-gray-600">
                        Mostra primeiro jogadores com heróis e linhas complementares
                      </p>
                    </div>
                  </label>
                </div>

                {/* Age Range */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Faixa Etária
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Idade mínima</label>
                      <input
                        type="number"
                        value={filters.minAge}
                        onChange={(e) => updateFilters({ minAge: parseInt(e.target.value) || 18 })}
                        min="18"
                        max="99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Idade máxima</label>
                      <input
                        type="number"
                        value={filters.maxAge}
                        onChange={(e) => updateFilters({ maxAge: parseInt(e.target.value) || 35 })}
                        min="18"
                        max="99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Ranks */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                    Elos ({filters.selectedRanks.length} selecionados)
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {RANKS.map((rank) => (
                      <motion.button
                        key={rank}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateFilters({ 
                          selectedRanks: toggleArrayItem(filters.selectedRanks, rank) 
                        })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          filters.selectedRanks.includes(rank)
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={getRankImageUrl(rank)}
                          alt={rank}
                          className="w-8 h-8 mx-auto mb-1"
                        />
                        <p className="text-xs font-medium text-gray-800 truncate">{rank}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* States */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Estados ({filters.selectedStates.length} selecionados)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {states.map((state) => (
                      <label key={state.abbr} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.selectedStates.includes(state.abbr)}
                          onChange={() => updateFilters({ 
                            selectedStates: toggleArrayItem(filters.selectedStates, state.abbr) 
                          })}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{state.abbr}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cities */}
                {filters.selectedStates.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Cidades ({filters.selectedCities.length} selecionadas)
                    </h4>
                    {loadingCities ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Carregando cidades...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {cities.map((city) => (
                          <label key={city.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.selectedCities.includes(city.name)}
                              onChange={() => updateFilters({ 
                                selectedCities: toggleArrayItem(filters.selectedCities, city.name) 
                              })}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 truncate">{city.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lines */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Linhas ({filters.selectedLines.length} selecionadas)
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    {LINES.map((line) => (
                      <motion.button
                        key={line}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateFilters({ 
                          selectedLines: toggleArrayItem(filters.selectedLines, line) 
                        })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          filters.selectedLines.includes(line)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={getLineImageUrl(line)}
                          alt={line}
                          className="w-10 h-10 mx-auto mb-1 rounded-lg"
                        />
                        <p className="text-xs font-medium text-gray-800 capitalize">{line}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Heroes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Sword className="w-5 h-5 mr-2 text-red-600" />
                    Heróis ({filters.selectedHeroes.length} selecionados)
                  </h4>
                  
                  {/* Hero Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar heróis..."
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Selected Heroes */}
                  {filters.selectedHeroes.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Heróis Selecionados:</h5>
                      <div className="flex flex-wrap gap-2">
                        {filters.selectedHeroes.map((hero) => (
                          <motion.div
                            key={hero}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                          >
                            <img
                              src={getHeroImageUrl(hero)}
                              alt={hero}
                              className="w-4 h-4 rounded-full"
                            />
                            <span>{hero}</span>
                            <button
                              type="button"
                              onClick={() => updateFilters({ 
                                selectedHeroes: filters.selectedHeroes.filter(h => h !== hero) 
                              })}
                              className="text-red-600 hover:text-red-800 ml-1"
                            >
                              ×
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Heroes Grid */}
                  <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {filteredHeroes.map((hero) => (
                      <motion.button
                        key={hero}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateFilters({ 
                          selectedHeroes: toggleArrayItem(filters.selectedHeroes, hero) 
                        })}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          filters.selectedHeroes.includes(hero)
                            ? 'border-red-500 bg-red-50 opacity-75'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={getHeroImageUrl(hero)}
                          alt={hero}
                          className="w-8 h-8 mx-auto mb-1 rounded-lg"
                        />
                        <p className="text-xs font-medium text-gray-800 truncate">{hero}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {isPremium && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onApplyFilters()
                    onClose()
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Aplicar Filtros</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}