// src/store/apps/rack/index.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_AMS_URL || '/api/'

// Convert array of items: uuid -> id (safe)
const replaceUuidWithId = data => {
  if (!Array.isArray(data)) return []
  return data.map(item => {
    const { uuid, id, ...rest } = item
    return { id: uuid ?? id ?? null, ...rest }
  })
}

// Convert single item (safe)
const replaceSingleUuidWithId = data => {
  if (!data) return {}
  const { uuid, id, ...rest } = data
  return { id: uuid ?? id ?? null, ...rest }
}

/* --------------------------------------------
   FETCH DATA
----------------------------------------------*/
export const fetchData = createAsyncThunk('appRak/fetchData', async params => {
  const [response, responseGarbage] = await Promise.all([
    axios.get(`${BASE_URL}rak`, { params }),
    axios.get(`${BASE_URL}rak/garbage`, { params })
  ])

  const data = replaceUuidWithId(response.data.data || [])
  const garbage = replaceUuidWithId(responseGarbage.data.data || [])

  return { data, garbage, params }
})

/* --------------------------------------------
   ADD
----------------------------------------------*/
export const addData = createAsyncThunk('appRak/addData', async newRak => {
  const response = await axios.post(`${BASE_URL}rak`, newRak)
  return replaceSingleUuidWithId(response.data.data)
})

/* --------------------------------------------
   EDIT
----------------------------------------------*/
export const editData = createAsyncThunk('appRak/editData', async updatedRak => {
  const response = await axios.patch(`${BASE_URL}rak`, updatedRak)
  return replaceSingleUuidWithId(response.data.data)
})

/* --------------------------------------------
   DELETE
----------------------------------------------*/
export const deleteData = createAsyncThunk('appRak/deleteData', async id => {
  const response = await axios.delete(`${BASE_URL}rak`, { data: { id } })
  return { message: response.data?.message, id }
})

/* --------------------------------------------
   RESTORE
----------------------------------------------*/
export const restoreGarbage = createAsyncThunk('appRak/restoreGarbage', async id => {
  const response = await axios.patch(`${BASE_URL}rak/restore`, { id })
  return { message: response.data?.message, id }
})

/* --------------------------------------------
   SEARCH (client-side)
----------------------------------------------*/
const searchRak = (data, query) => {
  const q = query?.toString().toLowerCase() || ''
  if (!q) return data
  return data.filter(
    item =>
      (item.nama_rak ?? '').toLowerCase().includes(q) ||
      (item.kode_rak ?? '').toLowerCase().includes(q) ||
      (item.lokasi_rak ?? '').toLowerCase().includes(q)
  )
}

/* --------------------------------------------
   SLICE
----------------------------------------------*/
export const appRakSlice = createSlice({
  name: 'appRak',
  initialState: {
    data: [],
    garbage: [],
    total: 0,
    totalGarbage: 0,
    params: {},
    allData: [],
    allGarbage: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchRak(state.allData, query)
      state.garbage = searchRak(state.allGarbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params || {}
      state.allData = action.payload.data || []
      state.data = searchRak(state.allData, action.payload.params?.q)
      state.total = state.allData.length

      state.allGarbage = action.payload.garbage || []
      state.garbage = searchRak(state.allGarbage, action.payload.params?.q)
      state.totalGarbage = state.allGarbage.length
    })

    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) {
        state.allData.push(action.payload)
        state.data = searchRak(state.allData, state.params?.q)
        state.total = state.allData.length
      }
    })

    builder.addCase(editData.fulfilled, (state, action) => {
      if (!action.payload) return
      const idxAll = state.allData.findIndex(item => item.id === action.payload.id)
      if (idxAll !== -1) state.allData[idxAll] = action.payload

      const idx = state.data.findIndex(item => item.id === action.payload.id)
      if (idx !== -1) state.data[idx] = action.payload
    })

    builder.addCase(deleteData.fulfilled, (state, action) => {
      const deleted = state.allData.find(item => item.id === action.payload.id)
      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      if (deleted) state.allGarbage.push(deleted)

      state.data = searchRak(state.allData, state.params?.q)
      state.garbage = searchRak(state.allGarbage, state.params?.q)
      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })

    builder.addCase(restoreGarbage.fulfilled, (state, action) => {
      const restored = state.allGarbage.find(item => item.id === action.payload.id)
      state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
      if (restored) state.allData.push(restored)

      state.data = searchRak(state.allData, state.params?.q)
      state.garbage = searchRak(state.allGarbage, state.params?.q)
      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })
  }
})

export const { setSearchQuery } = appRakSlice.actions
export default appRakSlice.reducer
