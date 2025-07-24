// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'

// ** Component
import Spinner from 'src/@core/components/spinner'

const AuthGuard = ({ children, fallback = <Spinner /> }) => {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Jika sudah diinisialisasi & tidak loading & user tidak ada, arahkan ke login
    if (initialized && !loading && !user) {
      const returnUrl = router.asPath !== '/' ? { returnUrl: router.asPath } : {}
      router.replace({ pathname: '/login', query: returnUrl })
    }
  }, [user, loading, initialized, router])

  // Tampilkan spinner saat belum inisialisasi atau masih loading
  if (!initialized || loading) {
    return fallback
  }

  // Jika user tidak ada (null) tapi proses redirect sedang berjalan, beri feedback visual
  if (!user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>🔒 Redirecting to login...</div>
  }

  // Jika semua valid, render children
  return <>{children}</>
}

export default AuthGuard
