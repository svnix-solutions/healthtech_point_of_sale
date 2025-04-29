import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import '@/App.css'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="App">
      <FrappeProvider>
        <Router basename="/healthtech_point_of_sale">
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
        </Router>
      </FrappeProvider>
    </div>
  )
}

export default App
