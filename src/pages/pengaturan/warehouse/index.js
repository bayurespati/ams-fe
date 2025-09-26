import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
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
import Select from '@mui/material/Select'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import TableHeader from 'src/views/apps/warehouse/TableHeader'
import { fetchData, addData, editData, setSearchQuery, deleteData, restoreGarbage } from 'src/store/apps/warehouse'

const defaultColumns = (countriesMap, citiesMap) => [
  {
    flex: 0.2,
    field: 'name',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'Nama Warehouse',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.name}</Typography>
  },
  {
    flex: 0.3,
    field: 'address',
    headerClassName: 'super-app-theme--header',
    minWidth: 290,
    headerName: 'Alamat',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.address}</Typography>
  },
  {
    flex: 0.2,
    field: 'country_id',
    headerClassName: 'super-app-theme--header',
    minWidth: 150,
    headerName: 'Negara',
    renderCell: ({ row }) => (
      <Typography sx={{ color: 'text.secondary' }}>{countriesMap[row.country_id] || '-'}</Typography>
    )
  },
  {
    flex: 0.2,
    field: 'city_id',
    headerClassName: 'super-app-theme--header',
    minWidth: 150,
    headerName: 'Kota',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{citiesMap[row.city_id] || '-'}</Typography>
  }
]

const WarehouseTable = () => {
  const dispatch = useDispatch()
  const store = useSelector(state => state.warehouse)

  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState({ id: '', name: '', address: '', country_id: '', city_id: '' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  // Mapping ID -> Nama
  const countriesMap = {}
  countries.forEach(c => {
    countriesMap[c.uuid] = c.nama
  })
  const citiesMap = {}
  cities.forEach(c => {
    citiesMap[c.uuid] = c.nama
  })

  // Fetch warehouse + countries + cities
  const refreshData = useCallback(() => {
    dispatch(fetchData({ q: value }))
  }, [dispatch, value])

  useEffect(() => {
    // Fetch countries & cities
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}countries`).then(res => setCountries(res.data.data || []))
    axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}cities`).then(res => setCities(res.data.data || []))
    refreshData()
  }, [refreshData])

  const handleFilter = useCallback(
    val => {
      setValue(val)
      dispatch(setSearchQuery({ query: val }))
    },
    [dispatch]
  )

  const handleTabChange = (e, newVal) => setTab(newVal)
  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleEditPermission = row => {
    setEditValue({ ...row })
    setEditDialogOpen(true)
  }

  const handleAddWarehouse = async newWarehouse => {
    try {
      await dispatch(addData(newWarehouse)).unwrap()
      toast.success('Warehouse berhasil ditambahkan!')
      refreshData()
    } catch {
      toast.error('Gagal menambahkan warehouse!')
    }
  }

  const handleEditWarehouse = async updatedWarehouse => {
    if (!updatedWarehouse.id) return toast.error('ID warehouse kosong!')
    try {
      await dispatch(editData(updatedWarehouse)).unwrap()
      toast.success('Warehouse berhasil diedit!')
      refreshData()
    } catch {
      toast.error('Gagal mengedit warehouse!')
    }
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('Warehouse berhasil dihapus!')
      refreshData()
    } catch {
      toast.error('Gagal menghapus warehouse!')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreGarbage(id)).unwrap()
      toast.success('Warehouse berhasil di-restore!')
      refreshData()
    } catch {
      toast.error('Gagal merestore warehouse!')
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    handleEditWarehouse({ ...editValue })
  }

  const columns = [
    ...defaultColumns(countriesMap, citiesMap),
    {
      flex: 0.15,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerClassName: 'super-app-theme--header',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {tab === '1' ? (
            <>
              <Tooltip arrow title='Edit'>
                <IconButton onClick={() => handleEditPermission(row)}>
                  <Icon icon='tabler:edit' />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title='Hapus'>
                <IconButton onClick={() => handleDelete(row.id)}>
                  <Icon icon='tabler:trash' />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip arrow title='Aktifkan kembali'>
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
            <CardHeader title='Daftar Warehouse' />
            <TabContext value={tab}>
              <TabList onChange={handleTabChange} aria-label='simple tabs example'>
                <Tab value='1' label='Aktif' />
                <Tab value='2' label='Dihapus' />
              </TabList>
              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddWarehouse={handleAddWarehouse} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
                  <DataGrid
                    autoHeight
                    rows={store.allData}
                    columns={columns}
                    getRowId={row => row.id}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                  />
                </Box>
              </TabPanel>
              <TabPanel value='2'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddWarehouse={handleAddWarehouse} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
                  <DataGrid
                    autoHeight
                    rows={store.allGarbage}
                    columns={columns}
                    getRowId={row => row.id}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                  />
                </Box>
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Edit */}
      <Dialog maxWidth='sm' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography variant='h5'>Edit Warehouse</Typography>
        </DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={onSubmit}>
            <FormGroup sx={{ mb: 2, flexDirection: 'column' }}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color='secondary'
                  value={editValue.name}
                  label='Nama Warehouse'
                  placeholder='Masukkan Nama Warehouse'
                  onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <CustomTextField
                  fullWidth
                  color='secondary'
                  value={editValue.address}
                  label='Alamat'
                  placeholder='Masukkan Alamat Warehouse'
                  onChange={e => setEditValue({ ...editValue, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  Negara
                </Typography>
                <Select
                  fullWidth
                  value={editValue.country_id}
                  onChange={e => setEditValue({ ...editValue, country_id: e.target.value })}
                >
                  {countries.map(c => (
                    <MenuItem key={c.uuid} value={c.uuid}>
                      {c.nama}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  Kota
                </Typography>
                <Select
                  fullWidth
                  value={editValue.city_id}
                  onChange={e => setEditValue({ ...editValue, city_id: e.target.value })}
                >
                  {cities.map(c => (
                    <MenuItem key={c.uuid} value={c.uuid}>
                      {c.nama}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Button type='submit' variant='contained' sx={{ mt: 4 }}>
                Update
              </Button>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WarehouseTable
