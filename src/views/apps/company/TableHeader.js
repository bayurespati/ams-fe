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
  // ** Props
  const { value, handleFilter, handleAddCompany } = props

  // ** State
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

    // Reset form
    setName('')
    setEmail('')
    setPhone('')
    setAddress('')
  }

  return (
    <>
      <Box
        sx={{ p: 5, pb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <CustomTextField
          value={value}
          color='secondary'
          sx={{ mr: 4, mb: 2 }}
          placeholder='Cari company...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={handleDialogToggle}>
          Tambah company
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
            Tambah company Baru
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
              color='secondary'
              value={name}
              label='Nama'
              sx={{ mb: 4 }}
              placeholder='Masukkan Nama'
              onChange={e => setName(e.target.value)}
            />
            <CustomTextField
              fullWidth
              color='secondary'
              value={email}
              label='Email'
              sx={{ mb: 4 }}
              placeholder='Masukkan Email'
              onChange={e => setEmail(e.target.value)}
            />
            <CustomTextField
              fullWidth
              color='secondary'
              value={phone}
              label='Telepon'
              sx={{ mb: 4 }}
              placeholder='Masukkan Nomor Telepon'
              onChange={e => setPhone(e.target.value)}
            />
            <CustomTextField
              fullWidth
              color='secondary'
              value={address}
              label='Alamat'
              sx={{ mb: 5 }}
              placeholder='Masukkan Alamat'
              onChange={e => setAddress(e.target.value)}
            />

            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important' } }}>
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
