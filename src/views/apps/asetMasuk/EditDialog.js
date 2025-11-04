// ** React Imports
import React, { useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'

// ** Redux Imports
import { useSelector, useDispatch } from 'react-redux'
import { fetchCompany } from 'src/store/apps/company'
import { editData } from 'src/store/apps/item-doin'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const EditDialog = ({ setOpen, open, item, setItem }) => {
  const dispatch = useDispatch()

  // Ambil data perusahaan dari Redux
  const companies = useSelector(state => state.company.data || [])

  // Fetch data perusahaan ketika dialog dibuka
  useEffect(() => {
    if (open) {
      dispatch(fetchCompany())
    }
  }, [dispatch, open])

  // Submit edit item
  const onSubmit = async e => {
    e.preventDefault()

    // bentuk payload hanya field yang dibutuhkan
    const payload = {
      id: item.id,
      nama_barang: item.nama_barang,
      sn: item.sn,
      jumlah: Number(item.jumlah),
      owner_id: item.owner_id || item.owner?.id || null
    }

    try {
      const response = await dispatch(editData(payload)).unwrap()
      setOpen(false)
      toast.success(response.message || 'Item berhasil diedit')
    } catch (err) {
      toast.error('Gagal mengedit item')
      console.error(err)
    }
  }

  return (
    <Dialog fullWidth maxWidth='sm' onClose={() => setOpen(false)} open={open}>
      <DialogTitle
        component='div'
        sx={{
          textAlign: 'center',
          px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <Typography variant='h3' sx={{ mb: 2 }}>
          Edit Item
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
          {/* Nama Barang */}
          <CustomTextField
            fullWidth
            color='secondary'
            label='Nama Barang'
            placeholder='Masukkan Nama Barang'
            value={item.nama_barang || ''}
            onChange={e => setItem({ ...item, nama_barang: e.target.value })}
          />

          {/* Serial Number */}
          <CustomTextField
            fullWidth
            color='secondary'
            label='Serial Number'
            placeholder='Masukkan Serial Number'
            value={item.sn || ''}
            onChange={e => setItem({ ...item, sn: e.target.value })}
          />

          {/* Jumlah */}
          <CustomTextField
            fullWidth
            color='secondary'
            label='Jumlah'
            placeholder='Masukkan Jumlah'
            value={item.jumlah || ''}
            onChange={e => setItem({ ...item, jumlah: e.target.value })}
          />

          {/* Owner (ambil dari company list) */}
          <Grid item xs={12}>
            <Autocomplete
              options={companies || []}
              getOptionLabel={option => option.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value?.id || option.id === value?.id}
              value={
                item.owner
                  ? companies.find(
                      c => c.id === item.owner?.id || c.id === item.owner?.id || c.name === item.owner?.name
                    ) || null
                  : null
              }
              onChange={(e, newValue) => {
                setItem({
                  ...item,
                  owner_id: newValue ? newValue.id || newValue.id : null,
                  owner: newValue
                    ? {
                        id: newValue.id || newValue.id,
                        name: newValue.name,
                        address: newValue.address,
                        email: newValue.email,
                        phone: newValue.phone
                      }
                    : null
                })
              }}
              renderInput={params => <CustomTextField {...params} label='Owner' placeholder='Pilih Owner' fullWidth />}
            />
          </Grid>

          {/* Tombol Aksi */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button type='submit' variant='contained'>
              Simpan
            </Button>
            <Button type='button' variant='tonal' color='secondary' onClick={() => setOpen(false)}>
              Batal
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog
