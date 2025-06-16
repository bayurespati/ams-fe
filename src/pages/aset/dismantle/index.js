// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { CardContent, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AlertTitle from '@mui/material/AlertTitle'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import { DataGrid } from '@mui/x-data-grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/perbaikan/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions Imports
import { fetchData } from 'src/store/apps/negara'

const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const defaultColumns = [
  {
    flex: 0.15,
    field: 'no_kontrak',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'No. Kontrak',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_kontrak}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'no_do',
    headerClassName: 'super-app-theme--header',
    headerName: 'No. DO',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_do}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'plan',
    headerClassName: 'super-app-theme--header',
    headerName: 'Plan',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.Plan}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'tipe',
    headerClassName: 'super-app-theme--header',
    headerName: 'Tipe',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tipe}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'Tgl_Rusak',
    headerClassName: 'super-app-theme--header',
    headerName: 'Tgl Rusak',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tgl_Rusak}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'lokasi_gudang',
    headerClassName: 'super-app-theme--header',
    headerName: 'lokasi gudang',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.lokasi_gudang}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 290,
    field: 'managed by',
    headerClassName: 'super-app-theme--header',
    headerName: 'Managed By',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.managed_by}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'no_gr',
    headerClassName: 'super-app-theme--header',
    headerName: 'no GR',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_gr}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'file-evidence',
    headerClassName: 'super-app-theme--header',
    headerName: 'File Evidence',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.file_evidence}</Typography>
  }
]

const DismantleTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.negara)

  useEffect(() => {
    dispatch(
      fetchData({
        q: value
      })
    )
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleEditPermission = name => {
    setEditValue(name)
    setEditDialogOpen(true)
  }
  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const onSubmit = e => {
    setEditDialogOpen(false)
    e.preventDefault()
  }

  const columns = [
    ...defaultColumns,
    {
      flex: 0.15,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerClassName: 'super-app-theme--header',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => handleEditPermission(row.name)}>
            <Icon icon='tabler:edit' />
          </IconButton>
          <IconButton>
            <Icon icon='tabler:trash' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Daftar Aset yang bisa Di-Dismantle' />

            <CardContent>
              <TableHeader value={value} handleFilter={handleFilter} />
              <Box
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: 'white'
                  }
                }}
              >
                <DataGrid
                  autoHeight
                  rows={store.data}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog maxWidth='sm' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DialogTitle
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Edit Do In
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          {/* <Alert severity='warning' sx={{ maxWidth: '500px' }}>
            <AlertTitle>Warning!</AlertTitle>
            By editing the permission name, you might break the system permissions functionality. Please ensure you're
            absolutely certain before proceeding.
          </Alert> */}

          <Box component='form' onSubmit={onSubmit}>
            <FormGroup sx={{ mb: 2, flexDirection: 'column', flexWrap: ['wrap', 'nowrap'] }}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  // value={editValue}
                  label='No Kontrak'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  // placeholder=''
                  onChange={e => setEditValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  // value={editValue}
                  label='No DO'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  // placeholder='Rusakkan Nama Alias'
                  onChange={e => setEditValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  // value={editValue}
                  label='Plan'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  // placeholder='Rusakkan Nama Negara'
                  onChange={e => setEditValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  // value={editValue}
                  label='Lokasi Gudang'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  // placeholder='Rusakkan Nama Alias'
                  onChange={e => setEditValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <br></br>
                <ButtonStyled
                  component='label'
                  color='secondary'
                  variant='contained'
                  htmlFor='account-settings-upload-image'
                >
                  Upload File Evidence
                  <input
                    hidden
                    type='file'
                    // value={inputValue}
                    accept='image/png, image/jpeg'
                    // onChange={handleInputFileChange}
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
              </Grid>

              <Button type='submit' variant='contained' sx={{ mt: 4 }}>
                Update
              </Button>
            </FormGroup>
            {/* <FormControlLabel control={<Checkbox />} label='Set as core permission' /> */}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DismantleTable
