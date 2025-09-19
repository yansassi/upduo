import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const StorageTest: React.FC = () => {
  const [buckets, setBuckets] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testStorage()
  }, [])

  const testStorage = async () => {
    try {
      console.log('StorageTest: Testing storage access...')
      
      // Test bucket listing
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
      
      console.log('StorageTest: Buckets result:', { bucketsData, bucketsError })
      
      if (bucketsError) {
        throw bucketsError
      }
      
      setBuckets(bucketsData || [])
      
      // Test avatars bucket specifically
      const avatarsBucket = bucketsData?.find(b => b.id === 'avatars')
      console.log('StorageTest: Avatars bucket found:', avatarsBucket)
      
      if (avatarsBucket) {
        // Test listing files in avatars bucket
        const { data: files, error: filesError } = await supabase.storage
          .from('avatars')
          .list('', { limit: 10 })
        
        console.log('StorageTest: Files in avatars bucket:', { files, filesError })
      }
      
    } catch (err) {
      console.error('StorageTest: Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Testando storage...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Storage Test Results</h3>
      
      {error && (
        <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">
          Erro: {error}
        </div>
      )}
      
      <div className="space-y-2">
        <div>
          <strong>Buckets encontrados:</strong> {buckets.length}
        </div>
        
        {buckets.map(bucket => (
          <div key={bucket.id} className="text-sm bg-white p-2 rounded">
            <strong>{bucket.id}</strong> - {bucket.name} 
            {bucket.public ? ' (público)' : ' (privado)'}
          </div>
        ))}
        
        {buckets.length === 0 && !error && (
          <div className="text-yellow-600">Nenhum bucket encontrado</div>
        )}
      </div>
    </div>
  )
}