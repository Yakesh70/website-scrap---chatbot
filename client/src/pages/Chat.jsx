import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ChatBot from '../components/ChatBot'
import { getLink, trainRAG } from '../services/api'

export default function Chat() {
  const { linkId } = useParams()
  const { getToken } = useAuth()
  const [link, setLink] = useState(null)
  const [isTraining, setIsTraining] = useState(false)

  useEffect(() => {
    loadLink()
  }, [linkId])

  const loadLink = async () => {
    try {
      const token = await getToken()
      const response = await getLink(linkId, token)
      setLink(response.data)
      
      if (!response.data.isEmbedded) {
        await trainModel()
      }
    } catch (error) {
      console.error('Error loading link:', error)
    }
  }

  const trainModel = async () => {
    try {
      setIsTraining(true)
      const token = await getToken()
      await trainRAG(linkId, token)
      setLink(prev => ({ ...prev, isEmbedded: true }))
    } catch (error) {
      console.error('Training error:', error)
    } finally {
      setIsTraining(false)
    }
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  const domain = new URL(link.originalUrl).hostname;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat with {domain}</h1>
              <p className="text-sm text-gray-600">{link.anchorTags?.length || 0} pages available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="max-w-4xl mx-auto p-6">
        {isTraining ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Training AI Model</h3>
            <p className="text-gray-600">Processing your website content for intelligent conversations...</p>
          </div>
        ) : (
          <ChatBot linkId={linkId} />
        )}
      </div>
    </div>
  )
}