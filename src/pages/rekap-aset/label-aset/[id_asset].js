import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateAsset } from 'src/store/apps/label-aset'

import axios from 'axios'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Icon } from '@iconify/react'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

const AssetDetailPage = () => {
  const router = useRouter()

  const { id_asset } = router.query

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  // state untuk edit
  const [editOpen, setEditOpen] = useState(false)
  const [editValue, setEditValue] = useState({
    uuid: '',
    sn: '',
    condition: '',
    location: '',
    description: '',
    description_label: '',
    status: ''
  })

  const handleEditOpen = row => {
    setEditValue({
      ...row,
      status: row.status === 'Ok' ? 1 : 0
    })
    setEditOpen(true)
  }

  const dispatch = useDispatch()

  const fetchDetail = async () => {
    if (!id_asset) return
    try {
      setLoading(true)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label/by-id-asset`, {
        params: { id_asset }
      })
      setData(res.data.data)
    } catch (error) {
      console.error('❌ Error fetching detail:', error)
    } finally {
      setLoading(false)
    }
  }

  // useEffect untuk fetch pertama kali
  useEffect(() => {
    fetchDetail()
  }, [id_asset])

  // handleEditSave setelah update sukses
  const handleEditSave = async () => {
    try {
      // pastikan status dalam bentuk number
      const payload = {
        ...editValue,
        status: Number(editValue.status)
      }

      await dispatch(updateAsset(payload)).unwrap()

      // kalau sukses, tutup dialog & fetch ulang data
      setEditOpen(false)
      await fetchDetail()
    } catch (error) {
      console.error('❌ Gagal update asset:', error)
    }
  }

  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [selectedBarcode, setSelectedBarcode] = useState(null)

  // siapkan data untuk tabel meskipun kosong
  const rows = (data || []).map(item => ({
    id: item.uuid,
    id_asset: item.id_asset,
    label: item.label, // <- tambahin label
    barcode: item.barcode, // <- tambahin barcode
    sn: item.sn || '-',
    condition: item.condition || '-',
    location: item.location || '-',
    description: item.description || '-',
    description_label: item.description_label || '-',
    status: item.status === 1 || item.status === '1' ? 'Ok' : 'Not Ok'
  }))

  const columns = [
    { field: 'id_asset', headerName: 'ID Asset', flex: 1 },
    { field: 'label', headerName: 'Label', flex: 2 }, // tampilkan label juga
    { field: 'sn', headerName: 'SN', flex: 1 },
    { field: 'condition', headerName: 'Condition', flex: 1 },
    { field: 'location', headerName: 'Location', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'description_label', headerName: 'Description Label', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip arrow title='Edit'>
            <IconButton color='primary' onClick={() => handleEditOpen(params.row)}>
              <Icon icon='tabler:edit' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={`Detail Asset - ${id_asset}`} />
          <CardContent>
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick getRowId={row => row.id} />
            </Box>

            <Box mt={4} sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' onClick={() => router.back()}>
                Kembali
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Asset - {id_asset}</DialogTitle>
        <DialogContent>
          <CustomTextField
            fullWidth
            label='SN'
            sx={{ mb: 3 }}
            value={editValue.sn}
            onChange={e => setEditValue({ ...editValue, sn: e.target.value })}
          />
          <CustomTextField
            fullWidth
            label='Condition'
            sx={{ mb: 3 }}
            value={editValue.condition}
            onChange={e => setEditValue({ ...editValue, condition: e.target.value })}
          />
          <CustomTextField
            fullWidth
            label='Location'
            sx={{ mb: 3 }}
            value={editValue.location}
            onChange={e => setEditValue({ ...editValue, location: e.target.value })}
          />
          <CustomTextField
            fullWidth
            label='Description'
            sx={{ mb: 3 }}
            value={editValue.description}
            onChange={e => setEditValue({ ...editValue, description: e.target.value })}
          />
          <CustomTextField
            fullWidth
            label='Description Label'
            sx={{ mb: 3 }}
            value={editValue.description_label}
            onChange={e => setEditValue({ ...editValue, description_label: e.target.value })}
          />
          <CustomTextField
            select
            fullWidth
            label='Status'
            sx={{ mb: 3 }}
            value={editValue.status}
            onChange={e => setEditValue({ ...editValue, status: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value={1}>Ok</option>
            <option value={0}>Not Ok</option>
          </CustomTextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Batal</Button>
          <Button variant='contained' onClick={handleEditSave}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AssetDetailPage
