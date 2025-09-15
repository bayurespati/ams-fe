import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Grid from '@mui/material/Grid'

import CustomTextField from 'src/@core/components/mui/text-field'
import axios from 'axios'

const TableHeader = ({ value, handleFilter, handleAddWarehouse }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('') // backend field: name
  const [address, setAddress] = useState('') // backend field: address
  const [countryId, setCountryId] = useState('')
  const [cityId, setCityId] = useState('')
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}countries`).then(res => {
      setCountries(res.data.data)
    })
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}cities`).then(res => {
      setCities(res.data.data)
    })
  }, [])

  const handleDialogToggle = () => setOpen(!open)

  const onSubmit = e => {
    e.preventDefault()

    const payload = {
      name, // sesuai backend
      address, // sesuai backend
      country_id: countryId,
      city_id: cityId
    }

    handleAddWarehouse(payload)
    setOpen(false)
    setName('')
    setAddress('')
    setCountryId('')
    setCityId('')
  }

  return (
    <>
      <Box sx={{ p: 5, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CustomTextField
          value={value}
          color='secondary'
          sx={{ mr: 4, mb: 2 }}
          placeholder='Cari Warehouse...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button variant='contained' onClick={handleDialogToggle} sx={{ mb: 2 }}>
          Tambah Warehouse
        </Button>
      </Box>

      <Dialog fullWidth maxWidth='sm' open={open} onClose={handleDialogToggle}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography variant='h5'>Tambah Warehouse Baru</Typography>
        </DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={onSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Nama Warehouse'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField fullWidth label='Alamat' value={address} onChange={e => setAddress(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Select fullWidth value={countryId} onChange={e => setCountryId(e.target.value)} displayEmpty>
                  <MenuItem value=''>
                    <em>Pilih Negara</em>
                  </MenuItem>
                  {countries.map(c => (
                    <MenuItem key={c.uuid} value={c.uuid}>
                      {c.nama}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Select fullWidth value={cityId} onChange={e => setCityId(e.target.value)} displayEmpty>
                  <MenuItem value=''>
                    <em>Pilih Kota</em>
                  </MenuItem>
                  {cities.map(c => (
                    <MenuItem key={c.uuid} value={c.uuid}>
                      {c.nama}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
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
