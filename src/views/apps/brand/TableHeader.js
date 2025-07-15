// views/apps/brand/TableHeader.js

import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const TableHeader = props => {
  const { value, handleFilter, handleAddBrand } = props

  const [open, setOpen] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [brandAlias, setBrandAlias] = useState('')

  const handleDialogToggle = () => setOpen(!open)

  const onSubmit = e => {
    e.preventDefault()
    const newBrand = { name: brandName, alias: brandAlias }
    handleAddBrand(newBrand)
    setOpen(false)
    setBrandName('')
    setBrandAlias('')
  }

  return (
    <>
      <Box
        sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <CustomTextField
          value={value}
          color={'secondary'}
          sx={{ mr: 4, mb: 2 }}
          placeholder='Cari Brand...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={handleDialogToggle}>
          Tambah Brand
        </Button>
      </Box>
      <Dialog fullWidth maxWidth='sm' onClose={handleDialogToggle} open={open}>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h3' sx={{ mb: 2 }}>
            Tambah Brand Baru
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            component='form'
            onSubmit={onSubmit}
            sx={{
              mt: 4,
              mx: 'auto',
              width: '100%',
              maxWidth: 360,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <CustomTextField
              fullWidth
              color={'secondary'}
              value={brandName}
              label='Nama Brand'
              sx={{ mb: [3, 5] }}
              placeholder='Masukkan Nama Brand'
              onChange={e => setBrandName(e.target.value)}
            />
            <CustomTextField
              fullWidth
              color={'secondary'}
              value={brandAlias}
              label='Nama Alias'
              sx={{ mb: [3, 5] }}
              placeholder='Masukkan Nama Alias'
              onChange={e => setBrandAlias(e.target.value)}
            />
            <Box className='demo-space-x'>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Button type='reset' variant='tonal' color='secondary' onClick={handleDialogToggle}>
                Batal
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TableHeader
