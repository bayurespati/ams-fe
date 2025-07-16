import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const replaceUuidWithId = data =>
  data.map(item => {
    const { uuid, ...rest } = item

    return { id: uuid, ...rest }
  })

const replaceSingleUuidWithId = data => {
  if (!data) return {}
  const { uuid, ...rest } = data

  return { id: uuid, ...rest }
}

export const fetchData = createAsyncThunk('appBrand/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}brands`, { params }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}brands/garbage`, { params })
  ])

  return {
    data: replaceUuidWithId(response.data.data),
    garbage: replaceUuidWithId(response2.data.data),
    params
  }
})

export const addData = createAsyncThunk('appBrand/addData', async newBrand => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}brands`, newBrand)

  return replaceSingleUuidWithId(response.data.data)
})

export const editData = createAsyncThunk('appBrand/editData', async updatedBrand => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}brands`, updatedBrand)

  return replaceSingleUuidWithId(response.data.data)
})

export const deleteData = createAsyncThunk('appBrand/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}brands`, { data: { id } })

  return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appBrand/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}brands/restore`, { id })

  return { message: response.data.message, id }
})

const searchBrand = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    item =>
      (item.name?.toLowerCase() || '').includes(queryLowered) ||
      (item.alias?.toLowerCase() || '').includes(queryLowered)
  )
}

export const appBrandSlice = createSlice({
  name: 'appBrand',
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
      state.data = searchBrand(state.allData, query)
      state.garbage = searchBrand(state.allGarbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.data = searchBrand(action.payload.data, action.payload.params.q)
      state.allGarbage = action.payload.garbage
      state.garbage = searchBrand(action.payload.garbage, action.payload.params.q)
      state.total = action.payload.data.length
      state.totalGarbage = action.payload.garbage.length
    })
    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) state.data.push(action.payload)
    })
    builder.addCase(editData.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.data.findIndex(item => item.id === action.payload.id)
        if (index !== -1) state.data[index] = action.payload
      }
    })
    builder.addCase(deleteData.fulfilled, (state, action) => {
      const deletedItem = state.allData.find(item => item.id === action.payload.id)
      state.allData = state.allData.filter(item => item.id !== action.payload.id)
      if (deletedItem) state.allGarbage.push(deletedItem)
      state.data = searchBrand(state.allData, state.params.q || '')
      state.garbage = searchBrand(state.allGarbage, state.params.q || '')
      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })
    builder.addCase(restoreGarbage.fulfilled, (state, action) => {
      const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)
      state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
      if (restoredItem) state.allData.push(restoredItem)
      state.garbage = searchBrand(state.allGarbage, state.params.q || '')
      state.data = searchBrand(state.allData, state.params.q || '')
      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })
  }
})

export const { setSearchQuery } = appBrandSlice.actions

export default appBrandSlice.reducer
