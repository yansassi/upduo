import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const ImageTest: React.FC = () => {
  const { user } = useAuth()
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testImageUpload = async (file: File) => {
    if (!user) return

    setUploading(true)
    setError(null)

    try {
      console.log('ImageTest: Starting upload test with file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const fileExt = file.name.split('.').pop()
      const fileName = `test-${user.id}-${Date.now()}.${fileExt}`
      
      console.log('ImageTest: Uploading to path:', fileName)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        })

      console.log('ImageTest: Upload result:', { uploadData, uploadError })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log('ImageTest: Generated public URL:', publicUrl)
      setTestImageUrl(publicUrl)

      // Test if URL is accessible
      const testResponse = await fetch(publicUrl, { method: 'HEAD' })
      console.log('ImageTest: URL accessibility test:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries())
      })

    } catch (error) {
      console.error('ImageTest: Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      testImageUpload(file)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Teste de Upload de Imagem</h3>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {uploading && (
        <div className="text-blue-600 mb-4">Fazendo upload...</div>
      )}

      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">
          Erro: {error}
        </div>
      )}

      {testImageUrl && (
        <div className="space-y-4">
          <div>
            <strong>URL gerada:</strong>
            <div className="text-xs text-gray-600 break-all bg-gray-100 p-2 rounded">
              {testImageUrl}
            </div>
          </div>
          
          <div>
            <strong>Teste de visualização:</strong>
            <div className="mt-2 border rounded p-4">
              <img
                src={testImageUrl}
                alt="Teste"
                className="w-32 h-32 object-cover rounded mx-auto"
                onLoad={() => console.log('ImageTest: Image loaded successfully!')}
                onError={(e) => {
                  console.error('ImageTest: Image failed to load')
                  console.error('Error event:', e)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}