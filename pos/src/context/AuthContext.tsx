import { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  currentUser: any | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentUser = null // TODO: Implement actual auth logic
  const logout = () => {} // TODO: Implement actual logout logic

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 