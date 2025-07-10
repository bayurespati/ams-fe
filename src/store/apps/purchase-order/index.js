import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchData = createAsyncThunk('appPurchaseOrder/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}po`, {
    params
  })

  return response.data
})

export const addData = createAsyncThunk('appPurchaseOrder/addData', async newPurchaseOrder => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}po`, newPurchaseOrder)

  return response.data
})

export const editData = createAsyncThunk('appPurchaseOrder/editData', async updatedPurchaseOrder => {
  
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}po`, updatedPurchaseOrder)

  return response.data
})

export const deleteData = createAsyncThunk('appNegara/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}po/${id}`, {
    data: { id }
  })

  return response.data
})

const searchPurchaseOrder = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(purchaseOrder => purchaseOrder.nama.toLowerCase().includes(queryLowered))
}

export const appPurchaseOrderSlice = createSlice({
  name: 'appPurchaseOrder',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchPurchaseOrder(state.data, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
    })
    builder
      .addCase(addData.fulfilled, (state, action) => {
        state.data.push(action.payload.data)
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
  }
})

export const { setSearchQuery } = appPurchaseOrderSlice.actions

export default appPurchaseOrderSlice.reducer
