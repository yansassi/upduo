import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface DebugInfo {
  userId: string | null
  profilesCount: number
  messagesCount: number
  matchesCount: number
  swipesCount: number
  storageTest: {
    bucketsCount: number
    avatarsBucketExists: boolean
    avatarsBucketPublic: boolean
  }
}

export const MessagesDebugPanel: React.FC = () => {
  const { user } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('MessagesDebugPanel: Running diagnostics...')

      // Test database access
      const [profilesResult, messagesResult, matchesResult, swipesResult, bucketsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('swipes').select('id', { count: 'exact', head: true }),
        supabase.storage.listBuckets()
      ])

      console.log('MessagesDebugPanel: Database results:', {
        profiles: profilesResult,
        messages: messagesResult,
        matches: matchesResult,
        swipes: swipesResult,
        buckets: bucketsResult
      })

      const avatarsBucket = bucketsResult.data?.find(b => b.id === 'avatars')

      const info: DebugInfo = {
        userId: user.id,
        profilesCount: profilesResult.count || 0,
        messagesCount: messagesResult.count || 0,
        matchesCount: matchesResult.count || 0,
        swipesCount: swipesResult.count || 0,
        storageTest: {
          bucketsCount: bucketsResult.data?.length || 0,
          avatarsBucketExists: !!avatarsBucket,
          avatarsBucketPublic: avatarsBucket?.public || false
        }
      }

      console.log('MessagesDebugPanel: Debug info compiled:', info)
      setDebugInfo(info)

    } catch (error) {
      console.error('MessagesDebugPanel: Diagnostics failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      runDiagnostics()
    }
  }, [user])

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-bold text-red-800 mb-2">Debug Panel</h3>
        <p className="text-red-600">Usuário não autenticado</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-blue-800">Debug Panel</h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Executar Testes'}
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>User ID:</strong>
              <div className="font-mono text-xs bg-white p-1 rounded break-all">
                {debugInfo.userId}
              </div>
            </div>
            
            <div>
              <strong>Database Counts:</strong>
              <div className="text-xs space-y-1">
                <div>Profiles: {debugInfo.profilesCount}</div>
                <div>Messages: {debugInfo.messagesCount}</div>
                <div>Matches: {debugInfo.matchesCount}</div>
                <div>Swipes: {debugInfo.swipesCount}</div>
              </div>
            </div>
          </div>

          <div>
            <strong>Storage Status:</strong>
            <div className="text-xs space-y-1">
              <div>Buckets: {debugInfo.storageTest.bucketsCount}</div>
              <div>Avatars bucket: {debugInfo.storageTest.avatarsBucketExists ? '✓' : '✗'}</div>
              <div>Public access: {debugInfo.storageTest.avatarsBucketPublic ? '✓' : '✗'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}