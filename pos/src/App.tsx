import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import '@/App.css'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Toaster } from "@/components/ui/sonner"
import { Button } from '@/components/ui/button'

function Navigation() {
  const { currentUser, logout } = useAuth()
  
  return (
    <nav>
      <ul className="flex space-x-4 p-4">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        {currentUser ? (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

function App() {
  return (
    <div className="App">
      <FrappeProvider>
        <AuthProvider>
          <Router basename="/pos">
            <Navigation />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </FrappeProvider>
    </div>
  )
}

export default App
