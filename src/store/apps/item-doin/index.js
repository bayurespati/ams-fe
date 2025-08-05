import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ========== UUID to ID Helpers ==========
const replaceUuidWithId = data => {
  return data.map(item => {
    const { uuid, ...rest } = item
    return { id: uuid, uuid, ...rest } // ✅ Simpan uuid juga
  })
}

const replaceSingleUuidWithId = data => {
  if (!data) return {}
  const { uuid, ...rest } = data
  return { id: uuid, uuid, ...rest } // ✅ Simpan uuid juga
}

// ========== Async Thunks ==========
export const fetchData = createAsyncThunk('appItemDoIn/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, {
    params
  })
  console.log('🔥 FETCH DO-IN RESPONSE:', response.data) // ✅ log ini

  const replacedData = replaceUuidWithId(response.data.data)

  return { data: replacedData, params }
})

export const addData = createAsyncThunk('appItemDoIn/addData', async newDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, newDoIn, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  const replaced = replaceSingleUuidWithId(response.data.data)

  return { ...response.data, data: replaced }
})

export const editData = createAsyncThunk('appItemDoIn/editData', async updatedItem => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, updatedItem)

  const replaced = replaceSingleUuidWithId(response.data.data)

  return { ...response.data, data: replaced }
})

export const verifyData = createAsyncThunk('appItemDoIn/verifyData', async data => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in/verification`, {
    id: data.id,
    do_in_id: data.do_in_id
  })

  const replaced = replaceSingleUuidWithId(response.data.data)

  return { ...response.data, data: replaced }
})

export const deleteData = createAsyncThunk('appPlan/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, {
    data: { id: id }
  })

  return { message: response.data.message, id }
})

// ========== Utility ==========
const searchItemDoIn = (data, query) => {
  if (!query || query === '') return data // 👈 jangan filter kalau kosong
  return data.filter(item => item.do_in_id === query)
}

// ========== Slice ==========
export const appItemDoInSlice = createSlice({
  name: 'appItemDoIn',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchItemDoIn(state.allData, query)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        console.log('✅ fetchData.fulfilled payload:', action.payload)
        state.params = action.payload.params
        state.allData = action.payload.data
        state.total = action.payload.data.length
        state.data = searchItemDoIn(state.allData, action.payload.params?.q || '')
      })
      .addCase(addData.fulfilled, (state, action) => {
        state.allData.push(action.payload.data)
        state.data = searchItemDoIn(state.allData, state.params?.q || '')
        state.total = state.allData.length
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
          const allIndex = state.allData.findIndex(item => item.id === action.payload.data.id)
          if (allIndex !== -1) state.allData[allIndex] = action.payload.data
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.data = searchItemDoIn(state.allData, state.params?.q || '')
        state.total = state.allData.length
      })
      .addCase(verifyData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
          const allIndex = state.allData.findIndex(item => item.id === action.payload.data.id)
          if (allIndex !== -1) state.allData[allIndex] = action.payload.data
        }
      })
  }
})

export const { setSearchQuery } = appItemDoInSlice.actions

export default appItemDoInSlice.reducer
