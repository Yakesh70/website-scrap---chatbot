import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import { uploadLink } from '../services/api'

export default function ExternalChat() {
  const [searchParams] = useSearchParams()
  const [linkId, setLinkId] = useState(null)
  const [loading, setLoading] = useState(true)
  const url = searchParams.get('url')

  useEffect(() => {
    if (url) {
      handleUrlUpload()
    }
  }, [url])

  const handleUrlUpload = async () => {
    try {
      // Use test token for external access
      const response = await uploadLink(url, 'test-token')
      setLinkId(response.data._id)
    } catch (error) {
      console.error('Error uploading URL:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyzing website...</p>
        </div>
      </div>
    )
  }

  if (!linkId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to analyze website</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Chat about {url}</h1>
        <p className="text-gray-600 text-sm">Ask questions about this website's content</p>
      </div>
      <ChatBot />
    </div>
  )
}