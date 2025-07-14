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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/company/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions Imports
import { fetchCompany, addCompany, editCompany, deleteCompany, restoreCompany, setSearchQuery } from 'src/store/apps/company'

const defaultColumns = [
  {
    flex: 0.15,
    field: 'name',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'Nama',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.name}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 240,
    field: 'email',
    headerClassName: 'super-app-theme--header',
    headerName: 'Email',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.email}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 180,
    field: 'phone',
    headerClassName: 'super-app-theme--header',
    headerName: 'Telepon',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.phone}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 240,
    field: 'address',
    headerClassName: 'super-app-theme--header',
    headerName: 'Alamat',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.address}</Typography>
  }
]

const CompanyTable = () => {
  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState({ id: '', name: '', email: '', phone: '', address: '' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')

  const dispatch = useDispatch()
  const store = useSelector(state => state.company)

  const refreshData = () => {
    dispatch(fetchCompany({ q: value }))
  }

  useEffect(() => {
    refreshData()
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
    dispatch(setSearchQuery({ query: val }))
  }, [dispatch])

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleEdit = row => {
    setEditValue({ id: row.id, name: row.name, email: row.email, phone: row.phone, address: row.address })
    setEditDialogOpen(true)
  }

  const handleAdd = async newData => {
    try {
      await dispatch(addCompany(newData)).unwrap()
      toast.success('Company berhasil ditambahkan!')
      refreshData()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menambahkan company!')
    }
  }

  const handleEditSubmit = async updatedData => {
    try {
      await dispatch(editCompany(updatedData)).unwrap()
      toast.success('Company berhasil diedit!')
      refreshData()
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengedit company!')
    }
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteCompany(id)).unwrap()
      toast.success('Company berhasil dihapus!')
      refreshData()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menghapus company!')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreCompany(id)).unwrap()
      toast.success('Company berhasil di-restore!')
      refreshData()
    } catch (error) {
      console.error(error)
      toast.error('Gagal merestore company!')
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    const updated = { ...editValue }
    handleEditSubmit(updated)
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
          {tab === '1' ? (
            <>
              <Tooltip arrow title='Edit'>
                <IconButton onClick={() => handleEdit(row)}>
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
            <CardHeader title='Daftar Company' />
            <TabContext value={tab}>
              <TabList onChange={handleTabChange} aria-label='simple tabs example'>
                <Tab value='1' label='Aktif' />
                <Tab value='2' label='Dihapus' />
              </TabList>
              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddCompany={handleAdd} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
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
              </TabPanel>
              <TabPanel value='2'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddCompany={handleAdd} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
                  <DataGrid
                    autoHeight
                    rows={store.garbage}
                    columns={columns}
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

      <Dialog maxWidth='sm' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={onSubmit}>
            <FormGroup>
              <CustomTextField label='Nama' fullWidth sx={{ mb: 4 }} value={editValue.name} onChange={e => setEditValue({ ...editValue, name: e.target.value })} />
              <CustomTextField label='Email' fullWidth sx={{ mb: 4 }} value={editValue.email} onChange={e => setEditValue({ ...editValue, email: e.target.value })} />
              <CustomTextField label='Telepon' fullWidth sx={{ mb: 4 }} value={editValue.phone} onChange={e => setEditValue({ ...editValue, phone: e.target.value })} />
              <CustomTextField label='Alamat' fullWidth sx={{ mb: 4 }} value={editValue.address} onChange={e => setEditValue({ ...editValue, address: e.target.value })} />
              <Button type='submit' variant='contained'>Simpan</Button>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CompanyTable
