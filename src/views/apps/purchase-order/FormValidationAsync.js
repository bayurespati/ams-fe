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
import { useTheme } from '@mui/material'
import InputFileUpload from 'src/views/components/InputFileUploadBtn'
import { format } from 'date-fns'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import PickersCustomization from 'src/views/components/PickersCustomization'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Styled Component
import { fetchData } from 'src/store/apps/plan'

const defaultValues = {
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
}

const FormValidationAsync = () => {
  const router = useRouter()
  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  // ** States
  const [loading, setLoading] = useState(false)
  const [filePoSpkPks, setFilePoSpkPks] = useState([])
  const [fileBoq, setFileBoq] = useState([])
  const [value, setValue] = useState('')
  const [tglDeliv, setTglDeliv] = useState(new Date())
  const [tglPoSpk, setTglPoSpk] = useState(new Date())

  let formData = new FormData()

  const data_plan = useSelector(state => state.plan.data)

  //** Hooks
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchData({ q: value }))
  }, [dispatch, value])

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const [filePoSpkPksError, setFilePoSpkPksError] = useState(false)
  const [fileBoqError, setFileBoqError] = useState(false)

  const onSubmit = async data => {
    if (data.tanggal_po_spk_pks) {
      data.tanggal_po_spk_pks = format(new Date(data.tanggal_po_spk_pks), 'yyyy-MM-dd')
    }
    if (data.tanggal_delivery) {
      data.tanggal_delivery = format(new Date(data.tanggal_delivery), 'yyyy-MM-dd')
    }

    if (!filePoSpkPks || filePoSpkPks.length === 0) {
      setFilePoSpkPksError(true)

      return
    }
    setFilePoSpkPksError(false)

    if (!fileBoq || fileBoq.length === 0) {
      setFileBoqError(true)

      return
    }
    setFileBoqError(false)

    // Siapkan FormData
    const formData = new FormData()

    for (const key in data) {
      if (key !== 'file_po_spk_pks' && key !== 'file_boq') {
        formData.append(key, data[key])
      }
    }

    // Kirim file pertama (bukan array-nya)
    formData.append('file_po_spk_pks', filePoSpkPks[0])
    formData.append('file_boq', fileBoq[0])

    setLoading(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}po`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Form Submitted')
      router.push('/purchase-order')
    } catch (error) {
      toast.error('Error')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='PO Baru' />
      <DatePickerWrapper>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Controller
                  name='plan_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      fullWidth
                      color='secondary'
                      options={data_plan}
                      id='plan_id'
                      onChange={(event, newValue) => onChange(newValue ? newValue.id : '')}
                      getOptionLabel={option => option.judul || ''}
                      value={data_plan.find(option => option.id === value) || null}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          placeholder='Plan A'
                          label='Nama Plan'
                          error={Boolean(errors.plan_id)}
                          helperText={errors.plan_id && 'This field is required'}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='nama_pekerjaan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Nama Pekerjaan'
                      onChange={onChange}
                      placeholder='pekerjaan A'
                      error={Boolean(errors.nama_pekerjaan)}
                      aria-describedby='validation-async-nama-pekerjaan'
                      {...(errors.nama_pekerjaan && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='no_po_spk_pks'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='no_po_spk_pks'
                      onChange={onChange}
                      placeholder='no_po_spk_pks'
                      error={Boolean(errors.no_po_spk_pks)}
                      aria-describedby='validation-async-nama-pekerjaan'
                      {...(errors.no_po_spk_pks && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Controller
                  name='tanggal_po_spk_pks'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <PickersCustomization
                      popperPlacement={popperPlacement}
                      label='Tanggal PO SPK PKS'
                      value={value}
                      onChange={onChange}
                      error={Boolean(errors.no_po_spk_pks)}
                      {...(errors.tanggal_po_spk_pks && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' component='span' sx={{ mt: 0 }}>
                  Upload File PO SPK PKS
                </Typography>
                <InputFileUpload
                  label='PO SPK PKS'
                  id='file_po_spk_pks'
                  files={filePoSpkPks}
                  setFiles={setFilePoSpkPks}
                />
                {filePoSpkPksError && (
                  <Typography variant='caption' color='error'>
                    File is required
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='nilai_pengadaan'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Nilai Pengadaan'
                      onChange={onChange}
                      placeholder='12'
                      error={Boolean(errors.nilai_pengadaan)}
                      aria-describedby='validation-async-nilai-pengadaan'
                      {...(errors.nilai_pengadaan && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Controller
                  name='tanggal_delivery'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <PickersCustomization
                      popperPlacement={popperPlacement}
                      label='Tanggal Delivery'
                      value={value}
                      onChange={onChange}
                      error={Boolean(errors.tanggal_delivery)}
                      {...(errors.tanggal_delivery && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant='body2' component='span' sx={{ mt: 0 }}>
                  Upload File BOQ
                </Typography>
                <InputFileUpload label='BOQ' id='file_boq' files={fileBoq} setFiles={setFileBoq} />
                {fileBoqError && (
                  <Typography variant='caption' color='error'>
                    File is required
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='akun'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Akun'
                      onChange={onChange}
                      placeholder='12'
                      error={Boolean(errors.akun)}
                      aria-describedby='validation-async-akun'
                      {...(errors.akun && { helperText: 'This field is required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='cost_center'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='cost_center'
                      onChange={onChange}
                      placeholder='12'
                      error={Boolean(errors.cost_center)}
                      aria-describedby='validation-async-cost_center'
                      {...(errors.cost_center && { helperText: 'This field is required' })}
                    />
                  )}
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
      </DatePickerWrapper>
    </Card>
  )
}

export default FormValidationAsync
