// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'

// ** Icons
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import InputFileUploadBtn from 'src/views/components/InputFileUploadBtn'

// ** Third Party
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'

// ** Redux actions
import { fetchCompany } from 'src/store/apps/company'
import { fetchData as fetchTypes } from 'src/store/apps/type'
import { fetchData as fetchVarieties } from 'src/store/apps/variety'

// ============ CONSTANTS ============
const defaultItem = { nama_barang: '', jenis_barang_id: '', tipe_barang_id: '', jumlah_barang: '' }
const defaultValues = {
  lopType: 'LOP',
  project_id: '',
  project_manual: '',
  no_prpo: '',
  mitra_ids: [],
  file_prpo: null
}

// ============ HELPER FUNCTIONS ============
const formatData = (data, dataType = 'default') => {
  if (!Array.isArray(data)) return []
  return data
    .map(item => {
      const nama = item.nama || item.name || ''
      const id = item.id
      return nama && id ? { id, nama, originalData: item } : null
    })
    .filter(Boolean)
}

const validateItemField = (currentItemErrors, field, value, formattedJenisBarang, formattedTipeBarang) => {
  const newItemErrors = { ...currentItemErrors }
  delete newItemErrors[field]

  // empty
  if (!value || (typeof value === 'string' && !value.trim())) {
    newItemErrors[field] = 'Field ini harus diisi'
    return newItemErrors
  }

  if (field === 'jumlah_barang') {
    const jumlah = Number(value)
    if (Number.isNaN(jumlah) || jumlah < 1) {
      newItemErrors[field] = 'Jumlah minimal 1'
    }
    return newItemErrors
  }

  const matchesOption = (optList, val) => {
    if (!Array.isArray(optList)) return false
    return optList.some(opt => {
      // compare against multiple possible id fields (loose equality)
      if (opt?.id != null && opt.id == val) return true
      if (opt?.originalData?.id != null && opt.originalData.id == val) return true
      if (opt?.originalData?.uuid != null && opt.originalData.uuid == val) return true
      return false
    })
  }

  if (field === 'jenis_barang_id') {
    if (!matchesOption(formattedJenisBarang, value)) {
      newItemErrors[field] = 'Jenis harus dipilih'
    }
    return newItemErrors
  }

  if (field === 'tipe_barang_id') {
    if (!matchesOption(formattedTipeBarang, value)) {
      newItemErrors[field] = 'Tipe harus dipilih'
    }
    return newItemErrors
  }

  return newItemErrors
}
const validateAllItems = (items, formattedJenisBarang, formattedTipeBarang) => {
  const errors = {}
  let isValid = true

  const matchesOption = (optList, val) => {
    if (!Array.isArray(optList)) return false
    return optList.some(opt => {
      if (opt?.id != null && opt.id == val) return true
      if (opt?.originalData?.id != null && opt.originalData.id == val) return true
      if (opt?.originalData?.uuid != null && opt.originalData.uuid == val) return true
      return false
    })
  }

  items.forEach((item, idx) => {
    errors[idx] = {}

    if (!item.nama_barang?.trim()) {
      errors[idx].nama_barang = 'Nama Barang harus diisi'
      isValid = false
    }

    if (!item.jenis_barang_id || !matchesOption(formattedJenisBarang, item.jenis_barang_id)) {
      errors[idx].jenis_barang_id = 'Jenis harus dipilih'
      isValid = false
    }

    if (!item.tipe_barang_id || !matchesOption(formattedTipeBarang, item.tipe_barang_id)) {
      errors[idx].tipe_barang_id = 'Tipe harus dipilih'
      isValid = false
    }

    const jumlah = Number(item.jumlah_barang)
    if (Number.isNaN(jumlah) || jumlah < 1) {
      errors[idx].jumlah_barang = 'Jumlah minimal 1'
      isValid = false
    }
  })

  return { isValid, errors }
}

const extractCompanyIds = (mitraIds, formattedMitras) => {
  const ids = []
  if (!Array.isArray(mitraIds)) return ids

  mitraIds.forEach(mitra => {
    const uuid = mitra?.originalData?.uuid || mitra?.originalData?.id
    if (uuid) ids.push(uuid)
  })

  return ids
}

