import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Helper replace uuid -> id
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

// --- Thunks ---
export const fetchData = createAsyncThunk('appWarehouse/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses`, { params }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses/garbage`, { params })
  ])

  const data = replaceUuidWithId(response.data.data)
  const garbage = replaceUuidWithId(response2.data.data)

  return { data, garbage, params }
})

export const addData = createAsyncThunk('appWarehouse/addData', async newWarehouse => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses`, newWarehouse)
  
return replaceSingleUuidWithId(response.data.data)
})

export const editData = createAsyncThunk('appWarehouse/editData', async updatedWarehouse => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses`, updatedWarehouse)
  
return replaceSingleUuidWithId(response.data.data)
})

export const deleteData = createAsyncThunk('appWarehouse/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses`, { data: { id } })
  
return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appWarehouse/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}warehouses/restore`, { id })
  
return { message: response.data.message, id }
})

// --- Slice ---
const searchWarehouse = (data, query) => {
  const q = query.toLowerCase()
  
return data.filter(w => w.nama?.toLowerCase().includes(q) || w.alamat?.toLowerCase().includes(q))
}

export const appWarehouseSlice = createSlice({
  name: 'appWarehouse',
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
      state.data = searchWarehouse(state.allData, query)
      state.garbage = searchWarehouse(state.allGarbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.data = searchWarehouse(state.allData, action.payload.params.q || '')
      state.allGarbage = action.payload.garbage
      state.garbage = searchWarehouse(state.allGarbage, action.payload.params.q || '')
      state.total = state.allData.length
      state.totalGarbage = state.allGarbage.length
    })
    builder.addCase(addData.fulfilled, (state, action) => {
      if (action.payload) state.data.push(action.payload)
    })
    builder.addCase(editData.fulfilled, (state, action) => {
      const idx = state.data.findIndex(item => item.id === action.payload.id)
      if (idx !== -1) state.data[idx] = action.payload
    })
    builder.addCase(deleteData.fulfilled, (state, action) => {
      const deleted = state.allData.find(item => item.id === action.payload.id)
      state.allData = state.allData.filter(i => i.id !== action.payload.id)
      if (deleted) state.allGarbage.push(deleted)
      state.data = searchWarehouse(state.allData, state.params.q || '')
      state.garbage = searchWarehouse(state.allGarbage, state.params.q || '')
    })
    builder.addCase(restoreGarbage.fulfilled, (state, action) => {
      const restored = state.allGarbage.find(item => item.id === action.payload.id)
      state.allGarbage = state.allGarbage.filter(i => i.id !== action.payload.id)
      if (restored) state.allData.push(restored)
      state.data = searchWarehouse(state.allData, state.params.q || '')
      state.garbage = searchWarehouse(state.allGarbage, state.params.q || '')
    })
  }
})

export const { setSearchQuery } = appWarehouseSlice.actions

export default appWarehouseSlice.reducer
