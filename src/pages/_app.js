// ** React & Next Imports
import { useContext } from 'react'
import Head from 'next/head'
import { Router } from 'next/router'

// ** Redux Store
import { Provider } from 'react-redux'
import { store } from 'src/store'

// ** Emotion & Theme
import { CacheProvider } from '@emotion/react'
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Layout & Components
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import Spinner from 'src/@core/components/spinner'

// ** Context & Guards
import { AuthProvider, AuthContext } from 'src/context/AuthContext'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'
import AclGuard from 'src/@core/components/auth/AclGuard'
import { SettingsProvider, SettingsConsumer } from 'src/@core/context/settingsContext'

// ** Config
import themeConfig from 'src/configs/themeConfig'
import { defaultACLObj } from 'src/configs/acl'

// ** Toast
import { Toaster } from 'react-hot-toast'
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Global Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'
import '../../styles/globals.css'

// ** Loading Progress
import NProgress from 'nprogress'

if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => NProgress.start())
  Router.events.on('routeChangeError', () => NProgress.done())
  Router.events.on('routeChangeComplete', () => NProgress.done())
}

const clientSideEmotionCache = createEmotionCache()

// ** Auth Initialization Wrapper
const AuthInitializerWrapper = ({ children }) => {
  const { initialized } = useContext(AuthContext)

  if (!initialized) {
    return <Spinner />
  }

  return <>{children}</>
}

// ** Guard Wrapper
const Guard = ({ children, authGuard, guestGuard }) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

// ** Main App Component
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
          <meta
            name='description'
            content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
          />
          <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
        </Head>

        <AuthProvider>
          <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
            <SettingsConsumer>
              {({ settings }) => (
                <ThemeComponent settings={settings}>
                  <AuthInitializerWrapper>
                    <Guard authGuard={authGuard} guestGuard={guestGuard}>
                      <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                        {getLayout(<Component {...pageProps} />)}
                      </AclGuard>
                    </Guard>
                  </AuthInitializerWrapper>

                  <ReactHotToast>
                    <Toaster
                      position={settings.toastPosition}
                      toastOptions={{ className: 'react-hot-toast' }}
                    />
                  </ReactHotToast>
                </ThemeComponent>
              )}
            </SettingsConsumer>
          </SettingsProvider>
        </AuthProvider>
      </CacheProvider>
    </Provider>
  )
}

export default App
