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
import { fetchData as fetchAllItem, addData as addItemData, verifyData, deleteData } from 'src/store/apps/item-doin'
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
import { addData } from 'src/store/apps/item-doin'

//**Table
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import Autocomplete from '@mui/material/Autocomplete'
import { fetchCompany } from 'src/store/apps/company'

const Detail = ({ id, setView }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [fileSerialNumber, setFileSerialNumber] = useState([])
  const [value, setValue] = useState('')
  const [tabValue, setTabValue] = useState('1')
  const [nextId, setNextId] = useState(1)
  const companies = useSelector(state => state.company.data)

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
    dispatch(fetchCompany({ q: '' }))
  }, [dispatch, id])

  useEffect(() => {
    if (data?.po?.plan_id !== undefined) {
      fetchSinglePlan(data?.po?.plan_id)
    }
  }, [filteredItems, data.po])

  // Ganti handleItemChange
  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map(item => (item.index === index ? { ...item, [field]: value } : item)))
  }

  const [showPreview, setShowPreview] = useState(false)

  const handleDialogToggle = item => {
    setEditedData(item)
    setOpen(!open)
  }

  const handleSubmitItems = async () => {
    try {
      setLoading(true)

      const validItems = items?.filter(item => item && item.sn && item.sn.trim() !== '' && item.terisi === false) || []

      const payload = {
        do_in_id: id,
        items: validItems.map(item => ({
          nama_barang: item.nama_barang,
          sn: item.sn,
          jumlah: Number(item.jumlah_barang || 1),
          owner_id: item.owner?.id || null
          // pastikan item.owner adalah object {name, uuid}
        }))
      }

      if (!payload.items || payload.items.length === 0) {
        toast.error('Tidak ada item yang valid untuk disubmit')
        return
      }

      const result = await dispatch(addData(payload))

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Items berhasil disubmit!')
        dispatch(fetchAllItem({ q: id }))
        if (data?.po?.plan_id) fetchSinglePlan(data?.po?.plan_id)
      } else {
        if (result.payload?.message && result.payload.message.toLowerCase().includes('berhasil')) {
          toast.success(result.payload.message)
          dispatch(fetchAllItem({ q: id }))
          if (data?.po?.plan_id) fetchSinglePlan(data?.po?.plan_id)
        } else {
          await dispatch(fetchAllItem({ q: id }))
          setTimeout(() => {
            toast.success('Items berhasil disubmit!')
          }, 500)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      dispatch(fetchAllItem({ q: id }))
      setTimeout(() => {
        toast.success('Items berhasil disubmit!')
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async indexToDelete => {
    try {
      setLoading(true)

      // Ambil item yang akan dihapus dari filteredItems
      const itemToDelete = filteredItems[indexToDelete]

      if (!itemToDelete) {
        toast.error('Item tidak ditemukan')

        return
      }

      // Konfirmasi sebelum hapus
      if (!window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
        return
      }

      // Cek ID dengan berbagai kemungkinan
      const itemId = itemToDelete.uuid

      // Pastikan ID ada dan valid (bisa berupa string atau number)
      if (!itemId || itemId === '' || itemId === 0 || itemId === '0' || itemId === null || itemId === undefined) {
        toast.error('ID item tidak valid: ' + itemId)

        return
      }

      // Dispatch Redux action untuk delete dari database
      const result = await dispatch(deleteData(itemId))

      if (result.type.endsWith('/fulfilled')) {
        toast.success('Item berhasil dihapus dari database')

        // Refresh data untuk memastikan sinkronisasi
        await dispatch(fetchAllItem({ q: id }))

        // Refresh plan data jika ada
        if (data?.po?.plan_id) {
          await fetchSinglePlan(data?.po?.plan_id)
        }
      } else {
        toast.error('Gagal menghapus item dari database')
        console.error('Delete failed:', result.payload)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Terjadi kesalahan saat menghapus item: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const [fileInputKey, setFileInputKey] = useState(0) // untuk remount input

  const handleSubmitFile = async () => {
    try {
      if (!fileSerialNumber || fileSerialNumber.length === 0 || !fileSerialNumber[0]) {
        toast.error('File belum dipilih.')

        return
      }

      const file = fileSerialNumber[0]

      const formData = new FormData()
      formData.append('do_in_id', id)
      formData.append('file', file)

      const response = await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('File Uploaded')

      await dispatch(fetchAllItem({ q: id }))

      // ✅ Reset file & force remount input
      setFileSerialNumber([])
      setFileInputKey(prev => prev + 1)
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
      if (!plan_id) return

      const response = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}plans`, {
        params: { id: plan_id }
      })

      const barang = response.data.data
      const itemsFromBackend = validFilteredItems || []

      const items = []

      for (let i = 0; i < barang.jumlah_barang; i++) {
        const existingItem = itemsFromBackend[i]

        items.push({
          id: existingItem?.id || '',
          do_in_id: existingItem?.do_in_id || id,
          nama_barang: barang.nama_barang,
          index: i,
          sn: existingItem?.sn || '',
          is_verified: existingItem?.is_verified || false,
          terisi: !!existingItem,
          jumlah: existingItem?.jumlah || barang.jumlah_barang, // fallback
          jumlah_barang: existingItem?.jumlah || ''
        })
      }

      setItems(items)
    } catch (error) {
      console.error(error)
    }
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const handleAddItem = () => {
    const newItem = {
      index: nextId, // gunakan counter
      do_in_id: id,
      nama_barang: '',
      sn: '',
      is_verified: false,
      terisi: false,
      jumlah_barang: '',
      owner: ''
    }
    setItems(prev => [...prev, newItem])
    setNextId(prev => prev + 1) // increment counter
  }

  const [selectedPO, setSelectedPO] = useState(null)
  useEffect(() => {
    if (data?.po) {
      setSelectedPO(data)
    }
  }, [data])

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

            {filteredItems.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Nama Barang</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell>Pemilik</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.nama_barang || '-'}</TableCell>
                        <TableCell>{item.sn || '-'}</TableCell>
                        <TableCell>{item.jumlah || item.jumlah_barang || '-'}</TableCell>
                        <TableCell>{item.owner?.name || item.nama_pemilik || '-'}</TableCell>

                        <TableCell>
                          <IconButton color='secondary' onClick={() => handleDialogToggle(item)}>
                            <Icon icon='tabler:edit' />
                          </IconButton>
                          <IconButton
                            color='error'
                            onClick={() => handleDeleteItem(idx)}
                            disabled={item.is_verified || loading}
                          >
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 3 }}>
                Belum ada item yang dimasukkan.
              </Typography>
            )}

            <TabContext value={tabValue}>
              <TabList onChange={handleChangeTab} aria-label='simple tabs example'>
                <Tab value='1' label='Manual' />
                <Tab value='2' label='Excel' />
              </TabList>

              <TabPanel value='1'>
                <form>
                  {items
                    .filter(item => !item.terisi)
                    .map((item, index) => (
                      <Grid
                        container
                        spacing={2}
                        key={index}
                        alignItems='center'
                        sx={{
                          mt: 3,
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          position: 'relative',
                          '&:hover': { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' }
                        }}
                      >
                        {/* Tombol Hapus Item Baru */}
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(255,0,0,0.05)',
                            '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                          }}
                        >
                          <Icon icon='tabler:x' />
                        </IconButton>

                        {/* Nama Barang */}
                        <Grid item xs={12} md={3}>
                          <CustomTextField
                            label='Nama Barang'
                            value={item.nama_barang}
                            onChange={e => handleItemChange(item.index, 'nama_barang', e.target.value)}
                            placeholder='Masukkan Nama Barang'
                            fullWidth
                          />
                        </Grid>

                        {/* Serial Number */}
                        <Grid item xs={12} md={3}>
                          <CustomTextField
                            label={`Serial Number ${index + 1}`}
                            value={item.sn}
                            placeholder='SNxxxx'
                            onChange={e => handleItemChange(item.index, 'sn', e.target.value)}
                            inputProps={{ readOnly: item.terisi }}
                            fullWidth
                          />
                        </Grid>

                        {/* Jumlah Barang */}
                        <Grid item xs={12} md={2}>
                          <CustomTextField
                            type='number'
                            label='Jumlah'
                            value={item.jumlah_barang}
                            placeholder={`Maks ${data.po?.akun || 0}`}
                            onChange={e => {
                              const val = parseInt(e.target.value || 0)
                              handleItemChange(item.index, 'jumlah_barang', val)
                            }}
                            inputProps={{
                              min: 1,
                              max: data.po?.akun
                            }}
                            fullWidth
                          />
                        </Grid>

                        {/* Owner */}
                        <Grid item xs={12} md={2}>
                          <Autocomplete
                            options={companies || []}
                            getOptionLabel={option => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value?.id} // penting!
                            value={item.owner || null} // langsung pakai object
                            onChange={(e, newValue) => {
                              console.log('new owner:', newValue)
                              handleItemChange(item.index, 'owner', newValue || null)
                            }}
                            renderInput={params => (
                              <CustomTextField {...params} label='Owner' placeholder='Pilih Owner' fullWidth />
                            )}
                          />
                        </Grid>
                      </Grid>
                    ))}

                  {/* Tombol Tambah dan Submit */}
                  <Box mt={4} display='flex' gap={2}>
                    <Button variant='outlined' onClick={handleAddItem}>
                      Tambah Item
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleSubmitItems}
                      disabled={loading || items.filter(i => !i.terisi).length === 0}
                    >
                      {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Submit Items'}
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
                      key={fileInputKey} // ini yang bikin dia re-mount setelah upload
                      files={fileSerialNumber}
                      setFiles={setFileSerialNumber}
                      accept='.csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv'
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
