import { useState, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import UploadLink from '../components/UploadLink'
import ScrapedLinks from '../components/ScrapedLinks'
import { getLinks, deleteLink } from '../services/api'

export default function Dashboard() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [links, setLinks] = useState([])

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const token = await getToken()
      const response = await getLinks(token)
      setLinks(response.data)
    } catch (error) {
      console.error('Error loading links:', error)
    }
  }

  const handleLinkUploaded = (link) => {
    setLinks([...links, link])
  }

  const handleChatClick = (linkId) => {
    navigate(`/chat/${linkId}`)
  }

  const handleDelete = async (linkId) => {
    try {
      const token = await getToken()
      await deleteLink(linkId, token)
      setLinks(links.filter(link => link._id !== linkId))
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('Failed to delete website')
    }
  }

  const handleGetScript = async (linkId) => {
    try {
      const token = await getToken()
      const response = await fetch(`/api/script/embed/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.embedCode)
      alert('Script copied to clipboard! Paste it on any website to add the chatbot.')
    } catch (error) {
      console.error('Error getting script:', error)
      alert('Failed to get script')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
            </div>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Upload Section */}
        <div className="mb-8">
          <UploadLink onLinkUploaded={handleLinkUploaded} />
        </div>
        
        {/* Links Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mr-4">Your Scraped Websites</h2>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {links.length} {links.length === 1 ? 'website' : 'websites'}
            </div>
          </div>
          
          {links.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No websites scraped yet</h3>
              <p className="text-gray-500">Upload your first website link above to get started</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
                <div key={link._id} className="group">
                  <ScrapedLinks link={link} onDelete={handleDelete} />
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleChatClick(link._id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Start Chatting
                      </span>
                    </button>
                    <button
                      onClick={() => handleGetScript(link._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Get Script
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}