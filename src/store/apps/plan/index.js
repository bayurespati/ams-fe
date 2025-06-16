import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchData = createAsyncThunk('appPlan/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, {
    params
  })

  return { data: response.data.data, params }
})

export const addData = createAsyncThunk('appPlan/addData', async newPlan => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, newPlan)

  return response.data
})

export const editData = createAsyncThunk('appPlan/editData', async updatedPlan => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, updatedPlan)

  return response.data
})

export const deleteData = createAsyncThunk('appPlan/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, { data: { id: id } })

  return { message: response.data.message, id }
})

const searchPlan = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    plan =>
      plan.nama_barang.toLowerCase().includes(queryLowered) ||
      plan.no_prpo.toLowerCase().includes(queryLowered) ||
      plan.judul.toLowerCase().includes(queryLowered)
  )
}

export const appPlanSlice = createSlice({
  name: 'appPlan',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchPlan(state.data, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchPlan(state.allData, action?.payload?.params?.q)
    })
    builder
      .addCase(addData.fulfilled, (state, action) => {
        state.params = action.payload.params
        state.allData = action.payload.data
        state.total = action.payload.data.length
        state.data = searchPlan(state.allData, action?.payload?.params?.q)
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.data = searchType(state.allData, state.params.query || '')
        state.total = state.allData.length
      })
  }
})

export const { setSearchQuery } = appPlanSlice.actions

export default appPlanSlice.reducer
