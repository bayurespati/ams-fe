// src/store/apps/rekap-aset/index.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Fungsi bantu: mengganti uuid dengan id
const replaceUuidWithId = data => {
  return data.map(item => {
    const { uuid, ...rest } = item
    return { id: uuid, ...rest }
  })
}

const replaceSingleUuidWithId = data => {
  if (!data) {
    console.error('replaceSingleUuidWithId: received undefined data')
    return {}
  }
  const { uuid, ...rest } = data
  return { id: uuid, ...rest }
}

export const fetchData = createAsyncThunk('appAset/fetchData', async (params = {}) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}aset`, {
    params
  })
  const modifiedData = replaceUuidWithId(response.data.data)

  return { data: modifiedData, params }
})

export const addData = createAsyncThunk('appAset/addData', async newAset => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}aset`, newAset)
  const replaced = replaceSingleUuidWithId(response.data.data)
  return { ...response.data, data: replaced }
})

export const editData = createAsyncThunk('appAset/editData', async updatedAset => {
  const response = await axios.put(`${process.env.NEXT_PUBLIC_AMS_URL}aset/${updatedAset.id}`, updatedAset)
  const replaced = replaceSingleUuidWithId(response.data.data)
  return { ...response.data, data: replaced }
})

export const deleteData = createAsyncThunk('appAset/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}aset/${id}`)
  return { message: response.data.message, id }
})

// ========================
// Fungsi search aset
// ========================
const searchAset = (data, query = '') => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    aset =>
      aset.kode_aset?.toLowerCase().includes(queryLowered) ||
      aset.nama_aset?.toLowerCase().includes(queryLowered) ||
      aset.kategori?.toLowerCase().includes(queryLowered)
  )
}

// ========================
// Slice
// ========================
export const appAsetSlice = createSlice({
  name: 'appAset',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchAset(state.allData, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchAset(state.allData, action.payload.params?.q || '')
    })
    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) {
        state.allData.push(action.payload.data)
        state.data = searchAset(state.allData, state.params?.query || '')
        state.total = state.allData.length
      }
    })
    builder.addCase(editData.fulfilled, (state, action) => {
      const index = state.allData.findIndex(item => item.id === action.payload.data.id)
      if (index !== -1) {
        state.allData[index] = action.payload.data
        state.data = searchAset(state.allData, state.params?.query || '')
      }
    })
    builder.addCase(deleteData.fulfilled, (state, action) => {
      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      state.data = searchAset(state.allData, state.params?.query || '')
      state.total = state.allData.length
    })
  }
})

export const { setSearchQuery } = appAsetSlice.actions

export default appAsetSlice.reducer
