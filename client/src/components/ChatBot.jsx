import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useParams } from 'react-router-dom'
import { queryRAG } from '../services/api'

export default function ChatBot({ linkId: propLinkId }) {
  const { linkId: paramLinkId } = useParams()
  const linkId = propLinkId || paramLinkId
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'bot',
        content: 'Hello! I\'m ready to answer questions about the website content. What would you like to know?'
      }])
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const token = await getToken()
      const response = await queryRAG(input, linkId, token)
      const botMessage = { role: 'bot', content: response.data.answer }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Query error:', error)
      console.error('Error details:', error.response?.data || error.message)
      
      let errorMsg = 'Sorry, I encountered an error processing your question. Please try again.'
      
      if (error.response?.status === 404) {
        errorMsg = 'Please make sure the website has been trained first by clicking "Train RAG Model".'
      } else if (error.response?.status === 401) {
        errorMsg = 'Authentication error. Please refresh the page and try again.'
      } else if (error.response?.data?.error?.includes('429') || error.response?.data?.error?.includes('rate limit')) {
        errorMsg = 'API rate limit reached. Please wait a moment and try again.'
      } else if (error.response?.data?.error) {
        errorMsg = `Error: ${error.response.data.error}`
      }
      
      const errorMessage = { role: 'bot', content: errorMsg }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            <p className="text-sm text-gray-500">Ask me anything about the website content</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {msg.role === 'bot' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
                </div>
              )}
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">You</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500 font-medium">AI Assistant</span>
              </div>
              <div className="bg-gray-100 border border-gray-200 p-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-600 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200/50">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about the website..."
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-12"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}