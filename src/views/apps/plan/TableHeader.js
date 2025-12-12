// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const TableHeader = props => {
  // ** Props
  const { value, handleFilter } = props
  const router = useRouter()

  return (
    <>
      <Box
        sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <CustomTextField
          value={value}
          color={'secondary'}
          sx={{ mr: 4, mb: 2 }}
          placeholder='Cari...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={() => router.push('/plan/form/')}>
          Tambah Plan
        </Button>
      </Box>
    </>
  )
}

export default TableHeader
