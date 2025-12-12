// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { CardContent, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { DataGrid } from '@mui/x-data-grid'
import toast from 'react-hot-toast'
import { useTheme } from '@mui/material'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import Tooltip from '@mui/material/Tooltip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/plan/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Actions Imports
import { fetchData, editData, deleteData } from 'src/store/apps/plan'
import { fetchCompany } from 'src/store/apps/company'
import { fetchData as fetchTypes } from 'src/store/apps/type'
import { fetchData as fetchVarieties } from 'src/store/apps/variety'

// Helper function untuk mendapatkan nama
const getNama = item => {
  if (!item) return ''
  return item.nama || item.name || ''
}

const PlanTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const theme = useTheme()
  const [newFilePrpo, setNewFilePrpo] = useState(null)
  const [isNewFilePrpoSelected, setIsNewFilePrpoSelected] = useState(false)
  const [editItems, setEditItems] = useState([])
  const [localJenisBarangData, setLocalJenisBarangData] = useState([])
  const [localTipeBarangData, setLocalTipeBarangData] = useState([])

  const [editValue, setEditValue] = useState({
    uuid: '',
    is_lop: '',
    judul: '',
    project_id: '',
    project_manual: '',
    company_ids: [],
    no_prpo: '',
    file_prpo: ''
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.plan)
  const companies = useSelector(state => state.company?.data) || []
  const tipeBarangData = useSelector(state => state.type?.data || [])
  const jenisBarangData = useSelector(state => state.variety?.data || [])

  // Format data untuk autocomplete
  const formatData = data => {
    if (!Array.isArray(data)) return []

    return data
      .map(item => ({
        id: item.uuid || item.id || '',
        nama: getNama(item)
      }))
      .filter(item => item.id && item.nama)
  }

  const formattedCompanies = formatData(companies)
  const formattedTipeBarang = formatData(tipeBarangData)
  const formattedJenisBarang = formatData(jenisBarangData)

  // Simpan data ke state lokal untuk digunakan di render cell
  useEffect(() => {
    if (jenisBarangData.length > 0) {
      setLocalJenisBarangData(jenisBarangData)
    }
  }, [jenisBarangData])

  useEffect(() => {
    if (tipeBarangData.length > 0) {
      setLocalTipeBarangData(tipeBarangData)
    }
  }, [tipeBarangData])

  // Helper function untuk mencari nama berdasarkan ID
  const findNamaById = (id, dataList) => {
    if (!id || !Array.isArray(dataList)) return ''
    const found = dataList.find(item => (item.uuid || item.id) === id)
    return getNama(found) || ''
  }

  // Process data untuk memastikan setiap row memiliki ID yang unik
  const processedData = (store.data || []).map(row => ({
    ...row,
    id: row.uuid || row.id || `row-${Math.random()}` // Pastikan selalu ada id
  }))

  const columns = [
    {
      flex: 0.25,
      field: 'judul',
      headerClassName: 'super-app-theme--header',
      minWidth: 250,
      headerName: 'Judul / Project',
      renderCell: ({ row }) => {
        const judul = row.judul || '-'

        return (
          <Tooltip title={judul} arrow placement='top-start' enterDelay={500} leaveDelay={200}>
            <Box sx={{ width: '100%' }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '250px',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {judul}
              </Typography>
            </Box>
          </Tooltip>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'is_lop',
      headerClassName: 'super-app-theme--header',
      headerName: 'LOP / NONLOP',
      renderCell: ({ row }) => {
        const isLop = row.is_lop === true || row.is_lop === 1 || row.is_lop === 'true' || row.is_lop === '1'
        return <Typography sx={{ color: 'text.secondary' }}>{isLop ? 'LOP' : 'NONLOP'}</Typography>
      }
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'jumlah',
      headerClassName: 'super-app-theme--header',
      headerName: 'Jumlah',
      renderCell: ({ row }) => {
        const items = row.items || []
        const total = items.reduce((sum, item) => sum + (parseInt(item.jumlah_barang) || 0), 0)
        return <Typography sx={{ color: 'text.secondary' }}>{total}</Typography>
      }
    },
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

  useEffect(() => {
    // Fetch data plan dengan parameter yang aman
    const fetchPlanData = async () => {
      try {
        await dispatch(
          fetchData({
            q: value || ''
          })
        ).unwrap()
      } catch (error) {
        toast.error('Gagal mengambil data plan')
      }
    }

    // Fetch data untuk dropdowns tanpa parameter atau dengan parameter yang aman
    const fetchDropdownData = async () => {
      try {
        await dispatch(fetchCompany()).unwrap()

        // Untuk type dan variety, kita dispatch tanpa parameter
        // atau dengan parameter object kosong
        await Promise.all([dispatch(fetchTypes({})).catch(() => []), dispatch(fetchVarieties({})).catch(() => [])])
      } catch (error) {
        toast.error('Gagal mengambil data dropdown')
      }
    }

    fetchPlanData()
    fetchDropdownData()
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleEditPlan = async formData => {
    try {
      const result = await dispatch(editData(formData)).unwrap()
      toast.success('Plan berhasil diedit!')

      // Refresh data plan
      dispatch(fetchData({ q: value || '' }))
      setEditDialogOpen(false)
    } catch (error) {
      if (
        error?.response?.data?.errors?.judul &&
        error.response.data.errors.judul.includes('The judul has already been taken.')
      ) {
        toast.error('Judul sudah digunakan, silakan pilih judul lain.')
      } else {
        toast.error('Gagal mengedit plan!')
      }
    }
  }

  const handleDialogToggle = row => {
    // Reset file baru dan flag-nya
    setNewFilePrpo(null)
    setIsNewFilePrpoSelected(false)

    // Extract company IDs dari mitra
    const companyIds = row.mitra?.map(mitra => mitra.uuid).filter(Boolean) || []

    // Get items data
    const items =
      row.items?.map(item => ({
        id: item.id,
        nama_barang: item.nama_barang || '',
        jenis_barang_id: item.jenis_barang_id || '',
        tipe_barang_id: item.tipe_barang_id || '',
        jumlah_barang: item.jumlah_barang || ''
      })) || []

    // Get project_manual for NON LOP
    const isLop = row.is_lop === true || row.is_lop === 1 || row.is_lop === 'true' || row.is_lop === '1'
    const projectManual = !isLop ? row.judul : ''

    const editData = {
      // Pastikan uuid menggunakan row.uuid bila tersedia, fallback ke row.id
      uuid: row.uuid || row.id || '',
      // Simpan id asli agar dapat dikirim juga (beberapa API/endpoint pakai id bukan uuid)
      id: row.id || row.uuid || '',
      is_lop: isLop ? '1' : '0',
      judul: row.judul || '',
      project_id: row.project_id || '',
      project_manual: projectManual,
      company_ids: companyIds,
      no_prpo: row.no_prpo || '',
      file_prpo: row.file_prpo || ''
    }

    setEditValue(editData)
    setEditItems(items)
    setEditDialogOpen(!editDialogOpen)
  }

  const handleClose = () => {
    setEditDialogOpen(false)
  }

  const onSubmit = e => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('_method', 'PATCH')
    // Juga sertakan 'id' agar muncul di payload jika diperlukan backend
    formData.append('id', editValue.id || editValue.uuid || '')

    // Append data ke formData
    const isLop = editValue.is_lop === '1'
    formData.append('is_lop', isLop ? '1' : '0')

    if (isLop) {
      formData.append('judul', editValue.judul)
      formData.append('project_id', editValue.project_id)
    } else {
      formData.append('judul', editValue.project_manual)
    }

    // Append items data
    editItems.forEach((item, index) => {
      formData.append(`items[${index}][nama_barang]`, item.nama_barang || '')
      formData.append(`items[${index}][jenis_barang_id]`, item.jenis_barang_id || '')
      formData.append(`items[${index}][tipe_barang_id]`, item.tipe_barang_id || '')
      formData.append(`items[${index}][jumlah_barang]`, item.jumlah_barang || '')
    })

    // Append company IDs
    if (Array.isArray(editValue.company_ids)) {
      editValue.company_ids.forEach(id => {
        if (id) {
          formData.append('company_ids[]', id)
        }
      })
    }

    formData.append('no_prpo', editValue.no_prpo || '')

    // Tambahkan file PRPO baru jika dipilih
    if (newFilePrpo) {
      formData.append('file_prpo', newFilePrpo)
    }

    handleEditPlan(formData)
  }

  const handleDelete = async id => {
    try {
      const result = await dispatch(deleteData(id)).unwrap()
      toast.success('Plan berhasil dihapus!')

      dispatch(fetchData({ q: value || '' }))
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Plan tidak ditemukan!')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal menghapus Plan!')
      }
    }
  }

  // Fungsi untuk menambah item
  const addItem = () => {
    setEditItems([
      ...editItems,
      {
        nama_barang: '',
        jenis_barang_id: '',
        tipe_barang_id: '',
        jumlah_barang: ''
      }
    ])
  }

  // Fungsi untuk menghapus item
  const removeItem = index => {
    const newItems = [...editItems]
    newItems.splice(index, 1)
    setEditItems(newItems)
  }

  // Fungsi untuk update item
  const updateItem = (index, field, value) => {
    const newItems = [...editItems]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    setEditItems(newItems)
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Daftar Plan' />

            <CardContent>
              <TableHeader value={value} handleFilter={handleFilter} />
              <Box
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  },
                  height: 500
                }}
              >
                <DataGrid
                  autoHeight
                  rows={processedData}
                  columns={columns}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  getRowId={row => row.id}
                  loading={store.loading}
                  disableColumnMenu
                  sx={{
                    '& .MuiDataGrid-cell': {
                      py: 2
                    }
                  }}
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
            Edit Plan
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
              {/* Debug info */}
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Debug Info: UUID: {editValue.uuid} | Items: {editItems.length} | Companies:{' '}
                  {editValue.company_ids?.length || 0}
                </Typography>
              </Box>

              {/* Tipe Plan */}
              <Grid item xs={12} sx={{ mb: 4 }}>
                <CustomAutocomplete
                  fullWidth
                  color={'secondary'}
                  value={editValue.is_lop === '1' ? { id: '1', nama: 'LOP' } : { id: '0', nama: 'NONLOP' }}
                  options={[
                    { id: '1', nama: 'LOP' },
                    { id: '0', nama: 'NONLOP' }
                  ]}
                  getOptionLabel={option => option.nama || ''}
                  onChange={(e, value) => {
                    setEditValue({ ...editValue, is_lop: value?.id || '' })
                  }}
                  renderInput={params => (
                    <CustomTextField placeholder='Pilih tipe plan' {...params} label='Tipe Plan' />
                  )}
                />
              </Grid>

              {/* Project untuk LOP atau Manual untuk NON LOP */}
              {editValue.is_lop === '1' ? (
                <Grid item xs={12} sx={{ mb: 4 }}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.judul}
                    label='Judul / Project'
                    onChange={e => {
                      setEditValue({ ...editValue, judul: e.target.value })
                    }}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sx={{ mb: 4 }}>
                  <CustomTextField
                    fullWidth
                    color={'secondary'}
                    value={editValue.project_manual}
                    label='Nama Project'
                    onChange={e => {
                      setEditValue({ ...editValue, project_manual: e.target.value })
                    }}
                  />
                </Grid>
              )}

              {/* Items Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Items ({editItems.length})
                </Typography>
                {editItems.map((item, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant='subtitle2' sx={{ mb: 2 }}>
                      Item {index + 1}
                    </Typography>

                    {/* Nama Barang */}
                    <Grid item xs={12} sx={{ mb: 3 }}>
                      <CustomTextField
                        fullWidth
                        color={'secondary'}
                        value={item.nama_barang}
                        label='Nama Barang'
                        onChange={e => updateItem(index, 'nama_barang', e.target.value)}
                      />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {/* Jenis Barang */}
                      <Grid item xs={12} sm={6}>
                        <CustomAutocomplete
                          fullWidth
                          color={'secondary'}
                          value={formattedJenisBarang.find(option => option.id === item.jenis_barang_id) || null}
                          options={formattedJenisBarang}
                          getOptionLabel={option => option.nama || ''}
                          onChange={(e, value) => {
                            updateItem(index, 'jenis_barang_id', value?.id || '')
                          }}
                          renderInput={params => (
                            <CustomTextField placeholder='Pilih jenis barang' {...params} label='Jenis Barang' />
                          )}
                        />
                      </Grid>

                      {/* Tipe Barang */}
                      <Grid item xs={12} sm={6}>
                        <CustomAutocomplete
                          fullWidth
                          color={'secondary'}
                          value={formattedTipeBarang.find(option => option.id === item.tipe_barang_id) || null}
                          options={formattedTipeBarang}
                          getOptionLabel={option => option.nama || ''}
                          onChange={(e, value) => {
                            updateItem(index, 'tipe_barang_id', value?.id || '')
                          }}
                          renderInput={params => (
                            <CustomTextField placeholder='Pilih tipe barang' {...params} label='Tipe Barang' />
                          )}
                        />
                      </Grid>
                    </Grid>

                    {/* Jumlah Barang */}
                    <Grid item xs={12} sm={4} sx={{ mb: 2 }}>
                      <CustomTextField
                        fullWidth
                        type='number'
                        color={'secondary'}
                        value={item.jumlah_barang}
                        label='Jumlah Barang'
                        onChange={e => updateItem(index, 'jumlah_barang', e.target.value)}
                      />
                    </Grid>

                    {/* Hapus Item Button */}
                    {editItems.length > 1 && (
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        onClick={() => removeItem(index)}
                        sx={{ mt: 1 }}
                      >
                        Hapus Item
                      </Button>
                    )}
                  </Box>
                ))}

                {/* Tambah Item Button */}
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={addItem}
                  startIcon={<Icon icon='tabler:plus' />}
                  sx={{ mt: 2 }}
                >
                  Tambah Item
                </Button>
              </Box>

              {/* No PRPO */}
              <Grid item xs={12} sx={{ mb: 4 }}>
                <CustomTextField
                  fullWidth
                  color={'secondary'}
                  value={editValue.no_prpo}
                  label='No PR/PO'
                  onChange={e => {
                    setEditValue({ ...editValue, no_prpo: e.target.value })
                  }}
                />
              </Grid>

              {/* Company/Mitra */}
              <Grid item xs={12} sx={{ mb: 4 }}>
                <CustomAutocomplete
                  fullWidth
                  color={'secondary'}
                  multiple
                  value={formattedCompanies.filter(company => editValue.company_ids?.includes(company.id))}
                  options={formattedCompanies}
                  getOptionLabel={option => option.nama || ''}
                  onChange={(e, values) => {
                    const ids = values.map(value => value.id)
                    setEditValue({ ...editValue, company_ids: ids })
                  }}
                  renderInput={params => <CustomTextField placeholder='Pilih company' {...params} label='Company' />}
                />
              </Grid>

              {/* File PRPO */}
              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant='body2' component='span' sx={{ mb: 2, display: 'block', fontWeight: 500 }}>
                    File PRPO Saat Ini:
                  </Typography>
                  {editValue.file_prpo ? (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant='outlined'
                        color='primary'
                        href={`https://iams-api.pins.co.id/storage/${editValue.file_prpo}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{ mb: 1 }}
                      >
                        Lihat File PRPO
                      </Button>
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        {editValue.file_prpo.split('/').pop()}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Tidak ada file PRPO.
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='body2' component='span' sx={{ mb: 2, display: 'block', fontWeight: 500 }}>
                    Upload File PRPO Baru:
                  </Typography>

                  {/* Tombol Upload */}
                  <Button variant='outlined' component='label' color='primary' sx={{ textTransform: 'none', mb: 1 }}>
                    Pilih File
                    <input
                      type='file'
                      accept='application/pdf,image/*'
                      hidden
                      onChange={e => {
                        const file = e.target.files[0]
                        setNewFilePrpo(file)
                        setIsNewFilePrpoSelected(true)
                      }}
                    />
                  </Button>

                  {/* Tampilkan nama file baru jika sudah dipilih */}
                  {newFilePrpo && (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      {newFilePrpo.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <DialogActions className='dialog-actions-dense'>
                <Button onClick={handleClose} color='secondary' sx={{ mt: 2 }} variant='contained'>
                  Batalkan
                </Button>

                <Button type='submit' variant='contained' sx={{ mt: 2 }}>
                  Update
                </Button>
              </DialogActions>
            </FormGroup>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PlanTable
