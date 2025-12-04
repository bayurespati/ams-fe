// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import MenuItem from '@mui/material/MenuItem'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const TableHeader = props => {
  const { value, handleFilter, handleAddRack } = props

  const [open, setOpen] = useState(false)
  const [codeRack, setCodeRack] = useState('')
  const [namaRack, setNamaRack] = useState('')
  const [lokasiRack, setLokasiRack] = useState('')
  const [kapasitasRack, setKapasitasRack] = useState('')
  const [statusRack, setStatusRack] = useState('active')
  const [keteranganRack, setKeteranganRack] = useState('')

  const handleDialogToggle = () => setOpen(!open)

  const resetForm = () => {
    setCodeRack('')
    setNamaRack('')
    setLokasiRack('')
    setKapasitasRack('')
    setStatusRack('active')
    setKeteranganRack('')
  }

  const onSubmit = e => {
    e.preventDefault()

    const newRack = {
      kode_rak: codeRack,
      nama_rak: namaRack,
      lokasi_rak: lokasiRack,
      kapasitas_rak: kapasitasRack,
      status_rak: statusRack,
      keterangan: keteranganRack
    }

    handleAddRack(newRack)
    setOpen(false)
    resetForm()
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
          placeholder='Cari Rack...'
          onChange={e => handleFilter(e.target.value)}
        />

        <Button sx={{ mb: 2 }} variant='contained' onClick={handleDialogToggle}>
          Tambah Rack
        </Button>
      </Box>

      <Dialog fullWidth maxWidth='sm' open={open} onClose={handleDialogToggle}>
        <DialogTitle
          component='div'
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h3' sx={{ mb: 2 }}>
            Tambah Rack Baru
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
              label='Kode Rack'
              value={codeRack}
              placeholder='Masukkan kode rack'
              sx={{ mb: 4 }}
              required
              onChange={e => setCodeRack(e.target.value)}
            />

            <CustomTextField
              fullWidth
              label='Nama Rack'
              value={namaRack}
              placeholder='Masukkan nama rack'
              sx={{ mb: 4 }}
              required
              onChange={e => setNamaRack(e.target.value)}
            />

            <CustomTextField
              fullWidth
              label='Lokasi Rack'
              value={lokasiRack}
              placeholder='Masukkan lokasi rack'
              sx={{ mb: 4 }}
              required
              onChange={e => setLokasiRack(e.target.value)}
            />

            <CustomTextField
              fullWidth
              label='Kapasitas Rack'
              value={kapasitasRack}
              placeholder='Masukkan kapasitas'
              sx={{ mb: 4 }}
              required
              type='number'
              onChange={e => setKapasitasRack(e.target.value)}
            />

            <CustomTextField
              fullWidth
              select
              label='Status Rack'
              value={statusRack}
              sx={{ mb: 4 }}
              onChange={e => setStatusRack(e.target.value)}
            >
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
              <MenuItem value='maintenance'>Maintenance</MenuItem>
            </CustomTextField>

            <CustomTextField
              fullWidth
              multiline
              label='Keterangan'
              value={keteranganRack}
              placeholder='Masukkan keterangan'
              sx={{ mb: 5 }}
              onChange={e => setKeteranganRack(e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleDialogToggle}>
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
