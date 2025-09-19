import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Trophy, 
  Calendar, 
  Heart, 
  Users, 
  Gift, 
  Check, 
  Clock,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'

interface DailyTask {
  id: string
  name: string
  description: string
  target_value: number
  reward_diamonds: number
  task_type: string
}

interface UserTaskProgress {
  task_id: string
  current_progress: number
  is_completed: boolean
  is_collected: boolean
  completed_at: string | null
  collected_at: string | null
}

interface TaskWithProgress extends DailyTask {
  progress: UserTaskProgress | null
}

export const DailyTasks: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TaskWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [collectingTask, setCollectingTask] = useState<string | null>(null)
  const [userDiamonds, setUserDiamonds] = useState(0)

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchUserDiamonds()
    }
  }, [user])

  const fetchUserDiamonds = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('diamond_count')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserDiamonds(data.diamond_count || 0)
    } catch (error) {
      console.error('Error fetching user diamonds:', error)
    }
  }

  const fetchTasks = async () => {
    if (!user) return

    try {
      // Buscar tarefas disponíveis
      const { data: tasksData, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('is_active', true)
        .order('reward_diamonds', { ascending: false })

      if (tasksError) throw tasksError

      // Buscar progresso do usuário para hoje
      const { data: progressData, error: progressError } = await supabase
        .from('user_daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])

      if (progressError) throw progressError

      // Combinar dados
      const tasksWithProgress: TaskWithProgress[] = tasksData.map(task => ({
        ...task,
        progress: progressData.find(p => p.task_id === task.id) || null
      }))

      setTasks(tasksWithProgress)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const collectReward = async (taskId: string) => {
    if (!user || collectingTask) return

    setCollectingTask(taskId)
    try {
      const { data, error } = await supabase
        .rpc('collect_task_reward', {
          p_user_id: user.id,
          p_task_id: taskId
        })

      if (error) throw error

      if (data.success) {
        // Atualizar estado local
        setTasks(prev => prev.map(task => 
          task.id === taskId && task.progress
            ? {
                ...task,
                progress: {
                  ...task.progress,
                  is_collected: true,
                  collected_at: new Date().toISOString()
                }
              }
            : task
        ))

        setUserDiamonds(data.total_diamonds)
        
        // Mostrar feedback de sucesso
        alert(`🎉 Parabéns! Você ganhou ${data.diamonds_earned} diamantes!`)
      } else {
        alert(data.error || 'Erro ao coletar recompensa')
      }
    } catch (error) {
      console.error('Error collecting reward:', error)
      alert('Erro ao coletar recompensa. Tente novamente.')
    } finally {
      setCollectingTask(null)
    }
  }

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'login':
        return <Calendar className="w-6 h-6" />
      case 'swipes':
        return <Users className="w-6 h-6" />
      case 'matches':
        return <Heart className="w-6 h-6" />
      default:
        return <Target className="w-6 h-6" />
    }
  }

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'login':
        return 'from-blue-500 to-blue-600'
      case 'swipes':
        return 'from-purple-500 to-purple-600'
      case 'matches':
        return 'from-pink-500 to-pink-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getProgressPercentage = (task: TaskWithProgress) => {
    if (!task.progress) return 0
    return Math.min((task.progress.current_progress / task.target_value) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tarefas Diárias</h2>
            <p className="text-gray-600 text-sm">Complete tarefas e ganhe diamantes!</p>
          </div>
        </div>

        {/* Contador de diamantes */}
        <div className="inline-flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
          <span className="text-2xl">💎</span>
          <span className="text-lg font-bold text-gray-800">{userDiamonds}</span>
          <span className="text-gray-600">diamantes</span>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const progressPercentage = getProgressPercentage(task)
          const isCompleted = task.progress?.is_completed || false
          const isCollected = task.progress?.is_collected || false
          const currentProgress = task.progress?.current_progress || 0

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all ${
                isCompleted 
                  ? isCollected 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getTaskColor(task.task_type)} rounded-full flex items-center justify-center text-white`}>
                    {getTaskIcon(task.task_type)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{task.name}</h3>
                    <p className="text-gray-600 text-sm">{task.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-yellow-600 mb-1">
                    <span className="text-xl">💎</span>
                    <span className="font-bold text-lg">{task.reward_diamonds}</span>
                  </div>
                  
                  {isCompleted && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {isCollected ? 'Coletado' : 'Completado'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Progresso: {currentProgress}/{task.target_value}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getTaskColor(task.task_type)} rounded-full relative`}
                  >
                    {progressPercentage > 0 && (
                      <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="flex justify-end">
                {isCollected ? (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Recompensa Coletada</span>
                  </div>
                ) : isCompleted ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => collectReward(task.id)}
                    disabled={collectingTask === task.id}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    {collectingTask === task.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Coletando...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Coletar Diamantes</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Em Progresso</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Dicas para completar tarefas:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Login Diário:</strong> Completado automaticamente ao abrir o app</li>
              <li>• <strong>Swipes:</strong> Avalie perfis na aba "Descobrir"</li>
              <li>• <strong>Matches:</strong> Curta perfis que também te curtaram</li>
              <li>• <strong>Diamantes:</strong> Use para enviar presentes especiais</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          ⏰ As tarefas resetam todos os dias à meia-noite
        </p>
      </div>
    </div>
  )
}