// ** React Imports
import { useState } from 'react'

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
import { useEffect } from 'react'
import { addData } from 'src/store/apps/aset-masuk'
import { fetchData as fetchDataPO } from 'src/store/apps/purchase-order'
import { useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import PickersCustomization from 'src/views/components/PickersCustomization'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { set } from 'nprogress'

const defaultValues = {
  po_id: '',
  no_do: '',
  lokasi_gudang: '',
  owner_id: '',
  keterangan: '',
  no_gr: '',
  tanggal_masuk: ''
}

import { fetchData } from 'src/store/apps/aset-masuk'

const FormValidationAsync = ({ data_lokasi_gudang, data_owner, setView, setDetail }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [fileEvidence, setFileEvidence] = useState([])
  const [value, setValue] = useState('')
  const data_po = useSelector(state => state.purchaseOrder.data)
  const data_doIn = useSelector(state => state.asetMasuk.data)

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const dispatch = useDispatch()

  let formData = new FormData()

  // ** Hook
  useEffect(() => {
    dispatch(
      fetchDataPO({
        q: value
      })
    )
  }, [dispatch, value])

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = async data => {
    setLoading(true)

    try {
      // Format tanggal masuk
      if (data.tanggal_masuk) {
        data.tanggal_masuk = format(new Date(data.tanggal_masuk), 'yyyy-MM-dd')
      }

      // Bangun FormData
      const formData = new FormData()

      // Tambahkan semua field form ke FormData (kecuali file_evidence)
      for (const key in data) {
        if (key !== 'file_evidence') {
          formData.append(key, data[key])
        }
      }

      // Tambahkan file evidence ke FormData jika ada
      if (fileEvidence.length > 0) {
        formData.append('file_evidence', fileEvidence[0])
      }

      // Kirim ke backend
      const response = await dispatch(addData(formData)).unwrap()
      toast.success('Form berhasil ditambahkan!')

      // Refresh data tabel
      dispatch(fetchData({ q: '' }))

      // Redirect ke halaman daftar DO In
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
              <Grid item xs={12}>
                <Controller
                  name='po_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color={'secondary'}
                      options={data_po}
                      id='po_id'
                      onChange={(event, newValue) => onChange(newValue ? newValue.id : '')} // Simpan hanya id
                      getOptionLabel={option => option.nama_pekerjaan || ''}
                      value={data_po.find(option => option.id === value) || null} // Temukan objek berdasarkan title
                      renderInput={params => (
                        <CustomTextField
                          placeholder='po laptop'
                          {...params}
                          label='PO id'
                          error={Boolean(errors.po_id)}
                          {...(errors.po_id && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
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
                      placeholder='do123'
                      error={Boolean(errors.no_do)}
                      aria-describedby='validation-async-nama-aset'
                      {...(errors.no_do && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name='lokasi_gudang'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color={'secondary'}
                      options={data_lokasi_gudang}
                      id='lokasi_gudang'
                      onChange={(event, newValue) => onChange(newValue ? newValue.lokasi : '')} // Simpan hanya id
                      getOptionLabel={option => option.lokasi || ''}
                      value={data_lokasi_gudang.find(option => option.lokasi === value) || null} // Temukan objek berdasarkan id
                      renderInput={params => (
                        <CustomTextField
                          placeholder='Jakarta Pusat'
                          {...params}
                          label='Lokasi Gudang'
                          error={Boolean(errors.lokasi_gudang)}
                          {...(errors.lokasi_gudang && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

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

              <Grid item xs={12}>
                <Controller
                  name='owner_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color={'secondary'}
                      options={data_owner}
                      id='owner_id'
                      onChange={(event, newValue) => onChange(newValue ? newValue.id : '')} // Simpan hanya id
                      getOptionLabel={option => option.nama || ''}
                      value={data_owner.find(option => option.id === value) || null} // Temukan objek berdasarkan nama
                      renderInput={params => (
                        <CustomTextField
                          placeholder='615'
                          {...params}
                          label='Pemilik'
                          error={Boolean(errors.owner_id)}
                          {...(errors.owner_id && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='keterangan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      rows={4}
                      multiline
                      value={value}
                      label='Keterangan'
                      onChange={onChange}
                      placeholder='12'
                      error={Boolean(errors.keterangan)}
                      aria-describedby='validation-async-keterangan'
                      {...(errors.keterangan && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name='no_gr'
                  control={control}
                  rules={{ required: false }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='No. Goods Receipt'
                      onChange={onChange}
                      placeholder='12'
                      error={Boolean(errors.no_gr)}
                      aria-describedby='validation-async-no-gr'
                      {...(errors.no_gr && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                  {' '}
                  Upload File Evidence{' '}
                </Typography>
                <InputFileUploadBtn
                  files={fileEvidence}
                  setFiles={setFileEvidence}
                  accept='.pdf,.jpg,.jpeg,.png,.gif' // ✅ batasi tipe file
                  maxSizeMB={2} // (opsional) jika ingin tetap limit 2MB
                />
              </Grid>

              <Grid item xs={12}>
                <Button type='submit' variant='contained'>
                  {loading ? (
                    <CircularProgress
                      sx={{
                        color: 'common.white',
                        width: '20px !important',
                        height: '20px !important',
                        mr: theme => theme.spacing(2)
                      }}
                    />
                  ) : null}
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
