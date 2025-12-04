// src/views/apps/rack/RackTable.jsx
// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import toast from 'react-hot-toast'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions
import { fetchData, addData, editData, deleteData, restoreGarbage, setSearchQuery } from 'src/store/apps/rack'

// ----------------------------
// Internal TableHeader
// ----------------------------
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

// ----------------------------
// RackTable utama
// ----------------------------
const defaultColumns = [
  {
    flex: 0.15,
    field: 'kode_rak',
    headerName: 'Kode Rak',
    minWidth: 140,
    renderCell: ({ row }) => <Typography>{row.kode_rak}</Typography>
  },
  {
    flex: 0.2,
    field: 'nama_rak',
    headerName: 'Nama Rak',
    minWidth: 200,
    renderCell: ({ row }) => <Typography>{row.nama_rak}</Typography>
  },
  {
    flex: 0.2,
    field: 'lokasi_rak',
    headerName: 'Lokasi',
    minWidth: 180,
    renderCell: ({ row }) => <Typography>{row.lokasi_rak}</Typography>
  },
  {
    flex: 0.1,
    field: 'kapasitas_rak',
    headerName: 'Kapasitas',
    minWidth: 120,
    renderCell: ({ row }) => <Typography>{row.kapasitas_rak}</Typography>
  },
  {
    flex: 0.12,
    field: 'status_rak',
    headerName: 'Status',
    minWidth: 140,
    renderCell: ({ row }) => <Typography>{row.status_rak}</Typography>
  },
  {
    flex: 0.25,
    field: 'keterangan',
    headerName: 'Keterangan',
    minWidth: 220,
    renderCell: ({ row }) => <Typography>{row.keterangan}</Typography>
  }
]

const RackTable = () => {
  const [value, setValue] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')

  const [editValue, setEditValue] = useState({
    id: '',
    kode_rak: '',
    nama_rak: '',
    lokasi_rak: '',
    kapasitas_rak: '',
    status_rak: '',
    keterangan: ''
  })

  const dispatch = useDispatch()
  const store = useSelector(state => state.rack)

  useEffect(() => {
    dispatch(fetchData({ q: value }))
  }, [dispatch, value])

  const handleFilter = useCallback(
    val => {
      setValue(val)
      dispatch(setSearchQuery({ query: val }))
    },
    [dispatch]
  )

  const handleTabChange = (e, newValue) => setTab(newValue)

  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleEditRack = row => {
    setEditValue({ ...row })
    setEditDialogOpen(true)
  }

  const handleAddRack = async rack => {
    try {
      await dispatch(addData(rack)).unwrap()
      toast.success('Rack berhasil ditambahkan!')
      dispatch(fetchData({ q: value }))
    } catch {
      toast.error('Gagal menambahkan rack!')
    }
  }

  const handleEditRackSubmit = async updatedRack => {
    try {
      await dispatch(editData(updatedRack)).unwrap()
      toast.success('Rack berhasil diperbarui!')
      dispatch(fetchData({ q: value }))
    } catch {
      toast.error('Gagal mengupdate rack!')
    }
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('Rack dihapus!')
      dispatch(fetchData({ q: value }))
    } catch {
      toast.error('Gagal menghapus rack!')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreGarbage(id)).unwrap()
      toast.success('Rack direstore!')
      dispatch(fetchData({ q: value }))
    } catch {
      toast.error('Gagal merestore rack!')
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    handleEditRackSubmit({ ...editValue })
  }

  const columns = [
    ...defaultColumns,
    {
      flex: 0.15,
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {tab === '1' ? (
            <>
              <Tooltip title='Edit'>
                <IconButton onClick={() => handleEditRack(row)}>
                  <Icon icon='tabler:edit' />
                </IconButton>
              </Tooltip>

              <Tooltip title='Hapus'>
                <IconButton onClick={() => handleDelete(row.id)}>
                  <Icon icon='tabler:trash' />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title='Restore'>
              <IconButton onClick={() => handleRestore(row.id)}>
                <Icon icon='tabler:restore' />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Daftar Rack' />

            <TabContext value={tab}>
              <TabList onChange={handleTabChange}>
                <Tab value='1' label='Aktif' />
                <Tab value='2' label='Dihapus' />
              </TabList>

              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddRack={handleAddRack} />

                <DataGrid
                  autoHeight
                  rows={store.data}
                  columns={columns}
                  getRowId={row => row.id}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  disableRowSelectionOnClick
                />
              </TabPanel>

              <TabPanel value='2'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddRack={handleAddRack} />

                <DataGrid
                  autoHeight
                  rows={store.garbage}
                  columns={columns}
                  getRowId={row => row.id}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  disableRowSelectionOnClick
                />
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Edit */}
      <Dialog open={editDialogOpen} onClose={handleDialogToggle} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Rack</DialogTitle>

        <DialogContent>
          <Box component='form' onSubmit={onSubmit}>
            <FormGroup sx={{ mb: 2 }}>
              <CustomTextField
                fullWidth
                label='Kode Rack'
                value={editValue.kode_rak}
                onChange={e => setEditValue({ ...editValue, kode_rak: e.target.value })}
                sx={{ mb: 4 }}
              />

              <CustomTextField
                fullWidth
                label='Nama Rack'
                value={editValue.nama_rak}
                onChange={e => setEditValue({ ...editValue, nama_rak: e.target.value })}
                sx={{ mb: 4 }}
              />

              <CustomTextField
                fullWidth
                label='Lokasi Rack'
                value={editValue.lokasi_rak}
                onChange={e => setEditValue({ ...editValue, lokasi_rak: e.target.value })}
                sx={{ mb: 4 }}
              />

              <CustomTextField
                fullWidth
                label='Kapasitas Rack'
                type='number'
                value={editValue.kapasitas_rak}
                onChange={e => setEditValue({ ...editValue, kapasitas_rak: e.target.value })}
                sx={{ mb: 4 }}
              />

              <CustomTextField
                fullWidth
                select
                label='Status Rack'
                value={editValue.status_rak}
                onChange={e => setEditValue({ ...editValue, status_rak: e.target.value })}
                sx={{ mb: 4 }}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='maintenance'>Maintenance</MenuItem>
              </CustomTextField>

              <CustomTextField
                fullWidth
                label='Keterangan'
                multiline
                value={editValue.keterangan}
                onChange={e => setEditValue({ ...editValue, keterangan: e.target.value })}
                sx={{ mb: 4 }}
              />

              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button type='submit' variant='contained'>
                  Update
                </Button>
                <Button variant='tonal' color='secondary' onClick={handleDialogToggle}>
                  Batal
                </Button>
              </Box>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RackTable
