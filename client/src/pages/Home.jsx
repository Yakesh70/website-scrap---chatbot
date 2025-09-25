import { SignInButton } from '@clerk/clerk-react'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-8 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Web Bot AI
          </h1>
          
          <p className="text-xl text-gray-700 mb-4 leading-relaxed">
            Transform any website into an intelligent chatbot
          </p>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Scrape websites, extract content, and chat with AI about the information. 
            Perfect for research, customer support, and knowledge management.
          </p>
        </div>

        {/* CTA Button */}
        <SignInButton mode="modal">
          <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            <span className="relative flex items-center">
              Get Started Free
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </SignInButton>
      </div>
    </div>
  )
}