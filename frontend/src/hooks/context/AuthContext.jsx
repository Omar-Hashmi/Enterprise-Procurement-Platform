import React from 'react'
import { AuthProvider } from '../useAuth'

export default function AppAuthProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
