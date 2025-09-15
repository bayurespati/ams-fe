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

  // ? Cek dan inisialisasi sesi saat pertama load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token')
      const tokenType = localStorage.getItem('token_type')
      const authHeader = token && tokenType ? `${tokenType} ${token}` : null

      if (authHeader) {
        axios.defaults.headers.common['Authorization'] = authHeader
        try {
          const res = await axios.get(`${baseUrl}auth/token/detail`)
          const userData = res.data.data || {}

          // Ambil role user
          const roleRes = await axios.get(`${baseUrl}iams/role`)
          userData.role = roleRes.data.name || 'Admin Gudang'

          setUser(userData)
          localStorage.setItem('userData', JSON.stringify(userData))
        } catch (err) {
          console.error('? Gagal ambil detail user:', err)
          localStorage.clear()
          setUser(null)
          if (!router.pathname.includes('/login')) router.replace('/login')
        }
      } else {
        const storedUser = localStorage.getItem('userData')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          parsed.role = parsed.role || 'admin'
          setUser(parsed)
        }
      }

      setLoading(false)
      setInitialized(true)
    }

    initAuth()
  }, []) // ✅ Tambahkan [] agar hanya dijalankan sekali saat mount

  // ? Login
  const handleLogin = async (params, errorCallback) => {
    try {
      const res = await axios.post(`${baseUrl}auth/token/request`, params)
      const { access_token, refresh_token, token_type } = res.data.data
      const authHeader = `${token_type} ${access_token}`

      // Simpan token
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('token_type', token_type)
      axios.defaults.headers.common['Authorization'] = authHeader

      // Ambil data user
      const detailRes = await axios.get(`${baseUrl}auth/token/detail`)
      const userData = detailRes.data.data || {}

      // Ambil role user
      const roleRes = await axios.get(`${baseUrl}iams/role`)
      userData.role = roleRes.data.name || 'Admin Gudang'

      setUser(userData)
      localStorage.setItem('userData', JSON.stringify(userData))

      const returnUrl = router.query.returnUrl || '/'
      router.replace(returnUrl)
    } catch (err) {
      console.error('? Login error:', err)
      if (errorCallback) errorCallback(err)
    }
  }

  // ? Logout
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
