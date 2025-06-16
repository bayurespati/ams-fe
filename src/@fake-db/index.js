import mock from './mock'

import './auth/jwt'

import './apps/negara'
import './apps/kota'

mock.onAny().passThrough()