const buildItemsFormData = (items, formattedJenisBarang, formattedTipeBarang, formDataToSend) => {
  const findMatch = (optList, val) => {
    if (!Array.isArray(optList)) return null
    return optList.find(opt => {
      if (opt?.id != null && opt.id == val) return true
      if (opt?.originalData?.id != null && opt.originalData.id == val) return true
      if (opt?.originalData?.uuid != null && opt.originalData.uuid == val) return true
      return false
    })
  }

  items.forEach((item, idx) => {
    const jenisOpt = findMatch(formattedJenisBarang, item.jenis_barang_id)
    const tipeOpt = findMatch(formattedTipeBarang, item.tipe_barang_id)

    const jenisSend = jenisOpt?.originalData?.uuid || jenisOpt?.originalData?.id || item.jenis_barang_id || ''
    const tipeSend = tipeOpt?.originalData?.uuid || tipeOpt?.originalData?.id || item.tipe_barang_id || ''

    formDataToSend.append(`items[${idx}][nama_barang]`, item.nama_barang || '')
    formDataToSend.append(`items[${idx}][jenis_barang_id]`, jenisSend.toString())
    formDataToSend.append(`items[${idx}][tipe_barang_id]`, tipeSend.toString())
    formDataToSend.append(`items[${idx}][jumlah_barang]`, (Number(item.jumlah_barang) || 0).toString())
  })
}

