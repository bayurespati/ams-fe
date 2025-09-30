import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'

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
import TextField from '@mui/material/TextField'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Store
import { fetchData, addData } from 'src/store/apps/label-aset'

import { MenuItem } from '@mui/material'
import axios from 'axios'

const defaultColumns = [
  {
    flex: 0.3,
    field: 'internal_order',
    headerName: 'Internal Order',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.internal_order}</Typography>
  },
  {
    flex: 0.3,
    field: 'id_asset',
    headerName: 'ID Asset',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.id_asset}</Typography>
  },
  {
    flex: 0.2,
    field: 'quantity',
    headerName: 'Quantity',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.quantity}</Typography>
  },
  {
    flex: 0.2,
    field: 'asset_labels_count',
    headerName: 'Verifikasi',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.asset_labels_count}</Typography>
  }
]

const LabelAsetTable = () => {
  const dispatch = useDispatch()
  const store = useSelector(state => state.appLabelAset)
  const router = useRouter()

  const [idAssetOptions, setIdAssetOptions] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 }) // default 50 rows
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formValue, setFormValue] = useState({
    internal_order: '',
    id_asset: '',
    quantity: '',
    asset_labels_count: '',
    description_label: ''
  })

  // 🔍 Search state
  const [searchTerm, setSearchTerm] = useState('')

  // State untuk upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchData())
  }, [dispatch])

  useEffect(() => {
    const fetchIdAssets = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}asset-recap/get-id-assets`)
        setIdAssetOptions(res.data.data || [])
      } catch (err) {
        console.error('Gagal fetch id_asset:', err)
      }
    }
    fetchIdAssets()
  }, [])

  const handleDialogToggle = () => {
    setFormValue({ internal_order: '', id_asset: '', quantity: '', asset_labels_count: '' })
    setDialogOpen(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await dispatch(addData(formValue)).unwrap()
      dispatch(fetchData())
      toast.success('Label Aset berhasil ditambahkan!')
      setDialogOpen(false)
    } catch (err) {
      console.error('❌ Gagal kirim data:', err)
      toast.error('Gagal menambahkan Label Aset! ❌')
    }
  }

  const handleDetailClick = row => {
    router.push(`/rekap-aset/label-aset/${row.id_asset}`)
  }

  const handleOpenUploadDialog = row => {
    setSelectedAsset(row.id_asset)
    setUploadFile(null)
    setUploadLoading(false)
    setUploadDialogOpen(true)
  }

  const [uploadErrorMessage, setUploadErrorMessage] = useState('')

  const handleUploadSubmit = async e => {
    e.preventDefault()

    if (!uploadFile) {
      setUploadErrorMessage('Pilih file Excel terlebih dahulu!')
      return
    }

    if (!selectedAsset) {
      setUploadErrorMessage('ID Asset tidak ditemukan!')
      return
    }

    setUploadLoading(true)
    setUploadErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('id_asset', selectedAsset)
      formData.append('file', uploadFile)

      const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.status === 200 || response.status === 201) {
        toast.success('File Excel berhasil diupload!')
        setUploadFile(null)
        setSelectedAsset(null)
        setUploadDialogOpen(false)
        dispatch(fetchData())
      } else {
        setUploadErrorMessage(response.data?.message || 'Upload gagal!')
        setUploadLoading(false)
      }
    } catch (error) {
      console.error('❌ Gagal upload file:', error)
      const backendMessage = error.response?.data?.message || ''
      if (backendMessage.toLowerCase().includes('quantity not match')) {
        setUploadErrorMessage('Jumlah baris pada file Excel melebihi kuantitas yang ditentukan.')
      } else {
        setUploadErrorMessage('Gagal mengupload file Excel!')
      }
      setUploadLoading(false)
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
          <Tooltip arrow title='Detail'>
            <IconButton onClick={() => handleDetailClick(row)}>
              <Icon icon='tabler:info-circle' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title='Upload Excel'>
            <IconButton onClick={() => handleOpenUploadDialog(row)}>
              <Icon icon='tabler:upload' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  // 🔍 Filter data berdasarkan search
  const filteredRows = store.data.filter(row =>
    Object.values(row).some(val => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Daftar Label Aset'
              action={
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {/* 🔍 Search bar */}
                  <TextField
                    size='small'
                    placeholder='Cari data...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 300 }} // lebih panjang
                  />

                  <Button
                    variant='contained'
                    onClick={handleDialogToggle}
                    sx={{ px: 2, py: 2.5 }} // lebih ramping daripada default
                  >
                    Tambah Label Aset
                  </Button>
                </Box>
              }
            />

            <CardContent>
              <Box>
                <DataGrid
                  autoHeight
                  rows={filteredRows}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSize={50}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[25, 50]}
                  getRowId={row => row.id_asset}
                  sx={{
                    backgroundColor: '#fff',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#fff',
                      color: '#000',
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

      {/* Dialog Tambah */}
      <Dialog maxWidth='sm' fullWidth open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Tambah Data Aset</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={handleSubmit}>
            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Internal Order'
              value={formValue.internal_order}
              onChange={e => setFormValue({ ...formValue, internal_order: e.target.value })}
            />

            <CustomTextField
              select
              fullWidth
              sx={{ mb: 4 }}
              label='ID Asset'
              value={formValue.id_asset}
              onChange={e => setFormValue({ ...formValue, id_asset: e.target.value })}
            >
              {idAssetOptions.map(asset => (
                <MenuItem key={asset} value={asset}>
                  {asset}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Description Label'
              value={formValue.description_label}
              onChange={e => setFormValue({ ...formValue, description_label: e.target.value })}
            />

            <CustomTextField
              fullWidth
              sx={{ mb: 4 }}
              label='Quantity'
              value={formValue.quantity}
              onChange={e => setFormValue({ ...formValue, quantity: e.target.value })}
            />

            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type='submit' variant='contained'>
                Simpan
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog Upload Excel */}
      <Dialog
        maxWidth='sm'
        fullWidth
        open={uploadDialogOpen}
        onClose={() => {
          if (!uploadLoading) {
            setUploadDialogOpen(false)
            setUploadFile(null)
            setSelectedAsset(null)
          }
        }}
        disableEscapeKeyDown={uploadLoading}
      >
        <DialogTitle>Upload Excel untuk ID Asset: {selectedAsset}</DialogTitle>
        <DialogContent>
          <Box component='form' onSubmit={handleUploadSubmit}>
            <CustomTextField
              type='file'
              fullWidth
              label='Pilih File Excel'
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: '.xlsx, .xls' }}
              onChange={e => setUploadFile(e.target.files[0])}
              sx={{ mb: 2 }}
              disabled={uploadLoading}
            />

            {/* Error message di bawah input */}
            {uploadErrorMessage && (
              <Typography sx={{ color: 'red', fontSize: '0.875rem', mb: 2 }}>{uploadErrorMessage}</Typography>
            )}

            <DialogActions>
              <Button
                onClick={() => {
                  setUploadDialogOpen(false)
                  setUploadFile(null)
                  setSelectedAsset(null)
                }}
                disabled={uploadLoading}
              >
                Batal
              </Button>
              <Button type='submit' variant='contained' disabled={uploadLoading || !uploadFile}>
                {uploadLoading ? 'Mengupload...' : 'Upload'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LabelAsetTable
