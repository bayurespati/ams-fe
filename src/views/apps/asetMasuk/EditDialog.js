// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { useDispatch } from 'react-redux'
import { editData } from 'src/store/apps/item-doin'
import toast from 'react-hot-toast'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

const EditDialog = ({ setOpen, open, item, setItem }) => {
  const dispatch = useDispatch()

  const onSubmit = async e => {
    e.preventDefault()
    try {
      const response = await dispatch(editData(item)).unwrap()
      setOpen(false)
      toast.success(response.message || 'Item Edited')
    } catch (err) {
      toast.error('Error Editing Item')
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
          onSubmit={e => onSubmit(e)}
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
            sx={{ mr: [0, 4], mb: [3, 5] }}
            color={'secondary'}
            label='Nama Item '
            value={item.nama_barang}
            inputProps={{ readOnly: true }}
          />
          <CustomTextField
            fullWidth
            color={'secondary'}
            value={item.sn}
            label='Serial Number'
            sx={{ mr: [0, 4], mb: [3, 5] }}
            placeholder='Masukkan Serial Number'
            onChange={e => setItem({ ...item, sn: e.target.value })}
          />

          <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important' } }}>
            <Button type='submit' variant='contained'>
              Submit
            </Button>
            <Button type='reset' variant='tonal' color='secondary' onClick={() => setOpen(false)}>
              Batal
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog
