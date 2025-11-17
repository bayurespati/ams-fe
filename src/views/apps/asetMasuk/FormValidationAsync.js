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
import InputFileUploadBtn from 'src/views/components/InputFileUploadBtn'
import { useDispatch, useSelector } from 'react-redux'
import { addData, fetchData } from 'src/store/apps/aset-masuk'
import { fetchData as fetchDataPO } from 'src/store/apps/purchase-order'
import { useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Box from '@mui/material/Box'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import PickersCustomization from 'src/views/components/PickersCustomization'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'

const defaultValues = {
  po_id: '',
  no_do: '',
  lokasi_gudang: '',
  owner_id: '',
  penerima: '',
  keterangan: '',
  no_gr: '',
  tanggal_masuk: ''
}

const FormValidationAsync = ({ data_lokasi_gudang, data_owner, setView }) => {
  const [loading, setLoading] = useState(false)
  const [fileEvidence, setFileEvidence] = useState([])
  const [fileFotoTerima, setFileFotoTerima] = useState([]) // ✅ FOTO TERIMA BARANG
  const [value, setValue] = useState('')

  const data_po = useSelector(state => state.purchaseOrder.data)
  const dispatch = useDispatch()

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  // Fetch data PO
  useEffect(() => {
    dispatch(fetchDataPO({ q: value }))
  }, [dispatch, value])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = async data => {
    setLoading(true)

    try {
      if (data.tanggal_masuk) {
        data.tanggal_masuk = format(new Date(data.tanggal_masuk), 'yyyy-MM-dd')
      }

      const formData = new FormData()
      for (const key in data) {
        if (key !== 'file_evidence' && key !== 'file_foto_terima') {
          formData.append(key, data[key])
        }
      }

      // ✅ Tambahkan file evidence
      if (fileEvidence.length > 0) {
        formData.append('file_evidence', fileEvidence[0])
      }

      // ✅ Tambahkan foto terima barang — pakai nama "file_foto_terima"
      if (fileFotoTerima.length > 0) {
        formData.append('file_foto_terima', fileFotoTerima[0])
      }

      await dispatch(addData(formData)).unwrap()
      toast.success('Form berhasil ditambahkan!')

      dispatch(fetchData({ q: '' }))
      setView('1')
    } catch (error) {
      toast.error('Gagal menambahkan data!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant='text'
        onClick={() => setView('1')}
        startIcon={<Icon icon='tabler:arrow-back'></Icon>}
        size='small'
      >
        Back
      </Button>

      <Card>
        <CardHeader title='DO In Baru' />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={6}>
              {/* PO ID */}
              <Grid item xs={12}>
                <Controller
                  name='po_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color='secondary'
                      options={data_po}
                      id='po_id'
                      onChange={(event, newValue) => onChange(newValue ? newValue.id : '')}
                      getOptionLabel={option => option.nama_pekerjaan || ''}
                      value={data_po.find(option => option.id === value) || null}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='PO ID'
                          placeholder='Pilih deskripsi PO yang tersedia'
                          error={Boolean(errors.po_id)}
                          {...(errors.po_id && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* No DO */}
              <Grid item xs={12}>
                <Controller
                  name='no_do'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='No DO'
                      onChange={onChange}
                      placeholder='Input nomor DO'
                      error={Boolean(errors.no_do)}
                      {...(errors.no_do && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              {/* Lokasi Gudang */}
              <Grid item xs={6}>
                <Controller
                  name='lokasi_gudang'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color='secondary'
                      options={data_lokasi_gudang}
                      id='lokasi_gudang'
                      onChange={(event, newValue) => onChange(newValue ? newValue.lokasi : '')}
                      getOptionLabel={option => option.lokasi || ''}
                      value={data_lokasi_gudang.find(option => option.lokasi === value) || null}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Lokasi Gudang'
                          placeholder='Pilih lokasi gudang'
                          error={Boolean(errors.lokasi_gudang)}
                          {...(errors.lokasi_gudang && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Tanggal Masuk */}
              <Grid item xs={6}>
                <DatePickerWrapper>
                  <Controller
                    name='tanggal_masuk'
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <PickersCustomization
                        popperPlacement={popperPlacement}
                        label='Tanggal Masuk'
                        value={value}
                        onChange={onChange}
                        error={Boolean(errors.tanggal_masuk)}
                        {...(errors.tanggal_masuk && { helperText: 'This field is required' })}
                      />
                    )}
                  />
                </DatePickerWrapper>
              </Grid>

              {/* Penerima */}
              <Grid item xs={12}>
                <Controller
                  name='penerima'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Penerima'
                      onChange={onChange}
                      placeholder='Nama penerima barang'
                      error={Boolean(errors.penerima)}
                      {...(errors.penerima && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              {/* Keterangan */}
              <Grid item xs={12}>
                <Controller
                  name='keterangan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      multiline
                      rows={4}
                      value={value}
                      label='Keterangan'
                      onChange={onChange}
                      placeholder='Catatan tambahan...'
                      error={Boolean(errors.keterangan)}
                      {...(errors.keterangan && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              {/* No GR */}
              <Grid item xs={6}>
                <Controller
                  name='no_gr'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='No. Goods Receipt (Optional)'
                      onChange={onChange}
                      placeholder='Input nomor GR jika ada'
                    />
                  )}
                />
              </Grid>

              {/* Upload File Evidence & Foto Terima Barang */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    pl: 0,
                    ml: 0,
                    gap: 0
                  }}
                >
                  {/* Upload File Evidence */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      Upload File Evidence
                    </Typography>
                    <InputFileUploadBtn files={fileEvidence} setFiles={setFileEvidence} accept='.pdf,.jpg,.jpeg,.png' />
                  </Box>

                  {/* Upload Foto Terima Barang */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      Upload Foto Terima Barang
                    </Typography>
                    <InputFileUploadBtn files={fileFotoTerima} setFiles={setFileFotoTerima} accept='.jpg,.jpeg,.png' />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained'>
                  {loading && (
                    <CircularProgress
                      sx={{
                        color: 'common.white',
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  )}
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default FormValidationAsync
