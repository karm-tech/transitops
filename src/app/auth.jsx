import { createContext, useContext, useEffect, useState } from 'react'
import { api, TOKEN_KEY } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const persist = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
    return user
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return persist(data)
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    return persist(data)
  }

  const demoLogin = async (role) => {
    const { data } = await api.post('/auth/demo', { role })
    return persist(data)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
