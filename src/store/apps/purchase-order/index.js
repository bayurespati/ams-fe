import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

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

export const fetchData = createAsyncThunk('appPurchaseOrder/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}po`, { params })

  return { data: response.data.data, params }
})

export const addData = createAsyncThunk('appPurchaseOrder/addData', async newPurchaseOrder => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}po`, newPurchaseOrder)

  return response.data.data
})

export const editData = createAsyncThunk('appPurchaseOrder/editData', async updatedPurchaseOrder => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}po`, updatedPurchaseOrder)

  return response.data.data
})

export const deleteData = createAsyncThunk('appPurchaseOrder/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}po`, {
    data: { id: id }
  })

  return { message: response.data.message, id }
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
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        const replacedData = replaceUuidWithId(action.payload.data)
        state.data = replacedData
        state.allData = replacedData
        state.params = action.payload.params
        state.total = replacedData.length
      })
      .addCase(addData.fulfilled, (state, action) => {
        const newItem = replaceSingleUuidWithId(action.payload)
        state.data.push(newItem)
        state.allData.push(newItem)
        state.total++
      })
      .addCase(editData.fulfilled, (state, action) => {
        const updatedItem = replaceSingleUuidWithId(action.payload)
        const index = state.data.findIndex(item => item.id === updatedItem.id)
        if (index !== -1) {
          state.data[index] = updatedItem
          const allIndex = state.allData.findIndex(item => item.id === updatedItem.id)
          if (allIndex !== -1) state.allData[allIndex] = updatedItem
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.data = state.data.filter(item => item.id !== action.payload.id)
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.total--
      })
  }
})

export const { setSearchQuery } = appPurchaseOrderSlice.actions

export default appPurchaseOrderSlice.reducer
