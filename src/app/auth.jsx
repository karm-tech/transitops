import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, TOKEN_KEY } from '@/lib/api'

const AuthContext = createContext(null)
const DEMO_KEY = 'transitops_demo'

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(localStorage.getItem(DEMO_KEY) === '1')

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  const persist = ({ token, user }, demo = false) => {
    // Drop the previous session's cached data so workspaces never bleed across logins.
    qc.clear()
    localStorage.setItem(TOKEN_KEY, token)
    if (demo) localStorage.setItem(DEMO_KEY, '1')
    else localStorage.removeItem(DEMO_KEY)
    setIsDemo(demo)
    setUser(user)
    return user
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return persist(data)
  }

  const demoLogin = async (role) => {
    const { data } = await api.post('/auth/demo', { role })
    return persist(data, true)
  }

  const logout = () => {
    qc.clear()
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(DEMO_KEY)
    setIsDemo(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, login, demoLogin, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
