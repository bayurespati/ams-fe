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
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import PickersCustomization from 'src/views/components/PickersCustomization'
import format from 'date-fns/format'
import toast from 'react-hot-toast'
import Tooltip from '@mui/material/Tooltip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import TableHeader from 'src/views/apps/asetMasuk/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import FormValidationAsync from 'src/views/apps/asetMasuk/FormValidationAsync'
import Detail from 'src/views/apps/asetMasuk/Detail'

// ** Actions Imports
import { fetchData, addData, editData, setSearchQuery, deleteData } from 'src/store/apps/aset-masuk'
import { fetchData as fetchPo } from 'src/store/apps/purchase-order'
import { store } from 'src/store'

const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const data_lokasi_gudang = [
  { lokasi: 'Jakarta Pusat', id: '1' },
  { lokasi: 'Jakarta Selatan', id: '2' }
]

const data_owner = [
  { nama: 'bayu', id: '1' },
  { nama: 'pras', id: '2' }
]

const defaultColumns = [
  {
    flex: 0.15,
    field: 'nama_pekerjaan',
    headerClassName: 'super-app-theme--header',
    minWidth: 150,
    headerName: 'Nama Pekerjaan',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.po.nama_pekerjaan}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'lokasi_gudang',
    headerClassName: 'super-app-theme--header',
    headerName: 'Lokasi Gudang',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.lokasi_gudang}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 190,
    field: 'no_do',
    headerClassName: 'super-app-theme--header',
    headerName: 'NO DO',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_do}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'tanggal_masuk',
    headerClassName: 'super-app-theme--header',
    headerName: 'tanggal masuk',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tanggal_masuk}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'no_gr',
    headerClassName: 'super-app-theme--header',
    headerName: 'No GR',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_gr}</Typography>
  }
]

const AsetMasukTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [view, setView] = useState('1')
  const [detail, setDetail] = useState({})
  const [newFile, setNewFile] = useState(null)
  const [isNewFileSelected, setIsNewFileSelected] = useState(false)

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const [editValue, setEditValue] = useState({
    po_id: '',
    no_do: '',
    lokasi_gudang: '',
    owner_id: '',
    file_evidence: '',
    keterangan: '',
    no_gr: '',
    tanggal_masuk: ''
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.asetMasuk)
  const data_po = useSelector(state => state.purchaseOrder.data)

  useEffect(() => {
    dispatch(
      fetchData({
        q: value
      })
    )
  }, [dispatch, value])

  useEffect(() => {}, [store.data])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleEditAsetMasuk = async data => {
    try {
      await dispatch(editData(data)).unwrap()
      toast.success('Do In berhasil diedit!')
      dispatch(fetchData({ q: value }))
    } catch (error) {
      console.error('Gagal mengedit DO In:', error)
      toast.error('Gagal mengedit DO In!')
    }
    setEditDialogOpen(false)
  }

  const handleClose = () => {
    setEditDialogOpen(false)
  }

  const handleDialogToggle = async row => {
    try {
      await dispatch(fetchPo()).unwrap()

      // ✅ RESET FILE BARU dan FLAG-nya
      setNewFile(null)
      setIsNewFileSelected(false)

      setEditValue({
        id: row.id,
        po_id: row.po_id,
        no_do: row.no_do,
        lokasi_gudang: row.lokasi_gudang,
        owner_id: row.owner_id,
        file_evidence: row.file_evidence,
        keterangan: row.keterangan,
        no_gr: row.no_gr,
        tanggal_masuk: new Date(row.tanggal_masuk)
      })

      setEditDialogOpen(true)
    } catch (error) {
      toast.error('Gagal memuat data PO')
      console.error('Fetch PO error:', error)
    }
  }

  const onSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('_method', 'PATCH')

    for (const key in editValue) {
      if (key === 'tanggal_masuk') {
        formData.append('tanggal_masuk', format(editValue[key], 'yyyy-MM-dd'))
      } else if (key !== 'file_evidence') {
        formData.append(key, editValue[key])
      }
    }

    if (newFile) {
      formData.append('file_evidence', newFile)
    }

    handleEditAsetMasuk(formData)
    setEditDialogOpen(false)
  }

  const handleDelete = async id => {
    try {
      await dispatch(deleteData(id)).unwrap()
      toast.success('DO In berhasil dihapus!')
    } catch (error) {
      console.error('Gagal menghapus DO In:', error)
      toast.error('Gagal menghapus DO In!')
    }
  }

  const columns = [
    ...defaultColumns,
    {
      flex: 0.25,
      minWidth: 120,
      sortable: false,
      field: 'actions',
      headerClassName: 'super-app-theme--header',
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
          <Tooltip arrow title='Detail' onClick={() => handleDetailClick(row)}>
            <IconButton>
              <Icon icon='tabler:info-circle'></Icon>
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const handleDetailClick = row => {
    setDetail(row)
    setView('3')
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
          {view === '2' ? (
            <FormValidationAsync
              data_lokasi_gudang={data_lokasi_gudang}
              data_owner={data_owner}
              setView={setView}
              setDetail={setDetail}
            />
          ) : view === '1' ? (
            <Card>
              <CardHeader title='Daftar Aset Masuk (DO In)' />
              <CardContent>
                <TableHeader value={value} handleFilter={handleFilter} setView={setView} />
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
                    getRowId={row => row.id}
                  />
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Detail setView={setView} id={detail.id} />
          )}
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
            Edit Do In
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
              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
                <CustomAutocomplete
                  fullWidth
                  color={'secondary'}
                  options={data_po}
                  id='po_id'
                  onChange={(event, value) => setEditValue({ ...editValue, po_id: value.id })} // Simpan hanya id
                  getOptionLabel={option => option.nama_pekerjaan || ''}
                  value={data_po.find(option => option.id === editValue.po_id) || null} // Temukan objek berdasarkan title
                  renderInput={params => (
                    <CustomTextField
                      placeholder='po laptop'
                      {...params}
                      label='PO id'

                      // error={Boolean(errors.po_id)}
                      // {...(errors.po_id && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
                <CustomTextField
                  fullWidth
                  value={editValue.no_do}
                  label='No DO'
                  onChange={e => setEditValue({ ...editValue, no_do: e.target.value })}
                  placeholder='do123'
                  aria-describedby='validation-async-nama-aset'
                />
              </Grid>

              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
                <CustomAutocomplete
                  fullWidth
                  color={'secondary'}
                  options={data_lokasi_gudang}
                  id='lokasi_gudang'
                  onChange={(event, value) => setEditValue({ ...editValue, lokasi_gudang: value.lokasi })} // Simpan hanya id
                  getOptionLabel={option => option.lokasi || ''}
                  value={data_lokasi_gudang.find(option => option.lokasi === editValue.lokasi_gudang) || null} // Temukan objek berdasarkan title
                  renderInput={params => <CustomTextField placeholder='Lampung' {...params} label='Lokasi Gudang' />}
                />
              </Grid>

              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={6}>
                <DatePickerWrapper>
                  <PickersCustomization
                    popperPlacement={popperPlacement}
                    label='Tanggal Masuk'
                    value={editValue.tanggal_masuk}
                    onChange={e => setEditValue({ ...editValue, tanggal_masuk: e })}
                  />
                </DatePickerWrapper>
              </Grid>

              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }}>
                <CustomAutocomplete
                  fullWidth
                  color={'secondary'}
                  options={data_owner}
                  id='owner_id'
                  onChange={(event, value) => setEditValue({ ...editValue, owner_id: value.id })} // Simpan hanya id
                  getOptionLabel={option => option.nama || ''}
                  value={data_owner.find(option => option.id === editValue.owner_id) || null} // Temukan objek berdasarkan title
                  renderInput={params => <CustomTextField placeholder='id1' {...params} label='Pemilik' />}
                />
              </Grid>

              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }}>
                <CustomTextField
                  fullWidth
                  rows={4}
                  multiline
                  value={editValue.keterangan}
                  label='Keterangan'
                  onChange={e => setEditValue({ ...editValue, keterangan: e.target.value })}
                  placeholder='12'
                  aria-describedby='validation-async-keterangan'
                />
              </Grid>
              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }}>
                <CustomTextField
                  fullWidth
                  value={editValue.no_gr}
                  label='No. Goods Receipt'
                  onChange={e => setEditValue({ ...editValue, no_gr: e.target.value })}
                  placeholder='12'
                  aria-describedby='validation-async-no-gr'
                />
              </Grid>
              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
                <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                  File Evidence Saat Ini:
                </Typography>
                {editValue.file_evidence ? (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant='outlined'
                      color='primary'
                      href={`https://iams-api.pins.co.id/storage/${editValue.file_evidence}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Lihat File Evidence
                    </Button>
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      {editValue.file_evidence.split('/').pop()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    Tidak ada file evidence.
                  </Typography>
                )}
              </Grid>
              <Grid item sx={{ mr: [0, 4], mb: [3, 5] }} xs={12}>
                <Typography variant='body2' component='span' sx={{ mb: 2, display: 'block' }}>
                  Upload File Evidence Baru:
                </Typography>

                {/* Tombol Upload */}
                <Button variant='outlined' component='label' color='primary' sx={{ textTransform: 'none' }}>
                  Pilih File
                  <input
                    type='file'
                    accept='application/pdf,image/*'
                    hidden
                    onChange={e => {
                      setNewFile(e.target.files[0])
                      setIsNewFileSelected(true)
                    }}
                  />
                </Button>

                {/* Tampilkan nama file baru jika sudah dipilih */}
                {newFile && (
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    {newFile.name}
                  </Typography>
                )}
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
      </Dialog>
    </>
  )
}

export default AsetMasukTable
