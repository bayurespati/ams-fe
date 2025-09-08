import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ========================
// Helpers
// ========================
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

// ========================
// Async Thunks
// ========================
export const fetchData = createAsyncThunk('appLabelAset/fetchData', async (params = {}) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label`, { params })
  const modifiedData = replaceUuidWithId(response.data.data)

  return { data: modifiedData, params }
})

export const addData = createAsyncThunk('appLabelAset/addData', async newLabel => {
  // ubah total → qty sebelum dikirim
  const payload = { ...newLabel, qty: newLabel.total }
  delete payload.total // jangan kirim total ke backend

  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label`, payload)

  // setelah berhasil, backend kirim total (bukan qty), kita biarin aja
  return response.data
})

export const updateAsset = createAsyncThunk('appLabelAset/updateAsset', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label`, payload)

    // Pastikan mengembalikan id agar state bisa diupdate
    const updated = replaceSingleUuidWithId(res.data.data)

    return updated
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message)
  }
})

export const deleteData = createAsyncThunk('appLabelAset/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label/${id}`)

  return { message: response.data.message, id }
})

// ========================
// Search Function
// ========================
const searchLabelAset = (data, query = '') => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    aset =>
      aset.internal_order?.toLowerCase().includes(queryLowered) ||
      aset.id_asset?.toLowerCase().includes(queryLowered) ||
      aset.type?.toLowerCase().includes(queryLowered) ||
      aset.qty?.toString().includes(queryLowered)
  )
}

// ========================
// Slice
// ========================
export const appLabelAsetSlice = createSlice({
  name: 'appLabelAset',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchLabelAset(state.allData, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchLabelAset(state.allData, action.payload.params?.q || '')
    })
    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) {
        state.allData.push(action.payload.data)
        state.data = searchLabelAset(state.allData, state.params?.query || '')
        state.total = state.allData.length
      }
    })
    builder.addCase(updateAsset.fulfilled, (state, action) => {
      const index = state.allData.findIndex(item => item.id === action.payload.data.id)
      if (index !== -1) {
        state.allData[index] = action.payload.data
        state.data = searchLabelAset(state.allData, state.params?.query || '')
      }
    })
    builder.addCase(deleteData.fulfilled, (state, action) => {
      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      state.data = searchLabelAset(state.allData, state.params?.query || '')
      state.total = state.allData.length
    })
  }
})

export const { setSearchQuery } = appLabelAsetSlice.actions

export default appLabelAsetSlice.reducer
