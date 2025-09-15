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
    field: 'total',
    headerName: 'Total',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.total}</Typography>
  },
  {
    flex: 0.2,
    field: 'barcode_count',
    headerName: 'Barcode Count',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.barcode_count}</Typography>
  }
]

const LabelAsetTable = () => {
  const dispatch = useDispatch()
  const store = useSelector(state => state.appLabelAset)
  const router = useRouter()

  const [idAssetOptions, setIdAssetOptions] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formValue, setFormValue] = useState({
    internal_order: '',
    id_asset: '',
    total: '',
    barcode_count: '',
    description_label: ''
  })

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
    setFormValue({ internal_order: '', id_asset: '', total: '', barcode_count: '' })
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

  const handleDownloadBarcode = async (id_asset, total, barcode_count) => {
    try {
      // kalau barcode_count masih 0, hentikan aja
      if (barcode_count === 0) {
        alert('Belum ada barcode yang bisa di-download')

        return
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_AMS_URL}asset-label/download`,
        { id_asset, qty: barcode_count }, // kirim sesuai jumlah barcode yang sudah ada
        { responseType: 'blob' }
      )

      const file = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(file)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `barcode-${id_asset}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('❌ Gagal download barcode:', error)
      alert('Download barcode gagal')
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

          {/* Hanya tampilkan tombol download kalau barcode_count > 0 */}
          {row.barcode_count > 0 && (
            <Tooltip arrow title='Download Barcode'>
              <IconButton onClick={() => handleDownloadBarcode(row.id_asset, row.total, row.barcode_count)}>
                <Icon icon='tabler:download' />
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
            <CardHeader
              title='Daftar Label Aset'
              action={
                <Button variant='contained' onClick={handleDialogToggle}>
                  Tambah Label Aset
                </Button>
              }
            />
            <CardContent>
              <Box>
                <DataGrid
                  autoHeight
                  rows={store.data}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
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
              label='Total'
              value={formValue.total}
              onChange={e => setFormValue({ ...formValue, total: e.target.value })}
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
    </>
  )
}

export default LabelAsetTable
