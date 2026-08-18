import React from 'react'
import { useState, useEffect, useContext, createContext } from 'react'

// Minimal auth hook placeholder. Replace with real API integration.
export function useAuthProvider() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Try to load user from localStorage/session when integrating
    const stored = window.localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = async (credentials) => {
    setIsLoading(true)
    // call API here
    const fakeUser = { id: 'u1', name: 'Demo User', role: 'admin' }
    window.localStorage.setItem('user', JSON.stringify(fakeUser))
    setUser(fakeUser)
    setIsLoading(false)
    return fakeUser
  }

  const logout = () => {
    window.localStorage.removeItem('user')
    setUser(null)
  }

  return { user, isLoading, login, logout }
}

// Context and hook
const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const auth = useAuthProvider()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
