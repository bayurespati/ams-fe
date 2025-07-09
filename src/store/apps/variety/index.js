import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Fungsi bantu untuk mengganti 'uuid' dengan 'id'
const replaceUuidWithId = data => {
  return data.map(item => ({ ...item, id: item.uuid }))
}

// Async Thunks
export const fetchData = createAsyncThunk('appVariety/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, { params }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties/garbage`, { params })
  ])

  return {
    data: response.data.data,
    garbage: response2.data.data,
    params
  }
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
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties`, {
    data: { id }
  })

  return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appVariety/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item_varieties/restore`, { id })

  return { message: response.data.message, id }
})

// Filter berdasarkan nama
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
      state.data = searchVariety(state.allData, query)
      state.garbage = searchVariety(state.allGarbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      const dataWithId = replaceUuidWithId(action.payload.data)
      const garbageWithId = replaceUuidWithId(action.payload.garbage)

      state.params = action.payload.params
      state.allData = dataWithId
      state.allGarbage = garbageWithId
      state.total = dataWithId.length
      state.totalGarbage = garbageWithId.length

      state.data = searchVariety(dataWithId, action.payload.params.q || '')
      state.garbage = searchVariety(garbageWithId, action.payload.params.q || '')
    })

    builder.addCase(addData.fulfilled, (state, action) => {
      const newData = { ...action.payload.data, id: action.payload.data.uuid }
      state.data.push(newData)
      state.allData.push(newData)
      state.total = state.allData.length
    })

    builder.addCase(editData.fulfilled, (state, action) => {
      const updated = { ...action.payload.data, id: action.payload.data.uuid }

      const index = state.data.findIndex(item => item.id === updated.id)
      if (index !== -1) {
        state.data[index] = updated
      }

      const allIndex = state.allData.findIndex(item => item.id === updated.id)
      if (allIndex !== -1) {
        state.allData[allIndex] = updated
      }
    })

    builder.addCase(deleteData.fulfilled, (state, action) => {
      const deletedItem = state.allData.find(item => item.id === action.payload.id)

      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      state.data = searchVariety(state.allData, state.params.q || '')

      if (deletedItem) {
        state.allGarbage.push(deletedItem)
        state.garbage = searchVariety(state.allGarbage, state.params.q || '')
      }

      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })

    builder.addCase(restoreGarbage.fulfilled, (state, action) => {
      const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)

      state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
      state.garbage = searchVariety(state.allGarbage, state.params.q || '')

      if (restoredItem) {
        state.allData.push(restoredItem)
        state.data = searchVariety(state.allData, state.params.q || '')
      }

      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })
  }
})

export const { setSearchQuery } = appVarietySlice.actions

export default appVarietySlice.reducer
