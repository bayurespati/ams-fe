// views/apps/brand/BrandTable.js
import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import FormGroup from '@mui/material/FormGroup'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Import
import Icon from 'src/@core/components/icon'

// ** Custom Component Imports
import TableHeader from 'src/views/apps/brand/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Store Imports
import { fetchData, addData, editData, deleteData, restoreGarbage, setSearchQuery } from 'src/store/apps/brand'

const defaultColumns = [
  {
    flex: 0.15,
    field: 'name',
    minWidth: 240,
    headerName: 'Nama',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.name}</Typography>
  },
  {
    flex: 0.15,
    field: 'alias',
    minWidth: 240,
    headerName: 'Alias',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.alias}</Typography>
  }
]

const BrandTable = () => {
  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState({ id: '', name: '', alias: '' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')

  const dispatch = useDispatch()
  const store = useSelector(state => state.brand || { data: [], garbage: [] })

  const refreshData = () => dispatch(fetchData({ q: value }))

  useEffect(() => {
    refreshData()
  }, [dispatch, value])

  const handleFilter = useCallback(
    val => {
      setValue(val)
      dispatch(setSearchQuery({ query: val }))
    },
    [dispatch]
  )

  const handleTabChange = (event, newValue) => setTab(newValue)

  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleEdit = row => {
    setEditValue({ id: row.id, name: row.name, alias: row.alias })
    setEditDialogOpen(true)
  }

  const handleAddBrand = async newBrand => {
    try {
      await dispatch(addData(newBrand)).unwrap()
      toast.success('Brand berhasil ditambahkan!')
      refreshData()
    } catch (error) {
      toast.error('Gagal menambahkan brand')
    }
  }

  const handleEditBrand = async updatedBrand => {
    try {
      await dispatch(editData(updatedBrand)).unwrap()
      toast.success('Brand berhasil diubah!')
      refreshData()
    } catch (error) {
      toast.error('Gagal mengubah brand')
    }
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('Brand berhasil dihapus!')
      refreshData()
    } catch (error) {
      toast.error('Gagal menghapus brand')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreGarbage(id)).unwrap()
      toast.success('Brand berhasil dipulihkan!')
      refreshData()
    } catch (error) {
      toast.error('Gagal memulihkan brand')
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    handleEditBrand(editValue)
  }

  const columns = [
    ...defaultColumns,
    {
      flex: 0.15,
      field: 'actions',
      minWidth: 120,
      sortable: false,
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {tab === '1' ? (
            <>
              <Tooltip title='Edit'>
                <IconButton onClick={() => handleEdit(row)}>
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
            <Tooltip title='Pulihkan'>
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
            <CardHeader title='Daftar Brand' />
            <TabContext value={tab}>
              <TabList onChange={handleTabChange}>
                <Tab label='Aktif' value='1' />
                <Tab label='Dihapus' value='2' />
              </TabList>
              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddBrand={handleAddBrand} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
                  <DataGrid
                    autoHeight
                    rows={store.data}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableRowSelectionOnClick
                  />
                </Box>
              </TabPanel>
              <TabPanel value='2'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddBrand={handleAddBrand} />
                <Box sx={{ '& .super-app-theme--header': { backgroundColor: 'white' } }}>
                  <DataGrid
                    autoHeight
                    rows={store.garbage}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableRowSelectionOnClick
                  />
                </Box>
              </TabPanel>
            </TabContext>
          </Card>
        </Grid>
      </Grid>

      <Dialog maxWidth='sm' fullWidth onClose={handleDialogToggle} open={editDialogOpen}>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Typography variant='h5' component='div'>
            Edit Brand
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box component='form' onSubmit={onSubmit}>
            <FormGroup sx={{ mb: 2 }}>
              <CustomTextField
                fullWidth
                value={editValue.name}
                label='Nama Brand'
                placeholder='Masukkan Nama Brand'
                onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                sx={{ mb: 3 }}
              />
              <CustomTextField
                fullWidth
                value={editValue.alias}
                label='Alias Brand'
                placeholder='Masukkan Alias Brand'
                onChange={e => setEditValue({ ...editValue, alias: e.target.value })}
                sx={{ mb: 3 }}
              />
              <Button type='submit' variant='contained'>
                Update
              </Button>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BrandTable
