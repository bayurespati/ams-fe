// ** React Imports
import { useEffect, useMemo } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Contexts
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Configs
import { buildAbilityFor } from 'src/configs/acl'

// ** Components
import NotAuthorized from 'src/pages/401'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Utils
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

const AclGuard = ({ aclAbilities, children, guestGuard = false, authGuard = true }) => {
  const auth = useAuth()
  const router = useRouter()

  // ✅ Buat ability berdasarkan role user dan subject yang ditentukan
  const ability = useMemo(() => {
    if (auth.user?.role) {
      return buildAbilityFor(auth.user.role, aclAbilities.subject)
    }

    return null
  }, [auth.user, aclAbilities.subject])

  // 🚀 Redirect jika di halaman root '/' dan user sudah login
  useEffect(() => {
    if (auth.user && auth.user.role && !guestGuard && router.route === '/') {
      const homeRoute = getHomeRoute(auth.user.role)
      if (homeRoute !== '/') {
        router.replace(homeRoute)
      }
    }
  }, [auth.user, guestGuard, router])

  // 🔓 Untuk halaman publik atau error
  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    return auth.user && ability ? (
      <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    ) : (
      <>{children}</>
    )
  }

  // 🕒 Saat auth belum selesai atau ability belum siap
  if (auth.loading || !auth.user || !ability) {
    return <Spinner />
  }

  // ✅ Cek apakah user punya izin untuk mengakses halaman
  if (ability.can(aclAbilities.action, aclAbilities.subject)) {
    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  }

  // ❌ Jika tidak punya izin
  return (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}

export default AclGuard
