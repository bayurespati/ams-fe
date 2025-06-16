// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Cookies
import Cookies from 'js-cookie'
import auth from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        await axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken
            }
          })
          .then(async response => {
            setLoading(false)
            await axios
              .get(authConfig.detailUser, {
                headers: {
                  Authorization: storedToken,
                  Token: storedToken
                }
              })
              .then(response => {
                setUser({ ...response.data.userData })
              })

            // setUser({ ...response.data.userData })
          })
          .catch(() => {
            Cookies.remove(authConfig.storageTokenKeyName)
            Cookies.remove('userData')
            Cookies.remove('refreshToken')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          })
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post(`${process.env.NEXT_PUBLIC_BASE_URL}auth/token/request`, params)
      .then(async response => {
        // params.rememberMe ? window.localStorage.setItem(access_token, response.data.access_token) : null
        window.localStorage.setItem('access_token', response.data.data.access_token)
        window.localStorage.setItem('refresh_token', response.data.data.refresh_token)
        const returnUrl = router.query.returnUrl

        await axios
          .get(`${process.env.NEXT_PUBLIC_BASE_URL}auth/token/detail`, {
            headers: {
              Authorization: response.data.data.token_type + ' ' + response.data.data.access_token
            }
          })
          .then(response => {
            setUser({ ...response.data.data, role: 'admin' })
          })

        // setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
