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
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Actions Imports
import { fetchData, addData, editData, deleteData, setSearchQuery } from 'src/store/apps/plan'
import { fetchData as fetchVariety } from 'src/store/apps/variety'
import { fetchData as fetchType } from 'src/store/apps/type'
import TableHeader from 'src/views/apps/plan/TableHeader'
import { useRouter } from 'next/router'

// ** Styled Component
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'

const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const defaultColumns = [
  {
    flex: 0.15,
    field: 'judul',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'Judul',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.judul}</Typography>
  },
  {
    flex: 0.15,
    field: 'no_prpo',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'no prpo',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_prpo}</Typography>
  },
  {
    flex: 0.15,
    field: 'nama_barang',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'nama_barang',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.nama_barang}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 290,
    field: 'jumlah_barang',
    headerClassName: 'super-app-theme--header',
    headerName: 'jumlah_barang',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.jumlah_barang}</Typography>
  }
]

const PlanTable = () => {
  const router = useRouter()

  // ** State
  const [value, setValue] = useState('')

  const [editValue, setEditValue] = useState({
    judul: '',
    nama_barang: '',
    tipe_barang_id: '',
    jenis_barang_id: '',
    jumlah_barang: '',
    no_prpo: '',
    project_id: '',
    file_prpo: '',
    is_lop: 1,
    id: ''
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [filePrpo, setFilePrpo] = useState([])

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.plan)
  const variety = useSelector(state => state.variety)
  const type = useSelector(state => state.type)

  useEffect(() => {
    dispatch(
      fetchData({
        q: value
      })
    )
  }, [dispatch, value])

  const handleFilter = useCallback(
    val => {
      setValue(val)
      dispatch(setSearchQuery({ query: val }))
    },
    [dispatch]
  )

  const handleEditPlan = async data => {
    try {
      await dispatch(editData(data)).unwrap()
      toast.success('Plan berhasil diedit!')
    } catch (error) {
      console.error('Gagal mengedit plan:', error)
      toast.error('Gagal mengedit plan!')
    }
    setEditDialogOpen(false)
  }

  const handleDialogToggle = row => {
    setEditValue({
      judul: row.judul,
      nama_barang: row.nama_barang,
      tipe_barang_id: row.tipe_barang_id,
      jenis_barang_id: row.jenis_barang_id,
      jumlah_barang: row.jumlah_barang,
      no_prpo: row.no_prpo,
      project_id: row.project_id,
      is_lop: 1,
      id: row.id
    })
    dispatch(
      fetchVariety({
        q: value
      })
    )
    dispatch(
      fetchType({
        q: value
      })
    )

    setEditDialogOpen(!editDialogOpen)
  }

  const onSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('_method', 'PATCH')
    for (const key in editValue) {
      formData.append(key, editValue[key])
    }

    // Logika update plan
    handleEditPlan(formData)
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      const result = await dispatch(deleteData(id)).unwrap()
      toast.success('Plan berhasil dihapus!')
      window.location.reload()
    } catch (error) {
      console.error('Gagal menghapus Plan:', error)
      toast.error('Gagal menghapus Plan!')
    }
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
          <IconButton onClick={() => handleDialogToggle(row)}>
            <Icon icon='tabler:edit' />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)}>
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
            <CardHeader title='Daftar Plan' />

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

      <Dialog maxWidth='md' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DropzoneWrapper>
          <DialogTitle
            sx={{
              textAlign: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Typography variant='h5' component='span' sx={{ mb: 2 }}>
              Edit Plan
            </Typography>
          </DialogTitle>
          <DialogContent
            sx={{
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Box component='form' onSubmit={onSubmit}>
              <FormGroup sx={{ mb: 2, flexDirection: 'column', flexWrap: ['wrap', 'nowrap'] }}>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.judul}
                    label='Judul'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, judul: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.nama_barang}
                    label='Nama Aset'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    placeholder='Masukkan Nama Plan'
                    onChange={e => setEditValue({ ...editValue, nama_barang: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomAutocomplete
                    fullWidth
                    color={'secondary'}
                    value={variety.data.find(option => option.id === editValue.jenis_barang_id) || null}
                    options={variety.data}
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    getOptionLabel={option => option.nama || ''}
                    onChange={(e, value) => setEditValue({ ...editValue, jenis_barang_id: value.id })}
                    renderInput={params => (
                      <CustomTextField
                        placeholder='Printer'
                        {...params}
                        label='Jenis Aset'

                        // error={Boolean(errors.jenis_barang_id)}
                        // {...(errors.jenis_barang_id && { helperText: 'This field is required' })}
                      />
                    )}
                  />
                  {/* <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.jenis_barang_id}
                    label='Jenis Aset'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, jenis_barang_id: e.target.value })}
                  /> */}
                </Grid>

                <Grid item xs={12}>
                  <CustomAutocomplete
                    fullWidth
                    color={'secondary'}
                    value={type.data.find(option => option.id === editValue.tipe_barang_id) || null}
                    options={type.data}
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    getOptionLabel={option => option.nama || ''}
                    onChange={(e, value) => setEditValue({ ...editValue, tipe_barang_id: value.id })}
                    renderInput={params => (
                      <CustomTextField
                        placeholder='Printer'
                        {...params}
                        label='Tipe Aset'

                        // error={Boolean(errors.jenis_barang_id)}
                        // {...(errors.jenis_barang_id && { helperText: 'This field is required' })}
                      />
                    )}
                  />
                  {/* <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.tipe_barang_id}
                    label='Tipe Aset'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, tipe_barang_id: e.target.value })}
                  /> */}
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.jumlah_barang}
                    label='Jumlah Aset'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, jumlah_barang: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.project_id}
                    label='Proyek'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, project_id: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.no_prpo}
                    label='No. PRPO'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, no_prpo: e.target.value })}
                  />
                </Grid>

                <Button type='submit' variant='contained' sx={{ mt: 4 }}>
                  Update
                </Button>
              </FormGroup>
              {/* <FormControlLabel control={<Checkbox />} label='Set as core permission' /> */}
            </Box>
          </DialogContent>
        </DropzoneWrapper>
      </Dialog>
    </>
  )
}

export default PlanTable
