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
import toast from 'react-hot-toast'

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
    id_asset: '',
    label: '',
    internal_order: '',
    sn: '',
    lease_type: '',
    location_type: '',
    address: '',
    location_detail: '',
    owner: '',
    condition: '',
    is_active: 0,
    description: '',
    description_label: '',
    status_barcode: 0,
    barcode: ''
  })
  const handleEditOpen = row => {
    setEditValue({
      ...row,
      is_active: Number(row.is_active ?? 0),
      status_barcode: Number(row.status_barcode ?? 0)
    })
    setErrors({}) // reset error biar popup selalu fresh
    setEditOpen(true)
  }

  const dispatch = useDispatch()

  useEffect(() => {
    if (!id_asset) return

    const fetchDetail = async () => {
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

    fetchDetail()
  }, [id_asset])

  const [errors, setErrors] = useState({})
  const handleEditSave = async () => {
    const newErrors = {}

    if (!editValue.sn) {
      newErrors.sn = 'Serial Number wajib diisi'
    }
    if (!editValue.description_label) {
      newErrors.description_label = 'Description Label wajib diisi'
    }

    // kalau ada error, jangan lanjut
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      return
    }

    setErrors({}) // reset kalau valid

    try {
      const blockedFields = ['id_asset', 'label', 'id']

      const mergedPayload = Object.keys(editValue).reduce((acc, key) => {
        if (blockedFields.includes(key)) return acc

        if (editValue[key] !== undefined) {
          acc[key] = editValue[key]
        } else {
          acc[key] = data?.[key] ?? null
        }

        return acc
      }, {})

      mergedPayload.id = editValue.uuid

      await dispatch(updateAsset(mergedPayload)).unwrap()
      toast.success('Asset berhasil diupdate!')
      setEditOpen(false)

      const res = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}asset-label/by-id-asset`, { params: { id_asset } })
      setData(res.data.data)
    } catch (error) {
      console.error('❌ Gagal update asset:', error)
      toast.error('Gagal mengupdate asset!')
    }
  }

  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [selectedBarcode, setSelectedBarcode] = useState(null)

  // siapkan data untuk tabel meskipun kosong
  const rows = (data || []).map(item => ({
    ...item,
    id: item.uuid, // pakai uuid untuk row id
    status: item.is_active === 1 ? 'Active' : 'Not Active'
  }))

  const columns = [
    { field: 'id_asset', headerName: 'ID Asset', flex: 1 },
    { field: 'label', headerName: 'Label', flex: 2 },
    { field: 'sn', headerName: 'SN', flex: 1 },
    { field: 'condition', headerName: 'Condition', flex: 1 },
    { field: 'location_type', headerName: 'Location', flex: 1 },
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

  // helper untuk render opsi dengan fallback
  const renderOptions = (options, currentValue) => {
    return (
      <>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        {currentValue && !options.includes(currentValue) && <option value={currentValue}>{currentValue}</option>}
      </>
    )
  }

  // Daftar opsi default
  const conditionOptions = ['Baik', 'Rusak', 'Rusak total', 'Hilang', 'Tidak ditemukan', 'Perlu perbaikan']
  const leaseTypeOptions = ['Murni', 'Sewa']
  const locationTypeOptions = ['Customer', 'Mitra', 'PINS', 'PINS area', 'Gudang PN', 'Not found', 'CSR']
  const ownerOptions = ['PINS', 'Customer', 'User']

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
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3, // ✅ beri jarak antar input secara konsisten
            mt: 1
          }}
        >
          <CustomTextField fullWidth label='ID Asset' value={editValue.id_asset} disabled />
          <CustomTextField fullWidth label='Label' value={editValue.label} disabled />

          <CustomTextField
            fullWidth
            label='Internal Order'
            value={editValue.internal_order || ''}
            onChange={e => setEditValue({ ...editValue, internal_order: e.target.value })}
          />

          <CustomTextField
            fullWidth
            label='Serial Number'
            value={editValue.sn || ''}
            onChange={e => setEditValue({ ...editValue, sn: e.target.value })}
            error={!!errors.sn}
            helperText={errors.sn}
            FormHelperTextProps={{ sx: { fontSize: '0.75rem' } }}
          />

          <CustomTextField
            select
            fullWidth
            label='Lease Type'
            value={editValue.lease_type || ''}
            onChange={e => setEditValue({ ...editValue, lease_type: e.target.value })}
            SelectProps={{ native: true }}
          >
            {renderOptions(leaseTypeOptions, editValue.lease_type)}
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            label='Location Type'
            value={editValue.location_type || ''}
            onChange={e => setEditValue({ ...editValue, location_type: e.target.value })}
            SelectProps={{ native: true }}
          >
            {renderOptions(locationTypeOptions, editValue.location_type)}
          </CustomTextField>

          <CustomTextField
            fullWidth
            label='Address'
            value={editValue.address || ''}
            onChange={e => setEditValue({ ...editValue, address: e.target.value })}
          />

          <CustomTextField
            fullWidth
            label='Location Detail'
            value={editValue.location_detail || ''}
            onChange={e => setEditValue({ ...editValue, location_detail: e.target.value })}
          />

          <CustomTextField
            select
            fullWidth
            label='Owner'
            value={editValue.owner || ''}
            onChange={e => setEditValue({ ...editValue, owner: e.target.value })}
            SelectProps={{ native: true }}
          >
            {renderOptions(ownerOptions, editValue.owner)}
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            label='Condition'
            value={editValue.condition || ''}
            onChange={e => setEditValue({ ...editValue, condition: e.target.value })}
            SelectProps={{ native: true }}
          >
            {renderOptions(conditionOptions, editValue.condition)}
          </CustomTextField>

          <CustomTextField
            select
            fullWidth
            label='Active Status'
            value={editValue.is_active}
            onChange={e => setEditValue({ ...editValue, is_active: Number(e.target.value) })}
            SelectProps={{ native: true }}
          >
            <option value={1}>Active</option>
            <option value={0}>Not Active</option>
          </CustomTextField>

          <CustomTextField
            fullWidth
            label='Description'
            value={editValue.description || ''}
            onChange={e => setEditValue({ ...editValue, description: e.target.value })}
          />

          <CustomTextField
            fullWidth
            label='Description Label'
            value={editValue.description_label || ''}
            onChange={e => setEditValue({ ...editValue, description_label: e.target.value })}
            error={!!errors.description_label}
            helperText={errors.description_label}
            FormHelperTextProps={{ sx: { fontSize: '0.75rem' } }}
          />

          <CustomTextField
            select
            fullWidth
            label='Status Barcode'
            value={editValue.status_barcode}
            onChange={e => setEditValue({ ...editValue, status_barcode: Number(e.target.value) })}
            SelectProps={{ native: true }}
          >
            <option value={1}>OK</option>
            <option value={0}>Not OK</option>
          </CustomTextField>

          <CustomTextField
            fullWidth
            label='Barcode'
            value={editValue.barcode || ''}
            onChange={e => setEditValue({ ...editValue, barcode: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setErrors({}) // reset error
              setEditOpen(false)
            }}
          >
            Batal
          </Button>
          <Button variant='contained' onClick={handleEditSave}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AssetDetailPage
