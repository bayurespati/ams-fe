import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchData = createAsyncThunk('appVariety/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, {
      params
    }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties/garbage`, {
      params
    })
  ])

  return { data: response.data.data, garbage: response2.data.data, params }
})

export const addData = createAsyncThunk('appVariety/addData', async newVariety => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, newVariety)

  return response.data
})

export const editData = createAsyncThunk('appVariety/editData', async updatedVariety => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, updatedVariety)

  return response.data
})

export const deleteData = createAsyncThunk('appVariety/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, { data: { id: id } })

  return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appVariety/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties/restore`, { id })

  return { message: response.data.message, id }
})

const searchVariety = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(variety => variety.nama.toLowerCase().includes(queryLowered))
}

export const appVarietySlice = createSlice({
  name: 'appVariety',
  initialState: {
    data: [],
    garbage: [],
    total: 1,
    totalGarbage: 1,
    params: {},
    allData: [],
    allGarbage: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchVariety(state.data, query)
      state.garbage = searchVariety(state.garbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchVariety(state.allData, action.payload.params.q)
      state.allGarbage = action.payload.garbage
      state.garbage = searchVariety(state.allGarbage, action.payload.params.q)
      state.totalGarbage = action.payload.garbage.length
    })
    builder
      .addCase(addData.fulfilled, (state, action) => {
        state.data.push(action.payload.data)
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        console.log(index)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        const deletedItem = state.allData.find(item => item.id === action.payload.id)
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.allGarbage.push(deletedItem)
        state.data = searchVariety(state.allData, state.params.query || '')
        state.garbage = searchVariety(state.allGarbage, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
      .addCase(restoreGarbage.fulfilled, (state, action) => {
        const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)
        state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
        state.allData.push(restoredItem)
        state.garbage = searchVariety(state.allGarbage, state.params.query || '')
        state.data = searchVariety(state.allData, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
  }
})

export const { setSearchQuery } = appVarietySlice.actions

export default appVarietySlice.reducer
