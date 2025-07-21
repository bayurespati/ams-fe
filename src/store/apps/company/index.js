import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Helper to replace uuid with id
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

// Define base URL from env
const BASE_URL = process.env.NEXT_PUBLIC_AMS_URL

// Async Thunks
export const fetchCompany = createAsyncThunk('appCompany/fetchCompany', async params => {
  const [response, response2] = await Promise.all([
    axios.get(`${BASE_URL}companies`, { params }),
    axios.get(`${BASE_URL}companies/garbage`, { params })
  ])

  const data = replaceUuidWithId(response.data.data)
  const garbage = replaceUuidWithId(response2.data.data)

  return { data, garbage, params }
})

export const addCompany = createAsyncThunk('appCompany/addCompany', async newCompany => {
  const response = await axios.post(`${BASE_URL}companies`, newCompany)
  const data = replaceSingleUuidWithId(response.data.data)
  
  return data
})

export const editCompany = createAsyncThunk('appCompany/editCompany', async updatedCompany => {
  const response = await axios.patch(`${BASE_URL}companies`, updatedCompany)
  const data = replaceSingleUuidWithId(response.data.data)

  return data
})

export const deleteCompany = createAsyncThunk('appCompany/deleteCompany', async id => {
  const response = await axios.delete(`${BASE_URL}companies`, { data: { id } })

  return { message: response.data.message, id }
})

export const restoreCompany = createAsyncThunk('appCompany/restoreCompany', async id => {
  const response = await axios.patch(`${BASE_URL}companies/restore`, { id })

  return { message: response.data.message, id }
})

// Search filter
const searchCompany = (data, query) => {
  const queryLowered = query.toLowerCase()

  return data.filter(
    company =>
      company.name.toLowerCase().includes(queryLowered) ||
      company.email.toLowerCase().includes(queryLowered) ||
      company.phone.toLowerCase().includes(queryLowered) ||
      company.address.toLowerCase().includes(queryLowered)
  )
}

// Slice
export const appCompanySlice = createSlice({
  name: 'appCompany',
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
      state.data = searchCompany(state.allData, query)
      state.garbage = searchCompany(state.allGarbage, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchCompany.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length
      state.data = searchCompany(state.allData, action.payload.params.q)
      state.allGarbage = action.payload.garbage
      state.garbage = searchCompany(state.allGarbage, action.payload.params.q)
      state.totalGarbage = action.payload.garbage.length
    })
    builder
      .addCase(addCompany.fulfilled, (state, action) => {
        if (action.payload) {
          state.data.push(action.payload)
        } else {
          console.error('Add data payload is undefined')
        }
      })
      .addCase(editCompany.fulfilled, (state, action) => {
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
      .addCase(deleteCompany.fulfilled, (state, action) => {
        const deletedItem = state.allData.find(item => item.id === action.payload.id)
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.allGarbage.push(deletedItem)
        state.data = searchCompany(state.allData, state.params.query || '')
        state.garbage = searchCompany(state.allGarbage, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
      .addCase(restoreCompany.fulfilled, (state, action) => {
        const restoredItem = state.allGarbage.find(item => item.id === action.payload.id)
        state.allGarbage = state.allGarbage.filter(item => item.id !== action.payload.id)
        state.allData.push(restoredItem)
        state.garbage = searchCompany(state.allGarbage, state.params.query || '')
        state.data = searchCompany(state.allData, state.params.query || '')
        state.total = state.allData.length
        state.totalGarbage = state.allGarbage.length
      })
  }
})

// Export actions + reducer
export const { setSearchQuery } = appCompanySlice.actions

export default appCompanySlice.reducer
