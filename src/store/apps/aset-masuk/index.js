import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchData = createAsyncThunk('appDoIn/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, {
    params
  })

  return { data: response.data.data, params }
})

export const addData = createAsyncThunk('appDoIn/addData', async newDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, newDoIn, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
})

export const editData = createAsyncThunk('appDoIn/editData', async updatedDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, updatedDoIn)

  return response.data
})

export const deleteData = createAsyncThunk('appDoIn/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, { data: { id: id } })

  return { message: response.data.message, id }
})

const searchDoIn = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    doIn =>
      doIn.no_do.toLowerCase().includes(queryLowered) ||
      doIn.lokasi_gudang.toLowerCase().includes(queryLowered) ||
      doIn.tanggal_masuk.toLowerCase().includes(queryLowered) ||
      doIn.no_gr.toLowerCase().includes(queryLowered) ||
      doIn.po_id.toLowerCase().includes(queryLowered)
  )
}

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
      state.data = searchDoIn(state.data, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchDoIn(state.allData, action.payload.params.q)
    })
    builder
      .addCase(addData.fulfilled, (state, action) => {
        if (action.payload) {
          state.allData.push(action.payload.data)
          state.data = searchDoIn(state?.allData, state?.params?.query || '')
          state.total = state.allData.length
        } else {
          console.error('Add data payload is undefined')
        }
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.data = searchDoIn(state.allData, state.params.query || '')
        state.total = state.allData.length
      })
  }
})

export const { setSearchQuery } = appDoInSlice.actions

export default appDoInSlice.reducer
