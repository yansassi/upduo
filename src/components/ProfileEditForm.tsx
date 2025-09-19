import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { HEROES, RANKS, LINES, getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { fetchStates, fetchCitiesByState, getStateAbbrByCity, State, City } from '../utils/locationUtils'
import { COUNTRIES, getCountryByCode } from '../utils/countryUtils'
import { User, MapPin, Calendar, Trophy, Sword, Target, X, Save, Camera, Upload, Settings } from 'lucide-react'

interface Profile {
  id: string
  name: string
  age: number
  country: string
  city: string
  current_rank: string
  favorite_heroes: string[]
  favorite_lines: string[]
  bio: string
  avatar_url: string | null
  is_premium: boolean
  diamond_count: number
  min_age_filter: number
  max_age_filter: number
}

interface ProfileEditFormProps {
  initialProfile: Profile
  onSave: () => void
  onCancel: () => void
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  initialProfile, 
  onSave, 
  onCancel 
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedStateAbbr, setSelectedStateAbbr] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [heroSearch, setHeroSearch] = useState('')
  const [lineSearch, setLineSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [profile, setProfile] = useState({
    name: initialProfile.name,
    age: initialProfile.age.toString(),
    country: initialProfile.country || 'BR',
    city: initialProfile.city,
    state: '',
    current_rank: initialProfile.current_rank,
    favorite_heroes: [...initialProfile.favorite_heroes],
    favorite_lines: [...initialProfile.favorite_lines],
    bio: initialProfile.bio || ''
  })

  // Filter heroes based on search
  const filteredHeroes = HEROES.filter(hero =>
    hero.toLowerCase().includes(heroSearch.toLowerCase())
  )

  // Filter lines based on search  
  const filteredLines = LINES.filter(line =>
    line.toLowerCase().includes(lineSearch.toLowerCase())
  )

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 50) // Limit to 50 results for performance

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.')
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.')
        return
      }
      
      setAvatarFile(file)
      
      // Criar URL de preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Permitir apenas letras (maiúsculas e minúsculas), espaços e acentos
    const filteredValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
    // Limitar a 30 caracteres (suficiente para nome e sobrenome)
    const limitedValue = filteredValue.slice(0, 30)
    setProfile({...profile, name: limitedValue})
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    // Fechar dropdown quando clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    console.log('ProfileEditForm: useEffect for selectedStateAbbr triggered', { selectedStateAbbr })
    if (selectedStateAbbr) {
      loadCitiesByState(selectedStateAbbr)
    } else {
      console.log('ProfileEditForm: No state selected, clearing cities')
      setCities([])
      setCitySearch('')
      setShowCityDropdown(false)
    }
  }, [selectedStateAbbr])

  const loadInitialData = async () => {
    console.log('ProfileEditForm: loadInitialData called')
    
    // Definir preview da imagem atual se existir
    if (initialProfile.avatar_url) {
      setAvatarPreviewUrl(initialProfile.avatar_url)
    }
    
    // Definir busca inicial da cidade
    setCitySearch(initialProfile.city)
    
    // Carrega os estados
    const statesData = await fetchStates(initialProfile.country)
    console.log('ProfileEditForm: states loaded', statesData)
    setStates(statesData)

    // Se há uma cidade inicial, busca o estado correspondente
    if (initialProfile.city) {
      console.log('ProfileEditForm: Initial city found, searching for state:', initialProfile.city)
      const stateAbbr = await getStateAbbrByCity(initialProfile.city, initialProfile.country)
      console.log('ProfileEditForm: State abbreviation found for initial city:', stateAbbr)
      if (stateAbbr) {
        setSelectedStateAbbr(stateAbbr)
        const selectedState = statesData.find(s => s.abbr === stateAbbr)
        console.log('ProfileEditForm: Selected state object:', selectedState)
        setProfile(prev => ({ 
          ...prev, 
          state: selectedState?.name || ''
        }))
      }
    } else {
      console.log('ProfileEditForm: No initial city found')
    }
  }

  const loadCitiesByState = async (stateAbbr: string) => {
    console.log('ProfileEditForm: Loading cities for state:', stateAbbr)
    console.log('ProfileEditForm: loadCitiesByState called with:', stateAbbr)
    setLoadingCities(true)
    try {
      const citiesData = await fetchCitiesByState(stateAbbr, profile.country)
      console.log('ProfileEditForm: Cities loaded:', citiesData.length, 'cities for state', stateAbbr)
      setCities(citiesData)
      
      // Log algumas cidades para debug
      if (citiesData.length > 0) {
        console.log('ProfileEditForm: First 10 cities:', citiesData.slice(0, 10).map(c => c.name))
      }
    } catch (error) {
      console.error('ProfileEditForm: Error loading cities:', error)
      setCities([])
    }
    setLoadingCities(false)
  }

  const handleStateChange = (stateAbbr: string) => {
    console.log('ProfileEditForm: handleStateChange called with:', stateAbbr)
    setSelectedStateAbbr(stateAbbr)
    const selectedState = states.find(s => s.abbr === stateAbbr)
    console.log('ProfileEditForm: Selected state object in handleStateChange:', selectedState)
    setProfile(prev => ({ 
      ...prev, 
      state: selectedState?.name || '',
      city: '' // Reset city when state changes
    }))
    console.log('ProfileEditForm: Profile updated after state change')
  }

  const handleCityChange = (cityName: string) => {
    console.log('ProfileEditForm: handleCityChange called with:', cityName)
    setProfile(prev => ({ ...prev, city: cityName }))
    setCitySearch(cityName)
    setShowCityDropdown(false)
  }

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCitySearch(value)
    setProfile(prev => ({ ...prev, city: value }))
    setShowCityDropdown(value.length > 0 && filteredCities.length > 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    console.log('ProfileEditForm: Attempting to update profile', {
      userId: user.id,
      profile: {
        ...profile,
        age: parseInt(profile.age)
      }
    })

    setLoading(true)
    try {
      let avatar_url = initialProfile.avatar_url // Manter URL atual por padrão
      
      // Upload da nova foto de perfil se selecionada
      if (avatarFile) {
        console.log('ProfileEditForm: Uploading new avatar file')
        console.log('ProfileEditForm: File details:', {
          name: avatarFile.name,
          size: avatarFile.size,
          type: avatarFile.type
        })
        
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/avatar.${fileExt}`
        
        console.log('ProfileEditForm: Upload path:', fileName)
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            upsert: true
          })
        
        if (uploadError) {
          console.error('ProfileEditForm: Error uploading avatar', uploadError)
          throw uploadError
        }
        
        console.log('ProfileEditForm: Upload successful:', uploadData)
        
        // Obter URL pública da nova imagem
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        
        avatar_url = publicUrl
        console.log('ProfileEditForm: New avatar uploaded successfully', avatar_url)
        
        // Validate URL format
        console.log('ProfileEditForm: URL validation:', {
          isValidUrl: avatar_url.startsWith('http'),
          containsSupabase: avatar_url.includes('supabase'),
          containsAvatars: avatar_url.includes('avatars'),
          fileName: fileName,
          fullUrl: avatar_url
        })
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          age: parseInt(profile.age),
          country: profile.country,
          city: profile.city,
          current_rank: profile.current_rank,
          favorite_heroes: profile.favorite_heroes,
          favorite_lines: profile.favorite_lines,
          bio: profile.bio,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      console.log('ProfileEditForm: Profile update result', { data, error })
      
      if (error) {
        console.error('ProfileEditForm: Error updating profile', error)
        throw error
      }
      
      console.log('ProfileEditForm: Profile updated successfully')
      onSave()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const selectHero = (hero: string) => {
    const current = profile.favorite_heroes
    if (current.includes(hero)) {
      setProfile({
        ...profile,
        favorite_heroes: current.filter(h => h !== hero)
      })
    } else if (current.length < 3) {
      setProfile({
        ...profile,
        favorite_heroes: [...current, hero]
      })
    }
  }

  const selectLine = (line: string) => {
    const current = profile.favorite_lines
    if (current.includes(line)) {
      setProfile({
        ...profile,
        favorite_lines: current.filter(l => l !== line)
      })
    } else if (current.length < 3) {
      setProfile({
        ...profile,
        favorite_lines: [...current, line]
      })
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-2">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold text-white">Editar Perfil</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
          <p className="text-blue-200">Atualize suas informações para melhorar seus matches</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Passo {step + 1} de 5</span>
              <span className="text-sm text-gray-500">{Math.round(((step + 1) / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Camera className="w-6 h-6 mr-2 text-blue-600" />
                  Foto de Perfil
                </h2>
                
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {avatarPreviewUrl ? (
                        <img
                          src={avatarPreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {initialProfile.avatar_url ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
                  </p>
                  
                  <label className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{avatarFile ? 'Trocar Foto' : 'Escolher Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  
                  {avatarFile && (
                    <div className="text-sm text-green-600 mt-2">
                      ✓ Nova foto selecionada: {avatarFile.name}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF • Tamanho máximo: 5MB
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Informações Básicas
                </h2>
                
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={handleNameChange}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    maxLength={30}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {profile.name.length}/30 caracteres
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      value={profile.country}
                      onChange={(e) => setProfile({...profile, country: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({...profile, age: e.target.value})}
                      placeholder="Idade"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="18"
                      max="99"
                    />
                  </div>
                </div>

                {/* Campos de Estado e Cidade - apenas para Brasil */}
                {profile.country === 'BR' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                      <select
                        value={selectedStateAbbr}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">Selecione o estado</option>
                        {states.map((state) => (
                          <option key={state.abbr} value={state.abbr}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={citySearch}
                        onChange={handleCitySearchChange}
                        onFocus={() => setShowCityDropdown(citySearch.length > 0 && filteredCities.length > 0)}
                        placeholder={loadingCities ? 'Carregando cidades...' : 'Digite o nome da sua cidade'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required
                        disabled={!selectedStateAbbr || loadingCities}
                      />
                      
                      {/* Dropdown de cidades filtradas */}
                      {showCityDropdown && filteredCities.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => handleCityChange(city.name)}
                              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              {city.name}
                            </button>
                          ))}
                          {cities.length > 50 && (
                            <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                              {cities.length - 50} cidades adicionais disponíveis. Continue digitando para refinar a busca.
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cities.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {cities.length} cidades disponíveis
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mensagem de ajuda para busca de cidade - apenas para Brasil */}
                {profile.country === 'BR' && selectedStateAbbr && !loadingCities && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>Dica:</strong> Digite o nome da sua cidade para encontrá-la rapidamente. 
                    {cities.length > 0 && ` ${cities.length} cidades disponíveis para ${profile.state}.`}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      !profile.name || 
                      !profile.age || 
                      parseInt(profile.age) < 18 || 
                      parseInt(profile.age) > 99 ||
                      (profile.country === 'BR' && (!profile.city || !selectedStateAbbr))
                    }
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
                  Seu Elo Atual
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {RANKS.map((rank) => (
                    <motion.button
                      key={rank}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setProfile({...profile, current_rank: rank})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profile.current_rank === rank
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={getRankImageUrl(rank)}
                        alt={rank}
                        className="w-12 h-12 mx-auto mb-2"
                      />
                      <p className="text-sm font-medium text-gray-800">{rank}</p>
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!profile.current_rank}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Sword className="w-6 h-6 mr-2 text-red-600" />
                  Seus 3 Heróis Favoritos
                </h2>

                <p className="text-gray-600 mb-4">
                  Selecionados: {profile.favorite_heroes.length}/3
                </p>

                {/* Search Bar */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Digite o nome do herói..."
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Selected Heroes */}
                {profile.favorite_heroes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Heróis Selecionados:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.favorite_heroes.map((hero) => (
                        <motion.div
                          key={hero}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm"
                        >
                          <img
                            src={getHeroImageUrl(hero)}
                            alt={hero}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{hero}</span>
                          <button
                            type="button"
                            onClick={() => selectHero(hero)}
                            className="text-blue-600 hover:text-blue-800 ml-1"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Heroes Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-60 sm:max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 touch-pan-y">
                  {filteredHeroes.map((hero) => (
                    <motion.button
                      key={hero}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectHero(hero)}
                      disabled={profile.favorite_heroes.includes(hero) || (profile.favorite_heroes.length >= 3 && !profile.favorite_heroes.includes(hero))}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        profile.favorite_heroes.includes(hero)
                          ? 'border-blue-500 bg-blue-50 opacity-75'
                          : profile.favorite_heroes.length >= 3
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <img
                        src={getHeroImageUrl(hero)}
                        alt={hero}
                        className="w-12 h-12 mx-auto mb-1 rounded-lg"
                      />
                      <p className="text-xs font-medium text-gray-800 truncate leading-tight">{hero}</p>
                    </motion.button>
                  ))}
                </div>

                {filteredHeroes.length === 0 && heroSearch && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum herói encontrado para "{heroSearch}"</p>
                  </div>
                )}

                {profile.favorite_heroes.length >= 3 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      ✓ Você selecionou 3 heróis! Clique em um herói selecionado para removê-lo.
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={profile.favorite_heroes.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-green-600" />
                  Suas 3 Linhas Favoritas
                </h2>

                <p className="text-gray-600 mb-4">
                  Selecionadas: {profile.favorite_lines.length}/3
                </p>

                {/* Search Bar */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Digite o nome da linha..."
                    value={lineSearch}
                    onChange={(e) => setLineSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Selected Lines */}
                {profile.favorite_lines.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Linhas Selecionadas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.favorite_lines.map((line) => (
                        <motion.div
                          key={line}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm"
                        >
                          <img
                            src={getLineImageUrl(line)}
                            alt={line}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="capitalize">{line}</span>
                          <button
                            type="button"
                            onClick={() => selectLine(line)}
                            className="text-green-600 hover:text-green-800 ml-1"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lines Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
                  {filteredLines.map((line) => (
                    <motion.button
                      key={line}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectLine(line)}
                      disabled={profile.favorite_lines.includes(line) || (profile.favorite_lines.length >= 3 && !profile.favorite_lines.includes(line))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profile.favorite_lines.includes(line)
                          ? 'border-green-500 bg-green-50 opacity-75'
                          : profile.favorite_lines.length >= 3
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      <img
                        src={getLineImageUrl(line)}
                        alt={line}
                        className="w-16 h-16 mx-auto rounded-xl mb-2 bg-transparent"
                      />
                      <p className="text-sm font-medium text-gray-800 capitalize">{line}</p>
                    </motion.button>
                  ))}
                </div>

                {filteredLines.length === 0 && lineSearch && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma linha encontrada para "{lineSearch}"</p>
                  </div>
                )}

                {profile.favorite_lines.length >= 3 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                      ✓ Você selecionou 3 linhas! Clique em uma linha selecionada para removê-la.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conte um pouco sobre você (opcional)
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Ex: Sou main adc, procuro um suporte para subir elo juntos..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                  >
                    Anterior
                  </button>

                  <button
                    type="submit"
                    disabled={loading || profile.favorite_lines.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}