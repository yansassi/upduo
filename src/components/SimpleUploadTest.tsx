import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const SimpleUploadTest: React.FC = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('Pronto para testar')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const createTestImage = (): File => {
    // Create a simple 1x1 pixel red image
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(0, 0, 100, 100)
    
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], 'test-image.png', { type: 'image/png' }))
      }, 'image/png')
    })
  }

  const testUpload = async () => {
    if (!user) {
      setStatus('Usuário não autenticado')
      return
    }

    try {
      setStatus('Criando imagem de teste...')
      const testFile = await createTestImage()
      
      setStatus('Fazendo upload...')
      const fileName = `${user.id}/test-${Date.now()}.png`
      
      console.log('SimpleUploadTest: Uploading to:', fileName)
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, testFile, { upsert: true })
      
      if (error) {
        console.error('SimpleUploadTest: Upload error:', error)
        setStatus(`Erro no upload: ${error.message}`)
        return
      }
      
      console.log('SimpleUploadTest: Upload success:', data)
      setStatus('Upload realizado com sucesso!')
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      console.log('SimpleUploadTest: Public URL:', publicUrl)
      setImageUrl(publicUrl)
      setStatus(`URL gerada: ${publicUrl}`)
      
    } catch (error) {
      console.error('SimpleUploadTest: Error:', error)
      setStatus(`Erro: ${error}`)
    }
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-bold mb-2">Teste Simples de Upload</h4>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      <button
        onClick={testUpload}
        disabled={!user}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Testar Upload
      </button>
      
      {imageUrl && (
        <div className="mt-4">
          <div className="text-sm mb-2">Testando carregamento da imagem:</div>
          <img
            src={imageUrl}
            alt="Teste"
            className="w-20 h-20 border rounded"
            onLoad={() => console.log('SimpleUploadTest: Image loaded successfully!')}
            onError={(e) => {
              console.error('SimpleUploadTest: Image failed to load')
              console.error('Error details:', e)
            }}
          />
        </div>
      )}
    </div>
  )
}