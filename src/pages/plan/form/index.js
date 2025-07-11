// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import { useDispatch, useSelector } from 'react-redux'
import FormValidationAsync from 'src/views/apps/plan/FormValidationAsync'
import { fetchData as fetchDataType } from 'src/store/apps/type'
import { fetchData as fetchDataVariety } from 'src/store/apps/variety'
import { useEffect } from 'react'

const Plan = () => {
  //** State */
  const [value, setValue] = useState('')
  const data_tipe_barang = useSelector(state => state.type.data)
  const data_jenis_barang = useSelector(state => state.variety.data)

  // ** Hooks
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      fetchDataType({
        q: value
      })
    )
    dispatch(
      fetchDataVariety({
        q: value
      })
    )
  }, [dispatch, value])

  return (
    <>
      <div role='presentation'>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/plan'>
            Plan
          </Link>
          {/* <Link underline='hover' color='inherit' href='/material-ui/getting-started/installation/'>
           Core
         </Link> */}
          <Typography color='inherit'>Create New Plan</Typography>
        </Breadcrumbs>
      </div>
      <FormValidationAsync data_tipe_barang={data_tipe_barang} data_jenis_barang={data_jenis_barang} />
    </>
  )
}

export default Plan
