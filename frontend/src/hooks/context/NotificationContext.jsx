import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [messages, setMessages] = useState([])

  const push = (msg) => setMessages((s) => [...s, msg])
  const clear = () => setMessages([])

  return (
    <NotificationContext.Provider value={{ messages, push, clear }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}

export default NotificationContext
