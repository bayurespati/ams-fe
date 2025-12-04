// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import kota from 'src/store/apps/kota'
import negara from 'src/store/apps/negara'
import plan from 'src/store/apps/plan'
import variety from './apps/variety'
import type from './apps/type'
import purchaseOrder from './apps/purchase-order'
import asetMasuk from './apps/aset-masuk'
import itemDoin from './apps/item-doin'
import brand from 'src/store/apps/brand'
import company from './apps/company'
import appLabelAset from './apps/label-aset'
import warehouse from 'src/store/apps/warehouse'
import rack from 'src/store/apps/rack'

export const store = configureStore({
  reducer: {
    kota,
    negara,
    plan,
    variety,
    type,
    purchaseOrder,
    asetMasuk,
    itemDoin,
    brand,
    company,
    appLabelAset,
    warehouse,
    rack
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
