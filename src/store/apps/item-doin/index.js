import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchData = createAsyncThunk('appItemDoIn/fetchData', async params => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, {
    params
  })

  return { data: response.data.data, params }
})

export const addData = createAsyncThunk('appItemDoIn/addData', async newDoIn => {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, newDoIn, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
})

export const editData = createAsyncThunk('appItemDoIn/editData', async updatedItem => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, {
    id: updatedItem.id,
    jumlah: updatedItem.jumlah,
    sn: updatedItem.sn
  })

  return response.data
})

export const verifyData = createAsyncThunk('appItemDoIn/verifyData', async data => {
  const response = await axios.patch(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in/verification`, {
    id: data.id,
    do_in_id: data.do_in_id
  })

  return response.data
})

export const deleteData = createAsyncThunk('appItemDoIn/deleteData', async id => {
  const response = await axios.delete(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, { data: { id: id } })

  return { message: response.data.message, id }
})

const searchItemDoIn = (data, query) => {
  const queryLowered = query.toLowerCase()
  const tes = data.filter(item => item.do_in_id.includes(queryLowered))

  return tes

  // return data.filter(
  //   item => item.do_in_id.toLowerCase().includes(queryLowered) || item.id.toLowerCase().includes(queryLowered)
  // )

  // return data.filter(doIn => doIn.do_in_id.toLowerCase().includes(queryLowered))
}

export const appItemDoInSlice = createSlice({
  name: 'appItemDoIn',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    setSearchQuery: (state, action) => {
      const { query } = action.payload
      state.data = searchItemDoIn(state.data, query)
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.params = action.payload.params
      state.allData = action.payload.data
      state.total = action.payload.data.length

      state.data = searchItemDoIn(state.allData, action?.payload?.params?.q)
    })
    builder
    builder
      .addCase(addData.fulfilled, (state, action) => {
        state.params = action.payload.params
        state.allData = action.payload.data
        state.total = action.payload.data.length
        state.data = searchItemDoIn(state.allData, action.payload.params.query)

        // if (action.payload && state && state.params) {
        //   state.allData.push(action.payload.data)
        //   state.data = searchItemDoIn(state.allData, state.params.query || '')
        //   state.total = state.allData.length
        // } else {
        //   console.error('Add data payload is undefined')
        // }
      })
      .addCase(editData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.allData = state.allData.filter(item => item.id !== action.payload.id)
        state.data = searchItemDoIn(state.allData, state.params.query || '')
        state.total = state.allData.length
      })
      .addCase(verifyData.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.data.id)
        if (index !== -1) {
          state.data[index] = action.payload.data
        }
      })
  }
})

export const { setSearchQuery } = appItemDoInSlice.actions

export default appItemDoInSlice.reducer
