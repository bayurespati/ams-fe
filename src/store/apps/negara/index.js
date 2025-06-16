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

export const fetchData = createAsyncThunk('appNegara/fetchData', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}countries`, {
      params
    }),
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}countries/garbage`, {
      params
    })
  ])

  const data = replaceUuidWithId(response.data.data)
  const garbage = replaceUuidWithId(response2.data.data)

  return { data: data, garbage: garbage, params }
})

export const addData = createAsyncThunk('appNegara/addData', async newNegara => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}countries`, newNegara)

  const data = replaceSingleUuidWithId(response.data.data)

  return data
})

export const editData = createAsyncThunk('appNegara/editData', async updatedNegara => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}countries`, updatedNegara)

  const data = replaceSingleUuidWithId(response.data.data)

  return data
})

export const deleteData = createAsyncThunk('appNegara/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}countries`, { data: { id: id } })

  return { message: response.data.message, id }
})

export const restoreGarbage = createAsyncThunk('appNegara/restoreGarbage', async id => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}countries/restore`, { id })

  return { message: response.data.message, id }
})

const searchNegara = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    negara => negara.nama.toLowerCase().includes(queryLowered) || negara.alias.toLowerCase().includes(queryLowered)
  )
}

export const appNegaraSlice = createSlice({
  name: 'appNegara',
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
      state.data = searchNegara(state.data, query)
      state.garbage = searchNegara(state.garbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchNegara(state.allData, action.payload.params.q)
      state.allGarbage = action.payload.garbage
      state.garbage = searchNegara(state.allGarbage, action.payload.params.q)
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
        state.data = searchNegara(state.allData, state.params.query || '')
        state.garbage = searchNegara(state.allGarbage, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
      .addCase(restoreGarbage.fulfilled, (state, action) => {
        const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)
        state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
        state.allData.push(restoredItem)
        state.garbage = searchNegara(state.allGarbage, state.params.query || '')
        state.data = searchNegara(state.allData, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
  }
})

export const { setSearchQuery } = appNegaraSlice.actions

export default appNegaraSlice.reducer