// ============ MAIN COMPONENT ============
const FormValidationAsync = () => {
  const router = useRouter()
  const theme = useTheme()

  const [loading, setLoading] = useState(false)
  const [filePrpo, setFilePrpo] = useState(null)
  const [fileError, setFileError] = useState(false)
  const [projects, setProjects] = useState([])
  const [loadingStates, setLoadingStates] = useState({ projects: false, tipe: true, jenis: true, mitra: true })
  const [items, setItems] = useState([{ ...defaultItem }])
  const [itemErrors, setItemErrors] = useState([{}])
  const [selectedMitrasCount, setSelectedMitrasCount] = useState(0)

  const dispatch = useDispatch()
  const mitras = useSelector(state => state.company?.data) || []
  const tipeBarangData = useSelector(state => state.type?.data || [])
  const jenisBarangData = useSelector(state => state.variety?.data || [])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue
  } = useForm({
    defaultValues,
    mode: 'onChange'
  })

  const lopType = watch('lopType')
  const mitraIds = watch('mitra_ids')

  const formattedTipeBarang = formatData(tipeBarangData, 'tipe')
  const formattedJenisBarang = formatData(jenisBarangData, 'jenis')
  const formattedMitras = formatData(mitras, 'mitra')

  // Debug: Log data yang diterima
  useEffect(() => {
    console.log('=== RAW DATA FROM REDUX ===')
    console.log('tipeBarangData:', tipeBarangData)
    console.log('jenisBarangData:', jenisBarangData)
    console.log('mitras:', mitras)
  }, [tipeBarangData, jenisBarangData, mitras])

  // Debug: Log formatted data
  useEffect(() => {
    console.log('=== FORMATTED DATA ===')
    console.log('formattedTipeBarang:', formattedTipeBarang)
    console.log('formattedJenisBarang:', formattedJenisBarang)
    console.log('formattedMitras:', formattedMitras)
  }, [formattedTipeBarang, formattedJenisBarang, formattedMitras])

  useEffect(() => {
    setSelectedMitrasCount(Array.isArray(mitraIds) ? mitraIds.length : 0)
  }, [mitraIds])

  useEffect(() => {
    const loadData = async () => {
      setLoadingStates(prev => ({ ...prev, tipe: true, jenis: true, mitra: true }))
      await Promise.allSettled([dispatch(fetchTypes({})), dispatch(fetchVarieties({})), dispatch(fetchCompany())])
      setLoadingStates(prev => ({ ...prev, tipe: false, jenis: false, mitra: false }))
    }
    loadData()
  }, [dispatch])

  useEffect(() => {
    if (lopType === 'LOP') {
      setLoadingStates(prev => ({ ...prev, projects: true }))
      axios
        .get(`${process.env.NEXT_PUBLIC_AMS_URL}star/get-projects`)
        .then(res => {
          const arr = Object.entries(res.data.data || {}).map(([nama, id]) => ({ id: id.toString(), nama }))
          setProjects(arr)
        })
        .catch(() => toast.error('Gagal memuat data project'))
        .finally(() => setLoadingStates(prev => ({ ...prev, projects: false })))
    } else {
      setProjects([])
      setValue('project_id', '')
    }
  }, [lopType, setValue])

  const addItem = () => {
    setItems([...items, { ...defaultItem }])
    setItemErrors([...itemErrors, {}])
  }

  const removeItem = idx => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx))
      setItemErrors(itemErrors.filter((_, i) => i !== idx))
    }
  }

  const updateItem = (idx, field, value) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    setItems(newItems)

    // Debug: Log saat update item
    console.log(`=== UPDATE ITEM ${idx} ===`)
    console.log(`Field: ${field}, Value: ${value}, Type: ${typeof value}`)
    console.log(`Updated item:`, newItems[idx])

    // Validasi langsung
    if (field === 'jenis_barang_id') {
      const found = formattedJenisBarang.some(j => j.id == value)
      console.log(
        `Validasi Jenis: value=${value}, found=${found}, available:`,
        formattedJenisBarang.map(j => ({ id: j.id, type: typeof j.id }))
      )
    }
    if (field === 'tipe_barang_id') {
      const found = formattedTipeBarang.some(t => t.id == value)
      console.log(
        `Validasi Tipe: value=${value}, found=${found}, available:`,
        formattedTipeBarang.map(t => ({ id: t.id, type: typeof t.id }))
      )
    }

    const newErrors = [...itemErrors]
    if (!newErrors[idx]) newErrors[idx] = {}

    const updatedErrors = validateItemField(newErrors[idx], field, value, formattedJenisBarang, formattedTipeBarang)
    newErrors[idx] = updatedErrors
    console.log(`Errors setelah validasi:`, newErrors[idx])
    setItemErrors(newErrors)
  }

  const onSubmit = async formData => {
    const isFormValid = await trigger()
    if (!isFormValid) {
      toast.error('Harap periksa kembali form Anda')
      return
    }

    if (!filePrpo) {
      setFileError(true)
      toast.error('File PRPO wajib diupload')
      return
    }
    setFileError(false)

    if (lopType === 'LOP' && !formData.project_id) {
      toast.error('Project harus dipilih untuk LOP')
      return
    }

    if (lopType === 'NONLOP' && !formData.project_manual?.trim()) {
      toast.error('Nama Proyek harus diisi untuk NON LOP')
      return
    }

    const { isValid, errors: itemErrs } = validateAllItems(items, formattedJenisBarang, formattedTipeBarang)
    if (!isValid) {
      setItemErrors(itemErrs)
      toast.error('Harap lengkapi semua data barang')
      return
    }

    if (!formData.mitra_ids?.length) {
      toast.error('Pilih minimal satu mitra')
      return
    }

    if (!formData.no_prpo?.trim()) {
      toast.error('No PR/PO harus diisi')
      return
    }

    const fd = new FormData()
    fd.append('is_lop', lopType === 'LOP' ? '1' : '0')

    if (lopType === 'LOP') {
      const proj = projects.find(p => p.id === formData.project_id)
      fd.append('judul', proj?.nama || '')
      fd.append('project_id', formData.project_id || '')
    } else {
      const projectName = formData.project_manual || ''
      fd.append('judul', formData.project_manual || '')
      fd.append('project_id', '')
      fd.append('project_name', projectName)
    }

    buildItemsFormData(items, formattedJenisBarang, formattedTipeBarang, fd)

    const companyIds = extractCompanyIds(formData.mitra_ids, formattedMitras)
    if (!companyIds.length) {
      toast.error('Tidak ada ID mitra yang valid')
      return
    }

    companyIds.forEach(id => {
      fd.append('company_ids[]', id.toString())
    })

    fd.append('no_prpo', formData.no_prpo || '')

    let fileToUpload = filePrpo instanceof File ? filePrpo : filePrpo?.[0]
    if (!fileToUpload) {
      toast.error('File PRPO tidak valid')
      return
    }
    fd.append('file_prpo', fileToUpload)

    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
        timeout: 30000
      })
      toast.success('Plan berhasil dibuat!')
      router.push('/plan')
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : msgs
          toast.error(`${field}: ${msg}`)
        })
      } else {
        toast.error(error.response?.data?.message || 'Gagal menyimpan plan')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Buat Plan Baru' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            {/* Tipe Plan */}
            <Grid item xs={12}>
              <Controller
                name='lopType'
                control={control}
                rules={{ required: 'Tipe Plan harus dipilih' }}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    fullWidth
                    color='secondary'
                    options={['LOP', 'NONLOP']}
                    value={value}
                    onChange={(e, val) => onChange(val)}
                    renderInput={p => (
                      <CustomTextField
                        {...p}
                        placeholder='Pilih tipe plan'
                        label='Tipe Plan *'
                        error={Boolean(errors.lopType)}
                        helperText={errors.lopType?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Project / Project Manual */}
            <Grid item xs={12}>
              {lopType === 'LOP' ? (
                <Controller
                  name='project_id'
                  control={control}
                  rules={{ required: 'Project harus dipilih untuk LOP' }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color='secondary'
                      options={projects}
                      onChange={(e, val) => onChange(val?.id || '')}
                      getOptionLabel={o => o.nama || ''}
                      value={projects.find(p => p.id === value) || null}
                      loading={loadingStates.projects}
                      renderInput={p => (
                        <CustomTextField
                          {...p}
                          placeholder='Pilih project'
                          label='Project *'
                          error={Boolean(errors.project_id)}
                          helperText={errors.project_id?.message}
                        />
                      )}
                    />
                  )}
                />
              ) : (
                <Controller
                  name='project_manual'
                  control={control}
                  rules={{ required: 'Nama Project harus diisi untuk NON LOP' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      color='secondary'
                      label='Nama Project *'
                      placeholder='Masukkan nama project'
                      error={Boolean(errors.project_manual)}
                      helperText={errors.project_manual?.message}
                    />
                  )}
                />
              )}
            </Grid>

            {/* Items */}
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Data Barang *
              </Typography>
              {items.map((item, idx) => (
                <Box key={idx} sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant='subtitle1'>Item {idx + 1}</Typography>
                    {items.length > 1 && (
                      <IconButton color='error' onClick={() => removeItem(idx)} size='small'>
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    {/* Nama Barang */}
                    <Grid item xs={12}>
                      <CustomTextField
                        fullWidth
                        color='secondary'
                        value={item.nama_barang}
                        label='Nama Barang *'
                        onChange={e => updateItem(idx, 'nama_barang', e.target.value)}
                        placeholder='Masukkan nama barang'
                        error={Boolean(itemErrors[idx]?.nama_barang)}
                        helperText={itemErrors[idx]?.nama_barang}
                      />
                    </Grid>

                    {/* Jenis & Tipe */}
                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        fullWidth
                        color='secondary'
                        options={formattedJenisBarang}
                        onChange={(e, val) => {
                          console.log('=== JENIS BARANG SELECTED ===')
                          console.log('Selected value:', val)
                          console.log('Available options:', formattedJenisBarang)
                          updateItem(idx, 'jenis_barang_id', val?.id || '')
                        }}
                        getOptionLabel={o => o.nama || ''}
                        value={formattedJenisBarang.find(j => j.id == item.jenis_barang_id) || null}
                        loading={loadingStates.jenis}
                        isOptionEqualToValue={(o, v) => {
                          if (!o || !v) return false
                          return (
                            o.id == v.id ||
                            o.id == v ||
                            (o.originalData?.id && o.originalData.id == v) ||
                            (o.originalData?.uuid && o.originalData.uuid == v)
                          )
                        }}
                        renderInput={p => (
                          <CustomTextField
                            {...p}
                            placeholder='Pilih jenis barang'
                            label='Jenis Barang *'
                            error={Boolean(itemErrors[idx]?.jenis_barang_id)}
                            // helperText={itemErrors[idx]?.jenis_barang_id || `Tersedia: ${formattedJenisBarang.length}`}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <CustomAutocomplete
                        fullWidth
                        color='secondary'
                        options={formattedTipeBarang}
                        onChange={(e, val) => {
                          console.log('=== TIPE BARANG SELECTED ===')
                          console.log('Selected value:', val)
                          console.log('Available options:', formattedTipeBarang)
                          updateItem(idx, 'tipe_barang_id', val?.id || '')
                        }}
                        getOptionLabel={o => o.nama || ''}
                        value={formattedTipeBarang.find(t => t.id == item.tipe_barang_id) || null}
                        loading={loadingStates.tipe}
                        isOptionEqualToValue={(o, v) => {
                          if (!o || !v) return false
                          return (
                            o.id == v.id ||
                            o.id == v ||
                            (o.originalData?.id && o.originalData.id == v) ||
                            (o.originalData?.uuid && o.originalData.uuid == v)
                          )
                        }}
                        renderInput={p => (
                          <CustomTextField
                            {...p}
                            placeholder='Pilih tipe barang'
                            label='Tipe Barang *'
                            error={Boolean(itemErrors[idx]?.tipe_barang_id)}
                            // helperText={itemErrors[idx]?.tipe_barang_id || `Tersedia: ${formattedTipeBarang.length}`}
                          />
                        )}
                      />
                    </Grid>

                    {/* Jumlah */}
                    <Grid item xs={12} sm={4}>
                      <CustomTextField
                        fullWidth
                        color='secondary'
                        value={item.jumlah_barang}
                        label='Jumlah Barang *'
                        onChange={e => updateItem(idx, 'jumlah_barang', e.target.value)}
                        placeholder='Masukkan jumlah'
                        type='number'
                        error={Boolean(itemErrors[idx]?.jumlah_barang)}
                        helperText={itemErrors[idx]?.jumlah_barang}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button startIcon={<AddCircleOutline />} onClick={addItem} variant='outlined' sx={{ mt: 2 }}>
                Tambah Item
              </Button>
            </Grid>

            {/* No PRPO */}
            <Grid item xs={12}>
              <Controller
                name='no_prpo'
                control={control}
                rules={{ required: 'No PR/PO harus diisi', minLength: { value: 3, message: 'Minimal 3 karakter' } }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    color='secondary'
                    label='No PR/PO *'
                    placeholder='Masukkan nomor PR/PO'
                    error={Boolean(errors.no_prpo)}
                    helperText={errors.no_prpo?.message}
                  />
                )}
              />
            </Grid>

            {/* Mitra */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  Mitra *
                </Typography>
                {selectedMitrasCount > 0 && (
                  <Chip
                    label={`${selectedMitrasCount} dipilih`}
                    size='small'
                    color='primary'
                    variant='outlined'
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              <Controller
                name='mitra_ids'
                control={control}
                rules={{
                  required: 'Minimal satu mitra harus dipilih',
                  validate: v => Array.isArray(v) && v.length > 0
                }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    fullWidth
                    options={formattedMitras}
                    getOptionLabel={o => o.nama || ''}
                    value={value || []}
                    onChange={(e, val) => {
                      console.log('=== MITRA SELECTED ===')
                      console.log('Selected values:', val)
                      console.log('Available options:', formattedMitras)
                      onChange(val)
                    }}
                    loading={loadingStates.mitra}
                    isOptionEqualToValue={(o, v) => o?.id == v?.id}
                    renderInput={p => (
                      <CustomTextField
                        {...p}
                        color='secondary'
                        placeholder='Pilih mitra (bisa lebih dari satu)'
                        label=''
                        error={Boolean(errors.mitra_ids)}
                        helperText={errors.mitra_ids?.message}
                      />
                    )}
                    renderTags={(v, getTagProps) =>
                      v.map((opt, i) => (
                        <Chip
                          key={opt.id}
                          label={opt.nama}
                          size='small'
                          {...getTagProps({ index: i })}
                          sx={{
                            mr: 1,
                            mb: 1,
                            backgroundColor: theme.palette.primary.light + '20',
                            border: `1px solid ${theme.palette.primary.light}`
                          }}
                        />
                      ))
                    }
                    noOptionsText='Tidak ada mitra'
                    loadingText='Memuat...'
                  />
                )}
              />
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 600 }}>
                Upload File PRPO *
              </Typography>
              <InputFileUploadBtn
                label='PRPO'
                id='file_prpo'
                files={filePrpo}
                setFiles={setFilePrpo}
                accept='.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx'
                required
              />
              {fileError && (
                <Typography variant='caption' color='error' sx={{ display: 'block', mt: 1 }}>
                  File PRPO wajib diupload
                </Typography>
              )}
            </Grid>

            {/* Submit */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button type='submit' variant='contained' disabled={loading} sx={{ minWidth: 120 }}>
                {loading && <CircularProgress size={20} sx={{ color: 'common.white', mr: 1 }} />}
                {loading ? 'Menyimpan...' : 'Submit'}
              </Button>
              <Button type='button' variant='outlined' onClick={() => router.back()}>
                Batal
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationAsync
