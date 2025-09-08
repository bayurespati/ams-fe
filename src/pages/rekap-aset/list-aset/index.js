// D:\AMS\ams-fe\src\pages\rekap-aset\list-aset\index.js

import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { CardContent, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

import TableHeaderAset from 'src/views/apps/aset-list/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

const defaultColumns = [
  {
    flex: 0.2,
    field: 'kode_aset',
    headerName: 'Kode Aset',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.kode_aset}</Typography>
  },
  {
    flex: 0.3,
    field: 'nama_aset',
    headerName: 'Nama Aset',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.nama_aset}</Typography>
  },
  {
    flex: 0.2,
    field: 'kategori',
    headerName: 'Kategori',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.kategori}</Typography>
  }
]

const ListAsetTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const [editValue, setEditValue] = useState({
    id: '',
    kode_aset: '',
    nama_aset: '',
    kategori: ''
  })

  const [newFile, setNewFile] = useState(null)

  // ** Hooks
  const dispatch = useDispatch()
  // const store = useSelector(state => state.rekapAset)

  useEffect(() => {
    // dispatch(fetchData({ q: value }))
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleDialogToggle = row => {
    if (row) {
      setEditValue(row)
    }
    setEditDialogOpen(true)
  }

  const handleDelete = id => {
    // dispatch(deleteData(id))
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (editValue.id) {
      // dispatch(editData(editValue))
    } else {
      // dispatch(addData(editValue))
    }
    setEditDialogOpen(false)
  }

  const handleUpload = e => {
    const file = e.target.files[0]
    if (file) {
      setNewFile(file)
    }
  }

  const columns = [
    ...defaultColumns,
    {
      flex: 0.25,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip arrow title='Edit'>
            <IconButton onClick={() => handleDialogToggle(row)}>
              <Icon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Hapus'>
            <IconButton onClick={() => handleDelete(row.id)}>
              <Icon icon='tabler:trash' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Daftar Aset' />
            <CardContent>
              <TableHeaderAset
                value={value}
                handleFilter={handleFilter}
                onAdd={() => handleDialogToggle(null)}
                onUpload={handleUpload}
              />
              <Box
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: 'white'
                  }
                }}
              >
                <DataGrid
                  autoHeight
                  rows={[
                    { id: 1, kode_aset: 'AST001', nama_aset: 'Laptop', kategori: 'Elektronik' },
                    { id: 2, kode_aset: 'AST002', nama_aset: 'Kursi', kategori: 'Furniture' }
                  ]}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  getRowId={row => row.id}
                  sx={{
                    backgroundColor: '#fff', // warna body tabel
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#fff', // warna header
                      color: '#000', // warna teks
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e0e0e0'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Tambah / Edit Aset */}
      <Dialog maxWidth='sm' fullWidth open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>{editValue.id ? 'Edit Aset' : 'Tambah Aset'}</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={handleSubmit}>
            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Kode Aset'
              value={editValue.kode_aset}
              onChange={e => setEditValue({ ...editValue, kode_aset: e.target.value })}
            />
            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Nama Aset'
              value={editValue.nama_aset}
              onChange={e => setEditValue({ ...editValue, nama_aset: e.target.value })}
            />
            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Kategori'
              value={editValue.kategori}
              onChange={e => setEditValue({ ...editValue, kategori: e.target.value })}
            />
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Batal</Button>
              <Button type='submit' variant='contained'>
                Simpan
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog Upload Excel */}
      <Dialog maxWidth='sm' fullWidth open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload File Excel</DialogTitle>
        <DialogContent>
          {newFile ? (
            <Typography>File terpilih: {newFile.name}</Typography>
          ) : (
            <Typography>Belum ada file terpilih.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Batal</Button>
          <Button variant='contained' disabled={!newFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ListAsetTable
