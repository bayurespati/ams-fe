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
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { fetchData as fetchAllItem, addData as addItemData, verifyData } from 'src/store/apps/item-doin'
import EditDialog from './EditDialog'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import InputFileUploadBtn from 'src/views/components/InputFileUploadBtn'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios, { all } from 'axios'
import { Label } from 'recharts'

const Detail = ({ id, setView }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [fileSerialNumber, setFileSerialNumber] = useState([])
  const [value, setValue] = useState('')
  const [tabValue, setTabValue] = useState('1')

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue)
  }

  const [items, setItems] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [data, setData] = useState({})
  const filteredItems = useSelector(state => state.itemDoin.data)
  const [editedData, setEditedData] = useState({})
  const validFilteredItems = filteredItems || []

  const [open, setOpen] = useState(false)

  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const dispatch = useDispatch()

  let formData = new FormData()

  // ** Hook
  useEffect(() => {
    dispatch(fetchAllItem({ q: id }))
    fetchSingleDetail(id)
  }, [dispatch, id])

  useEffect(() => {
    if (data?.po?.plan_id !== undefined) {
      fetchSinglePlan(data?.po?.plan_id)
    }
  }, [filteredItems, data.po])

  console.log('ID yang dikirim ke Detail:', id)

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  console.log('Data Detail: ', data)

  const [showPreview, setShowPreview] = useState(false)

  const handleDialogToggle = item => {
    setEditedData(item)
    setOpen(!open)
  }

  const handleSubmitItems = async () => {
    try {
      const payload = {
        do_in_id: id,
        items: items
          .filter(item => item.sn !== '' && item.terisi === false)
          .map(item => ({
            sn: item.sn,
            jumlah: 1
          }))
      }
      const response = await dispatch(addItemData(payload)).unwrap()

      toast.success('Items Submitted')
    } catch (error) {
      toast.error('Error Submitting Items')
      console.error(error)
    }
  }

  const handleSubmitFile = async () => {
    try {
      formData.append('do_in_id', id)
      formData.append('file', fileSerialNumber[0])

      const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('File Uploaded')
    } catch (error) {
      toast.error('Error Uploading File')
      console.error(error)
    }
  }

  const handleVerifyItem = async index => {
    try {
      const item = filteredItems[index]

      const response = dispatch(verifyData(item)).unwrap()

      if (response.data.status === 'success') {
        toast.success('Item Verified')
        const newItems = [...items]
        newItems[index].is_verified = true
        setItems(newItems)
      } else {
        toast.error('Error Verifying Item')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleNextPage = () => {
    if (currentPage < Math.ceil(items.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const fetchSingleDetail = async id => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}do-in/detail`, {
        params: { id }
      })

      setData(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSinglePlan = async plan_id => {
    try {
      if (plan_id !== undefined) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}plans/detail`, {
          params: { id: plan_id }
        })
        const barang = response.data.data

        const items = []

        let snIndex = 0 // Index untuk mengambil sn dari validFilteredItems
        for (let i = 0; i < barang.jumlah_barang; i++) {
          items.push({
            id: snIndex < validFilteredItems.length ? validFilteredItems[snIndex].id : '',
            do_in_id: snIndex < validFilteredItems.length ? validFilteredItems[snIndex].do_in_id : id,
            nama_barang: barang.nama_barang,
            index: i,
            sn: snIndex < validFilteredItems.length ? validFilteredItems[snIndex].sn : '',
            is_verified: snIndex < validFilteredItems.length ? validFilteredItems[snIndex].is_verified : false,
            terisi: snIndex < validFilteredItems.length ? true : false,
            jumlah: barang.jumlah_barang
          })
          snIndex++
        }

        setItems(items)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

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
        <CardHeader title={`Detail ${data?.po?.nama_pekerjaan}`} />
        <CardContent>
          <Box>
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Typography variant='body1'>Nama Pekerjaan</Typography>
                <Typography variant='body1'>{data?.po?.nama_pekerjaan}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='body1'>PO Id</Typography>
                <Typography variant='body1'>{data?.po_id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='body1'>No. DO</Typography>
                <Typography variant='body1'>{data?.no_do}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='body1'>Lokasi Gudang</Typography>
                <Typography variant='body1'>{data?.lokasi_gudang}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body1'>Tanggal Masuk</Typography>
                <Typography variant='body1'>{data?.tanggal_masuk}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body1'>No. GR</Typography>
                <Typography variant='body1'>{data?.no_gr}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body1'>Keterangan</Typography>
                <Typography variant='body1'>{data?.keterangan}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body1'>File Evidence</Typography>

                {data?.file_evidence ? (
                  <Box sx={{ mt: 2 }}>
                    {!showPreview ? (
                      <>
                        <Button
                          variant='outlined'
                          color='primary'
                          size='small'
                          onClick={() => {
                            const url = `https://iams-api.pins.co.id/storage/${data.file_evidence}`
                            window.open(url, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          Lihat File Evidence
                        </Button>

                        {/* Tampilkan nama file di bawah tombol */}
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          {data.file_evidence.split('/').pop()}
                        </Typography>
                      </>
                    ) : (
                      <>
                        {/\.(pdf)$/i.test(data.file_evidence) ? (
                          <iframe
                            src={`https://iams-api.pins.co.id/storage/${data.file_evidence}`}
                            width='100%'
                            height='500px'
                            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                            title='File Preview'
                          />
                        ) : /\.(jpg|jpeg|png|gif)$/i.test(data.file_evidence) ? (
                          <img
                            src={`https://iams-api.pins.co.id/storage/${data.file_evidence}`}
                            alt='File Evidence'
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                          />
                        ) : (
                          <Button
                            variant='outlined'
                            color='primary'
                            size='small'
                            href={`https://iams-api.pins.co.id/storage/${data.file_evidence}`}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            Download File
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    Tidak ada file evidence
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ mt: 5 }}>
        <CardHeader title='Daftar Item' />
        <CardContent>
          <Box>
            <Typography variant='h6'>Jumlah Items : {currentItems.length}</Typography>
            <TabContext value={tabValue}>
              <TabList onChange={handleChangeTab} aria-label='simple tabs example'>
                <Tab value='1' label='Manual' />
                <Tab value='2' label='Excel' />
              </TabList>

              <TabPanel value='1'>
                <form>
                  {currentItems.map((item, index) => (
                    <Grid container spacing={1} key={index} sx={{ mt: 5 }}>
                      <Grid item xs={4}>
                        <CustomTextField
                          label={`Item Name ${startIndex + index + 1}`}
                          defaultValue={item.nama_barang}
                          id='form-props-read-only-input'
                          inputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Label>{`Serial Number ${startIndex + index + 1}`}</Label>
                        <CustomTextField
                          label='Serial Number'
                          value={item?.sn}
                          placeholder='SN12xxx'
                          id='form-props-full-width'
                          onChange={e => handleItemChange(startIndex + index, 'sn', e.target.value)}
                          inputProps={{ readOnly: item.terisi }}
                        />
                      </Grid>

                      {item.terisi ? ( // Jika item sudah terisi, maka tampilkan is_verified dan edit button
                        <Grid item xs={4}>
                          {item.is_verified === 1 ? (
                            <Typography variant='body1' color='primary'>
                              Verified
                            </Typography>
                          ) : (
                            <>
                              <IconButton color='success' onClick={e => handleVerifyItem(index)}>
                                <Icon icon='tabler:square-check' width='28' height='28' />
                              </IconButton>
                              <IconButton color='secondary' onClick={() => handleDialogToggle(item)}>
                                <Icon icon='tabler:edit' width='28' height='28' />
                              </IconButton>
                            </>
                          )}
                        </Grid>
                      ) : null}
                    </Grid>
                  ))}
                  <Box mt={2} display='flex' justifyContent='center'>
                    <IconButton color='primary' onClick={handlePrevPage} disabled={currentPage === 1} size='small'>
                      <Icon icon='tabler:square-arrow-left' width='2em' height='2em' />
                    </IconButton>
                    <IconButton
                      color='primary'
                      onClick={handleNextPage}
                      disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
                      size='small'
                    >
                      <Icon icon='tabler:square-arrow-right' width='2em' height='2em' />
                    </IconButton>
                  </Box>
                  <Box mt={2}>
                    <Button variant='contained' color='primary' onClick={handleSubmitItems}>
                      Submit Items
                    </Button>
                  </Box>
                </form>
              </TabPanel>
              <TabPanel value='2'>
                <form>
                  <Grid item xs={6}>
                    <Typography variant='body2' component='span' sx={{ mb: 2 }}>
                      {' '}
                      Upload File Serial Number{' '}
                    </Typography>
                    <InputFileUploadBtn
                      files={fileSerialNumber}
                      setFiles={setFileSerialNumber}
                      accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv'
                    />
                    <Box mt={2}>
                      <Button variant='contained' color='primary' onClick={handleSubmitFile}>
                        Submit Items
                      </Button>
                    </Box>
                  </Grid>
                </form>
              </TabPanel>
            </TabContext>
          </Box>
        </CardContent>
      </Card>
      <EditDialog open={open} setOpen={setOpen} item={editedData} setItem={setEditedData} />
    </>
  )
}

export default Detail
