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
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Tooltip from '@mui/material/Tooltip'
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/kota/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions Imports
import { fetchData, addData, editData, setSearchQuery, deleteData, restoreGarbage } from 'src/store/apps/kota'

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

const KotaTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [editValue, setEditValue] = useState({ id: '', nama: '', alias: '' })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [tab, setTab] = useState('1')

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.kota)

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

  const handleEditPermission = row => {
    setEditValue({ id: row.id, nama: row.nama, alias: row.alias })
    setEditDialogOpen(true)
  }
  const handleDialogToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleAddKota = async newKota => {
    try {
      await dispatch(addData(newKota)).unwrap()
      toast.success('Kota berhasil ditambahkan!')
      dispatch(fetchData({ q: value })) // Refresh data
    } catch (error) {
      console.error('Gagal menambahkan Kota:', error)
      toast.error('Gagal menambahkan Kota!')
    }
  }

  const handleEditKota = async updatedKota => {
    try {
      await dispatch(editData(updatedKota)).unwrap()
      toast.success('Kota berhasil diedit!')
    } catch (error) {
      console.error('Gagal mengedit Kota:', error)
      toast.error('Gagal mengedit Kota!')
    }
    setEditDialogOpen(false)
  }

  const onSubmit = e => {
    const updatedKota = {
      nama: editValue.nama,
      alias: editValue.alias,
      id: editValue.id
    }

    handleEditKota(updatedKota)
    setEditDialogOpen(false)
    e.preventDefault()
  }

  //delete
  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('Kota berhasil dihapus!')
      dispatch(fetchData({ q: value })) // Refresh data
    } catch (error) {
      console.error('Gagal menghapus Kota:', error)
      toast.error('Gagal menghapus Kota!')
    }
  }

  const handleRestore = async id => {
    try {
      await dispatch(restoreGarbage(id)).unwrap()
      toast.success('Negara berhasil di restore!')
    } catch (error) {
      console.error('Gagal merestore negara:', error)
      toast.error('Gagal merestore negara!')
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
            <>
              <Tooltip arrow title='Aktifkan kembali'>
                <IconButton onClick={() => handleRestore(row.id)}>
                  <Icon icon='tabler:restore' />
                </IconButton>
              </Tooltip>
            </>
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
            <CardHeader title='Daftar Kota' />
            <TabContext value={tab}>
              <TabList onChange={handleTabChange} aria-label='simple tabs example'>
                <Tab value='1' label='Aktif' />
                <Tab value='2' label='Dihapus' />
              </TabList>
              <TabPanel value='1'>
                <TableHeader value={value} handleFilter={handleFilter} handleAddKota={handleAddKota} />
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
                <TableHeader value={value} handleFilter={handleFilter} handleAddKota={handleAddKota} />
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
            Edit Kota
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
                  value={editValue.nama}
                  label='Nama Kota'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  placeholder='Masukkan Nama Kota'
                  onChange={e => setEditValue({ ...editValue, nama: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  value={editValue.alias}
                  label='Nama Alias'
                  sx={{ mr: [0, 4], mb: [3, 5] }}
                  placeholder='Masukkan Nama Alias'
                  onChange={e => setEditValue({ ...editValue, alias: e.target.value })}
                />
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

export default KotaTable
