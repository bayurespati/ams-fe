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
import TableHeader from 'src/views/apps/negara/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions Imports
import { fetchData, addData, editData, setSearchQuery, deleteData, restoreGarbage } from 'src/store/apps/negara'

const defaultColumns = [
  {
    flex: 0.15,
    field: 'nama',
    headerClassName: 'super-app-theme--header',
    minWidth: 240,
    headerName: 'Nama',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.nama}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 290,
    field: 'alias',
    headerClassName: 'super-app-theme--header',
    headerName: 'Alias',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.alias}</Typography>
  }
]

const NegaraTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState({ id: '', nama: '', alias: '' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.negara)

  // Helper untuk refresh data dari backend
  const refreshData = () => {
    dispatch(fetchData({ q: value }))
  }

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

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleEditPermission = row => {
    setEditValue({ id: row.id, nama: row.nama, alias: row.alias })
    setEditDialogOpen(true)
  }

  const handleAddNegara = async newNegara => {
    try {
      await dispatch(addData(newNegara)).unwrap()
      toast.success('Negara berhasil ditambahkan!')
      refreshData()
    } catch (error) {
      console.error('Gagal menambahkan negara:', error)
      toast.error('Gagal menambahkan negara!')
    }
  }

  const handleEditNegara = async updatedNegara => {
    try {
      await dispatch(editData(updatedNegara)).unwrap()
      toast.success('Negara berhasil diedit!')
      refreshData()
    } catch (error) {
      console.error('Gagal mengedit negara:', error)
      toast.error('Gagal mengedit negara!')
    }
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('Negara berhasil dihapus!')
      refreshData()
    } catch (error) {
      console.error('Gagal menghapus negara:', error)
      toast.error('Gagal menghapus negara!')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreGarbage(id)).unwrap()
      toast.success('Negara berhasil di-restore!')
      refreshData()
    } catch (error) {
      console.error('Gagal merestore negara:', error)
      toast.error('Gagal merestore negara!')
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    const updatedNegara = {
      nama: editValue.nama,
      alias: editValue.alias,
      id: editValue.id
    }
    handleEditNegara(updatedNegara)
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
            <CardHeader title='Daftar Negara' />
            <TabContext value={tab}>
              <TabList onChange={handleTabChange} aria-label='simple tabs example'>
                <Tab value='1' label='Aktif' />
                <Tab value='2' label='Dihapus' />
              </TabList>
              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddNegara={handleAddNegara} />
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
              </TabPanel>
              <TabPanel value='2'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddNegara={handleAddNegara} />
                <Box
                  sx={{
                    '& .super-app-theme--header': {
                      backgroundColor: 'white'
                    }
                  }}
                >
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
        <DialogTitle
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Edit Negara
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
                  color='secondary'
                  value={editValue.nama}
                  label='Nama Negara'
                  placeholder='Masukkan Nama Negara'
                  onChange={e => setEditValue({ ...editValue, nama: e.target.value })}
                  sx={{ mb: [3, 5] }}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color='secondary'
                  value={editValue.alias}
                  label='Nama Alias'
                  placeholder='Masukkan Nama Alias'
                  onChange={e => setEditValue({ ...editValue, alias: e.target.value })}
                  sx={{ mb: [3, 5] }}
                />
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

export default NegaraTable
