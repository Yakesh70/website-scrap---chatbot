import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import ExternalChat from './pages/ExternalChat'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={
            <>
              <SignedOut>
                <Home />
              </SignedOut>
              <SignedIn>
                <Dashboard />
              </SignedIn>
            </>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:linkId" element={<Chat />} />
          <Route path="/external-chat" element={<ExternalChat />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App