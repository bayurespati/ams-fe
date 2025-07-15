// ** React Imports
import { useState } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import InputFileUploadBtn from 'src/views/components/InputFileUploadBtn'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'

const top100Films = [
  { title: '1', id: 1 },
  { title: '2', id: 2 }
]

const defaultValues = {
  nama_barang: '',
  tipe_barang_id: '',
  jenis_barang_id: '',
  jumlah_barang: '',
  no_prpo: '',
  project_id: '',
  file_prpo: '',
  is_lop: 1,
  judul: ''
}

const FormValidationAsync = ({ data_tipe_barang, data_jenis_barang }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [filePrpo, setFilePrpo] = useState([])

  let formData = new FormData()

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const router = useRouter() // Tambahkan ini di dalam komponen FormValidationAsync

  const onSubmit = async data => {
    if (!filePrpo || filePrpo.length === 0) {
      setFileError(true)
      return
    }
    setFileError(false)

    for (const key in data) {
      formData.append(key, data[key])
    }

    // ✅ Ambil hanya file pertama dari array filePrpo
    if (filePrpo && filePrpo.length > 0) {
      formData.append('file_prpo', filePrpo[0])
    }

    formData.append('is_lop', 1)
    if (filePrpo) {
      formData.append('file_prpo', filePrpo)
    }

    setLoading(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Form Submitted')
      router.push('/plan') // 👉 Redirect ke halaman plans setelah sukses
    } catch (error) {
      toast.error('Error')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const [fileError, setFileError] = useState(false)

  return (
    <Card>
      <CardHeader title='Plan Baru' />
      {/* <DropzoneWrapper> */}
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Controller
                name='judul'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Judul Plan'
                    onChange={onChange}
                    placeholder='plan proyek a tahap 1'
                    error={Boolean(errors.judul)}
                    aria-describedby='validation-async-jumlah-aset'
                    {...(errors.judul && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='nama_barang'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Aset'
                    onChange={onChange}
                    placeholder='Leonard'
                    error={Boolean(errors.nama_barang)}
                    aria-describedby='validation-async-nama-aset'
                    {...(errors.nama_barang && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='jenis_barang_id'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => {
                  return (
                    <CustomAutocomplete
                      fullWidth
                      color={'secondary'}
                      options={data_jenis_barang}
                      id='jenis_barang_id'
                      onChange={(event, newValue) => {
                        onChange(newValue ? newValue.id : '')
                      }}
                      getOptionLabel={option => option.nama || ''}
                      value={data_jenis_barang.find(option => option.id === value) || null}
                      renderInput={params => (
                        <CustomTextField
                          placeholder='Pilih Jenis Aset'
                          {...params}
                          label='Jenis Aset'
                          error={Boolean(errors.jenis_barang_id)}
                          {...(errors.jenis_barang_id && { helperText: 'This field is required' })}
                        />
                      )}
                    />
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='tipe_barang_id'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    fullWidth
                    color='secondary'
                    options={data_tipe_barang}
                    id='tipe_barang_id'
                    value={data_tipe_barang.find(option => option.id === value) || null}
                    getOptionLabel={option => option.nama || ''}
                    onChange={(event, newValue) => {
                      console.log('Selected Tipe:', newValue)
                      onChange(newValue ? newValue.id : '') // kirim UUID ke form
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Tipe Aset'
                        placeholder='Pilih Tipe Aset'
                        error={Boolean(errors.tipe_barang_id)}
                        helperText={errors.tipe_barang_id ? 'This field is required' : ''}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='jumlah_barang'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Jumlah Aset'
                    onChange={onChange}
                    placeholder='12'
                    error={Boolean(errors.jumlah_barang)}
                    aria-describedby='validation-async-jumlah-aset'
                    {...(errors.jumlah_barang && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='project_id'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    fullWidth
                    color={'secondary'}
                    options={top100Films}
                    id='project_id'
                    onChange={(event, newValue) => onChange(newValue ? newValue.id : '')} // Simpan hanya id
                    getOptionLabel={option => option.title || ''}
                    value={top100Films.find(option => option.id === value) || null} // Temukan objek berdasarkan id
                    renderInput={params => (
                      <CustomTextField
                        placeholder='proyek A'
                        {...params}
                        label='Proyek'
                        error={Boolean(errors.project_id)}
                        {...(errors.project_id && { helperText: 'This field is required' })}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='no_prpo'
                control={control}
                rules={{ required: false }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='No. PRPO'
                    onChange={onChange}
                    placeholder='12'
                    error={Boolean(errors.no_prpo)}
                    aria-describedby='validation-async-no-prpo'
                    {...(errors.no_prpo && { helperText: 'This field is required' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                Upload File PRPO
              </Typography>
              <InputFileUploadBtn files={filePrpo} setFiles={setFilePrpo} />
              {fileError && (
                <Typography variant='caption' color='error'>
                  File is required
                </Typography>
              )}
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
      {/* </DropzoneWrapper> */}
    </Card>
  )
}

export default FormValidationAsync
