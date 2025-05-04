import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import '@/App.css'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Appointments from '@/pages/Appointments'
import Orders from '@/pages/Orders'
import Diagnostics from '@/pages/Diagnostics'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from "@/components/ui/sonner"
import { Layout } from '@/components/Layout'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function App() {
  return (
    <FrappeProvider>
      <Router basename="/pos">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <Appointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <Orders />
                  </PrivateRoute>
                }
              />
              <Route
                path="/diagnostics"
                element={
                  <PrivateRoute>
                    <Diagnostics />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </FrappeProvider>
  )
}

export default App
