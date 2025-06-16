import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Function to replace 'uuid' with 'id'
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

export const fetchData = createAsyncThunk('appType/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_types`, {
      params
    }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item_types/garbage`, {
      params
    })
  ])

  const data = replaceUuidWithId(response.data.data)
  const garbage = replaceUuidWithId(response2.data.data)

  return { data: data, garbage: garbage, params }
})

export const addData = createAsyncThunk('appType/addData', async newtype => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item_types`, newtype)

  const data = replaceSingleUuidWithId(response.data.data)

  return data
})

export const editData = createAsyncThunk('appType/editData', async updatedtype => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item_types`, updatedtype)

  const data = replaceSingleUuidWithId(response.data.data)

  return data
})

export const deleteData = createAsyncThunk('appType/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}item_types`, { data: { id: id } })

  return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appType/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item_types/restore`, { id })

  return { message: response.data.message, id }
})

const searchType = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(type => type.nama.toLowerCase().includes(queryLowered))
}

export const appTypeSlice = createSlice({
  name: 'appType',
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
      state.data = searchType(state.data, query)
      state.garbage = searchType(state.garbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchType(state.allData, action.payload.params.q)
      state.allGarbage = action.payload.garbage
      state.garbage = searchType(state.allGarbage, action.payload.params.q)
      state.totalGarbage = action.payload.garbage.length
    })
    builder
      .addCase(addData.fulfilled, (state, action) => {
        if (action.payload) {
          state.data.push(action.payload)
        } else {
          console.error('Add data payload is undefined')
        }
      })
      .addCase(editData.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.data.findIndex(item => item.id === action.payload.id)
          if (index !== -1) {
            state.data[index] = action.payload
          } else {
            console.error('Edited data not found in state')
          }
        } else {
          console.error('Edit data payload is undefined')
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        const deletedItem = state.allData.find(item => item.id === action.payload.id)
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.allGarbage.push(deletedItem)
        state.data = searchType(state.allData, state.params.query || '')
        state.garbage = searchType(state.allGarbage, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
      .addCase(restoreGarbage.fulfilled, (state, action) => {
        const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)
        state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
        state.allData.push(restoredItem)
        state.garbage = searchType(state.allGarbage, state.params.query || '')
        state.data = searchType(state.allData, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
  }
})

export const { setSearchQuery } = appTypeSlice.actions

export default appTypeSlice.reducer
