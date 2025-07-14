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
import company from './apps/company' // ✅ Tambahkan ini

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
    company // ✅ Tambahkan ini
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
