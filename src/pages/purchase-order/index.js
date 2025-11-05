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
import DialogActions from '@mui/material/DialogActions'
import { DataGrid } from '@mui/x-data-grid'
import toast from 'react-hot-toast'
import { useTheme } from '@mui/material'
import format from 'date-fns/format'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/purchase-order/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'
import PickersCustomization from 'src/views/components/PickersCustomization'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Actions Imports
import { fetchData, addData, editData, setSearchQuery, deleteData } from 'src/store/apps/purchase-order'
import { fetchData as fetchPlan } from 'src/store/apps/plan'

const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const defaultColumns = [
  {
    flex: 0.1,
    field: 'nama_pekerjaan',
    headerClassName: 'super-app-theme--header',
    minWidth: 150,
    headerName: 'Deskripsi PO',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.nama_pekerjaan}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'no_po_spk_pks',
    headerClassName: 'super-app-theme--header',
    headerName: 'No. po_spk_pks',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_po_spk_pks}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'tanggal_po_spk_pks',
    headerClassName: 'super-app-theme--header',
    headerName: 'Tgl po_spk_pks',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tanggal_po_spk_pks}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'tanggal_delivery',
    headerClassName: 'super-app-theme--header',
    headerName: 'Tgl Delivery',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tanggal_delivery}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'nilai_pengadaan',
    headerClassName: 'super-app-theme--header',
    headerName: 'Nilai Pengadaan',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.nilai_pengadaan}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'akun',
    headerClassName: 'super-app-theme--header',
    headerName: 'Akun',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.akun}</Typography>
  },
  {
    flex: 0.1,
    minWidth: 150,
    field: 'cost_center',
    headerClassName: 'super-app-theme--header',
    headerName: 'Cost Center',
    renderCell: ({ row }) => {
      return <Typography sx={{ color: 'text.secondary' }}>{row.cost_center}</Typography>
    }
  }
]

const PurchaseOrderTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'
  const [newFilePo, setNewFilePo] = useState(null)
  const [newFileBoq, setNewFileBoq] = useState(null)
  const [isNewFilePoSelected, setIsNewFilePoSelected] = useState(false)
  const [isNewFileBoqSelected, setIsNewFileBoqSelected] = useState(false)

  const [editValue, setEditValue] = useState({
    plan_id: '',
    nama_pekerjaan: '',
    no_po_spk_pks: '',
    tanggal_po_spk_pks: '',
    file_po_spk_pks: '',
    nilai_pengadaan: '',
    tanggal_delivery: '',
    akun: '',
    cost_center: '',
    file_boq: ''
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.purchaseOrder)
  const data_plan = useSelector(state => state.plan.data)

  useEffect(() => {
    dispatch(
      fetchData({
        q: value
      })
    )

    dispatch(fetchPlan({ q: value }))
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleEditPurchaseOrder = async formData => {
    try {
      await dispatch(editData(formData)).unwrap()
      toast.success('Purchase order berhasil diedit!')
      dispatch(fetchData({ q: value }))
      setEditDialogOpen(false)
    } catch (error) {
      console.error('Gagal mengedit purchase order:', error)

      if (
        error?.response?.data?.errors?.nama_pekerjaan &&
        error.response.data.errors.nama_pekerjaan.includes('The nama pekerjaan has already been taken.')
      ) {
        toast.error('Nama pekerjaan sudah digunakan, silakan pilih nama lain.')
      } else {
        toast.error('Gagal mengedit purchase order!')
      }
    }
  }

  // Helper function untuk format tanggal
  const formatDateToYYYYMMDD = dateValue => {
    if (!dateValue) return ''

    try {
      let dateObj

      // Jika sudah Date object
      if (dateValue instanceof Date) {
        dateObj = dateValue
      }

      // Jika string, convert ke Date
      else if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue)
      }

      // Jika tidak valid, return empty string
      else {
        console.warn('Invalid date value:', dateValue)

        return ''
      }

      // Validasi apakah Date object valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date object:', dateObj)

        return ''
      }

      // Format manual untuk memastikan format yyyy-MM-dd
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('Error formatting date:', error)

      return ''
    }
  }

  const handleDialogToggle = row => {
    const tanggalPO = new Date(row.tanggal_po_spk_pks)
    const tanggalDelivery = new Date(row.tanggal_delivery)

    // ✅ RESET FILE BARU dan FLAG-nya
    setNewFilePo(null)
    setNewFileBoq(null)
    setIsNewFilePoSelected(false)
    setIsNewFileBoqSelected(false)

    setEditValue({
      id: row.id,
      plan_id: row.plan_id,
      nama_pekerjaan: row.nama_pekerjaan,
      no_po_spk_pks: row.no_po_spk_pks,
      tanggal_po_spk_pks: tanggalPO,
      nilai_pengadaan: row.nilai_pengadaan,
      tanggal_delivery: tanggalDelivery,
      akun: row.akun,
      cost_center: row.cost_center,
      file_po_spk_pks: row.file_po_spk_pks,
      file_boq: row.file_boq
    })
    setEditDialogOpen(!editDialogOpen)
  }

  const handleClose = () => {
    setEditDialogOpen(false)
  }

  const onSubmit = e => {
    e.preventDefault()
    const formData = new FormData()

    formData.append('_method', 'PATCH')
    formData.append('uuid', editValue.id)

    for (const key in editValue) {
      if (key === 'tanggal_po_spk_pks') {
        const formatted = formatDateToYYYYMMDD(editValue[key])
        if (formatted) {
          formData.append(key, formatted)
        }
      } else if (key === 'tanggal_delivery') {
        const formatted = formatDateToYYYYMMDD(editValue[key])
        if (formatted) {
          formData.append(key, formatted)
        }
      } else if (key !== 'file_po_spk_pks' && key !== 'file_boq') {
        // Hindari re-append file lama (biar dikirim file baru saja jika ada)
        formData.append(key, editValue[key])
      }
    }

    // ✅ Tambahkan file PO SPK PKS baru jika dipilih
    if (newFilePo) {
      formData.append('file_po_spk_pks', newFilePo)
    }

    // ✅ Tambahkan file BOQ baru jika kamu juga pakai file BOQ baru
    if (newFileBoq) {
      formData.append('file_boq', newFileBoq)
    }

    handleEditPurchaseOrder(formData)
    setEditDialogOpen(false)
  }

  const handleAddPurchaseOrder = async newPurchaseOrder => {
    try {
      await dispatch(addData(newPurchaseOrder)).unwrap()
      toast.success('PurchaseOrder berhasil ditambahkan!')
    } catch (error) {
      console.error('Gagal menambahkan PurchaseOrder:', error)
      toast.error('Gagal menambahkan PurchaseOrder!')
    }
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('PurchaseOrder berhasil dihapus!')
      dispatch(fetchData({ q: value }))
    } catch (error) {
      console.error('Gagal menghapus PurchaseOrder:', error)
      toast.error('Gagal menghapus PurchaseOrder!')
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
          <IconButton onClick={() => handleDialogToggle(row)}>
            <Icon icon='tabler:edit' />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)}>
            <Icon icon='tabler:trash' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Daftar PurchaseOrder' />

            <CardContent>
              <TableHeader value={value} handleFilter={handleFilter} handleAddPurchaseOrder={handleAddPurchaseOrder} />
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog
        maxWidth='md'
        fullWidth
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleDialogToggle()
          }
        }}
        open={editDialogOpen}
        disableEscapeKeyDown
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Edit PurchaseOrder
          </Typography>
        </DialogTitle>
        <DatePickerWrapper>
          <DialogContent
            sx={{
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Box component='form' onSubmit={onSubmit}>
              <FormGroup sx={{ mb: 2, flexDirection: 'column', flexWrap: ['wrap', 'nowrap'] }}>
                <Grid item xs={12}>
                  <CustomAutocomplete
                    fullWidth
                    color={'secondary'}
                    value={data_plan.find(option => option.id === editValue.plan_id) || null}
                    options={data_plan}
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    getOptionLabel={option => option.judul || ''}
                    onChange={(e, value) => setEditValue({ ...editValue, plan_id: value.id })}
                    renderInput={params => (
                      <CustomTextField placeholder='Pilih nama plan yang tersedia' {...params} label='Nama Plan: ' />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.nama_pekerjaan}
                    label='Deskripsi PO'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, nama_pekerjaan: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.no_po_spk_pks}
                    label='no_po_spk_pks'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    placeholder='no_po_spk_pks'
                    onChange={e => setEditValue({ ...editValue, no_po_spk_pks: e.target.value })}
                  />
                </Grid>

                <Grid item xs={6} sm={6} sx={{ mr: [0, 4], mb: [3, 5] }}>
                  <PickersCustomization
                    popperPlacement={popperPlacement}
                    label='Tanggal PO SPK PKS'
                    value={editValue.tanggal_po_spk_pks}
                    onChange={e => {
                      setEditValue({ ...editValue, tanggal_po_spk_pks: e })
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={6} sx={{ mr: [0, 4], mb: [3, 5] }}>
                  <PickersCustomization
                    popperPlacement={popperPlacement}
                    label='Tanggal Delivery'
                    value={editValue.tanggal_delivery}
                    onChange={e => {
                      setEditValue({ ...editValue, tanggal_delivery: e })
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.nilai_pengadaan}
                    label='No. PRPO'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, nilai_pengadaan: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.akun}
                    label='Jumlah Aset'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, akun: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.cost_center}
                    label='Proyek'
                    sx={{ mr: [0, 4], mb: [3, 5] }}
                    onChange={e => setEditValue({ ...editValue, cost_center: e.target.value })}
                  />
                </Grid>

                <Grid container spacing={4} sx={{ mb: [3, 5] }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                      File PO SPK PKS Saat Ini:
                    </Typography>
                    {editValue.file_po_spk_pks ? (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant='outlined'
                          color='primary'
                          href={`https://iams-api.pins.co.id/storage/${editValue.file_po_spk_pks}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Lihat File PO SPK PKS
                        </Button>
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          {editValue.file_po_spk_pks.split('/').pop()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        Tidak ada file PO SPK PKS.
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' component='span' sx={{ mb: 2, display: 'block' }}>
                      Upload File PO SPK PKS Baru:
                    </Typography>

                    {/* Tombol Upload */}
                    <Button variant='outlined' component='label' color='primary' sx={{ textTransform: 'none' }}>
                      Pilih File
                      <input
                        type='file'
                        accept='application/pdf,image/*'
                        hidden
                        onChange={e => {
                          setNewFilePo(e.target.files[0])
                          setIsNewFilePoSelected(true)
                        }}
                      />
                    </Button>

                    {/* Tampilkan nama file baru jika sudah dipilih */}
                    {newFilePo && (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        {newFilePo.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ mb: [3, 5] }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                      File BOQ Saat Ini:
                    </Typography>
                    {editValue.file_boq ? (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant='outlined'
                          color='primary'
                          href={`https://iams-api.pins.co.id/storage/${editValue.file_boq}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Lihat File BOQ
                        </Button>
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          {editValue.file_boq.split('/').pop()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        Tidak ada file BOQ.
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body2' component='span' sx={{ mb: 2, display: 'block' }}>
                      Upload File BOQ Baru:
                    </Typography>

                    {/* Tombol Upload */}
                    <Button variant='outlined' component='label' color='primary' sx={{ textTransform: 'none' }}>
                      Pilih File
                      <input
                        type='file'
                        accept='application/pdf,image/*'
                        hidden
                        onChange={e => {
                          setNewFileBoq(e.target.files[0])
                          setIsNewFileBoqSelected(true)
                        }}
                      />
                    </Button>

                    {/* Tampilkan nama file baru jika sudah dipilih */}
                    {newFileBoq && (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        {newFileBoq.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                <DialogActions className='dialog-actions-dense'>
                  <Button onClick={handleClose} color='secondary' sx={{ mt: 4 }} variant='contained'>
                    Batalkan
                  </Button>

                  <Button type='submit' variant='contained' sx={{ mt: 4 }}>
                    Update
                  </Button>
                </DialogActions>
              </FormGroup>
            </Box>
          </DialogContent>
        </DatePickerWrapper>
      </Dialog>
    </>
  )
}

export default PurchaseOrderTable
