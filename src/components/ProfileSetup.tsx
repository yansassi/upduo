import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { HEROES, RANKS, LINES, getHeroImageUrl, getRankImageUrl, getLineImageUrl } from '../constants/gameData'
import { User, MapPin, Calendar, Trophy, Sword, Target } from 'lucide-react'

export const ProfileSetup: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    city: '',
    current_rank: '',
    favorite_heroes: [] as string[],
    favorite_lines: [] as string[],
    bio: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    console.log('ProfileSetup: Attempting to create profile', {
      userId: user.id,
      email: user.email,
      profile: {
        ...profile,
        age: parseInt(profile.age)
      }
    })

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          name: profile.name,
          age: parseInt(profile.age),
          city: profile.city,
          current_rank: profile.current_rank,
          favorite_heroes: profile.favorite_heroes,
          favorite_lines: profile.favorite_lines,
          bio: profile.bio
        }, {
          onConflict: 'id'
        })
        .select()

      console.log('ProfileSetup: Profile creation result', { data, error })
      
      if (error) {
        console.error('ProfileSetup: Error creating profile', error)
        throw error
      }
      
      console.log('ProfileSetup: Profile created successfully, reloading page')
      // Force a page reload to refresh the app state
      window.location.reload()
    } catch (error) {
      console.error('Error creating profile:', error)
      // Show user-friendly error message
      alert('Erro ao criar perfil. Tente novamente.')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">Configure seu Perfil</h1>
          <p className="text-blue-200">Vamos configurar seu perfil para encontrar o duo perfeito</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">Passo {step} de 4</span>
              <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      placeholder="Cidade"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!profile.name || !profile.age || !profile.city || parseInt(profile.age) < 18 || parseInt(profile.age) > 99}
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

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
                  {HEROES.map((hero) => (
                    <motion.button
                      key={hero}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectHero(hero)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        profile.favorite_heroes.includes(hero)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={getHeroImageUrl(hero)}
                        alt={hero}
                        className="w-16 h-16 mx-auto mb-1 rounded-lg"
                      />
                      <p className="text-xs font-medium text-gray-800 truncate">{hero}</p>
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {LINES.map((line) => (
                    <motion.button
                      key={line}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectLine(line)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        profile.favorite_lines.includes(line)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={getLineImageUrl(line)}
                        alt={line}
                        className="w-16 h-16 mx-auto mb-2 rounded-lg"
                      />
                      <p className="text-sm font-medium text-gray-800 capitalize">{line}</p>
                    </motion.button>
                  ))}
                </div>

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
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Perfil'}
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