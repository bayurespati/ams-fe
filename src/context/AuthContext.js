// ** React Imports
import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

// ** Default Values
const defaultProvider = {
  user: null,
  loading: true,
  initialized: false,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // ✅ Init Auth
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 initAuth berjalan...')
      const token = localStorage.getItem('access_token')
      const tokenType = localStorage.getItem('token_type')
      const authHeader = token && tokenType ? `${tokenType} ${token}` : null

      console.log('✅ Token:', token)
      console.log('✅ TokenType:', tokenType)
      console.log('✅ AuthHeader:', authHeader)

      if (authHeader) {
        axios.defaults.headers.common['Authorization'] = authHeader

        try {
          const meRes = await axios.get(`${baseUrl}auth/token/detail`)
          console.log('✅ meRes:', meRes.data)

          const userData = meRes.data.data || {}
          userData.role = userData.role || 'admin' // fallback kalau role kosong

          setUser(userData)
          localStorage.setItem('userData', JSON.stringify(userData))
        } catch (err) {
          console.error('❌ initAuth error:', err.response?.data || err.message)
          localStorage.clear()
          setUser(null)

          if (!router.pathname.includes('/login')) {
            router.replace('/login')
          }
        }
      } else {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          parsed.role = parsed.role || 'admin'
          setUser(parsed)
        } else {
          console.warn('⚠️ Tidak ada user di localStorage')
        }
      }

      setLoading(false)
      setInitialized(true)
      console.log('✅ initAuth selesai, initialized = true')
    }

    initAuth()
  }, [])

  // ✅ LOGIN Handler
  const handleLogin = async (params, errorCallback) => {
    try {
      const res = await axios.post(`${baseUrl}auth/token/request`, params)
      const { access_token, refresh_token, token_type } = res.data.data
      const authHeader = `${token_type} ${access_token}`

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('token_type', token_type)

      axios.defaults.headers.common['Authorization'] = authHeader

      const detailRes = await axios.get(`${baseUrl}auth/token/detail`)
      const userData = detailRes.data.data || {}
      userData.role = userData.role || 'admin'

      setUser(userData)
      localStorage.setItem('userData', JSON.stringify(userData))

      const returnUrl = router.query.returnUrl || '/'
      router.replace(returnUrl)
    } catch (err) {
      console.error('❌ Login gagal:', err.response?.data || err.message)
      if (errorCallback) errorCallback(err)
    }
  }

  // ✅ LOGOUT Handler
  const handleLogout = () => {
    localStorage.clear()
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setLoading(false)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        setUser,
        setLoading,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
