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
  const { value, handleFilter, handleAddNegara } = props

  // ** State
  const [open, setOpen] = useState(false)
  const [negaraName, setNegaraName] = useState('')
  const [negaraAlias, setNegaraAlias] = useState('')

  const handleDialogToggle = () => setOpen(!open)

  const onSubmit = e => {
    e.preventDefault()

    const newNegara = {
      nama: negaraName,
      alias: negaraAlias
    }
    handleAddNegara(newNegara)
    setOpen(false)
    setNegaraName('')
    setNegaraAlias('')
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
          placeholder='Cari Negara...'
          onChange={e => handleFilter(e.target.value)}
        />
        <Button sx={{ mb: 2 }} variant='contained' onClick={handleDialogToggle}>
          Tambah Negara
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
            Tambah Negara Baru
          </Typography>
          {/* <Typography color='text.secondary'>Permissions you may use and assign to your users.</Typography> */}
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
            {/* <Grid item> */}
            <CustomTextField
              fullWidth
              color={'secondary'}
              value={negaraName}
              label='Nama Negara'
              sx={{ mr: [0, 4], mb: [3, 5] }}
              placeholder='Masukkan Nama Negara'
              onChange={e => setNegaraName(e.target.value)}
            />
            {/* </Grid>
            <Grid item> */}
            <CustomTextField
              fullWidth
              color={'secondary'}
              value={negaraAlias}
              label='Nama Alias'
              sx={{ mr: [0, 4], mb: [3, 5] }}
              placeholder='Masukkan Nama Alias'
              onChange={e => setNegaraAlias(e.target.value)}
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
