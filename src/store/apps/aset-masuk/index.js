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

// Async thunk
export const fetchData = createAsyncThunk('appDoIn/fetchData', async (params = {}) => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, {
    params
  })
  console.log('🔥 FETCH Asset Masuk RESPONSE:', response.data) // ✅ log ini
  const modifiedData = replaceUuidWithId(response.data.data)

  return { data: modifiedData, params }
})

export const addData = createAsyncThunk('appDoIn/addData', async newDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, newDoIn, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  const replaced = replaceSingleUuidWithId(response.data.data)

  return { ...response.data, data: replaced }
})

export const editData = createAsyncThunk('appDoIn/editData', async updatedDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, updatedDoIn)
  const replaced = replaceSingleUuidWithId(response.data.data)

  return { ...response.data, data: replaced }
})

export const deleteData = createAsyncThunk('appDoIn/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, { data: { id: id } })

  return { message: response.data.message, id }
})

// Fungsi search (case-insensitive)
const searchDoIn = (data, query = '') => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    doIn =>
      doIn.no_do?.toLowerCase().includes(queryLowered) ||
      doIn.lokasi_gudang?.toLowerCase().includes(queryLowered) ||
      doIn.tanggal_masuk?.toLowerCase().includes(queryLowered) ||
      doIn.no_gr?.toLowerCase().includes(queryLowered) ||
      (doIn.po_id?.toString()?.toLowerCase() || '').includes(queryLowered)
  )
}

// Slice
export const appDoInSlice = createSlice({
  name: 'appDoIn',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchDoIn(state.allData, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchDoIn(state.allData, action.payload.params?.q || '')
    })
    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) {
        state.allData.push(action.payload.data)
        state.data = searchDoIn(state.allData, state.params?.query || '')
        state.total = state.allData.length
      }
    })
    builder.addCase(editData.fulfilled, (state, action) => {
      const index = state.data.findIndex(item => item.id === action.payload.data.id)
      if (index !== -1) {
        state.data[index] = action.payload.data
      }
    })
    builder.addCase(deleteData.fulfilled, (state, action) => {
      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      state.data = searchDoIn(state.allData, state.params?.query || '')
      state.total = state.allData.length
    })
  }
})

export const { setSearchQuery } = appDoInSlice.actions

export default appDoInSlice.reducer
