// ** React Imports
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
  const { value, handleFilter, handleAddCompany } = props

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleDialogToggle = () => setOpen(!open)

  const onSubmit = e => {
    e.preventDefault()

    const newCompany = { name, email, phone, address }
    handleAddCompany(newCompany)
    setOpen(false)

    // Clear form
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
  }

  return (
    <>
      <Box sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <CustomTextField
          value={value}
          color='secondary'
          sx={{ mr: 4, mb: 2 }}
          placeholder='Cari Company...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={handleDialogToggle}>
          Tambah Company
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
            Tambah Company Baru
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
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <CustomTextField
              fullWidth
              label='Nama'
              placeholder='Masukkan Nama Company'
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Email'
              placeholder='Masukkan Email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Telepon'
              placeholder='Masukkan Nomor Telepon'
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Alamat'
              placeholder='Masukkan Alamat'
              value={address}
              onChange={e => setAddress(e.target.value)}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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
