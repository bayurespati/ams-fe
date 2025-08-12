import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchData as fetchPlans } from 'src/store/apps/plan'
import { fetchData as fetchPO } from 'src/store/apps/purchase-order'
import { fetchData as fetchAsetMasuk } from 'src/store/apps/aset-masuk'
import { fetchData as fetchAllItem } from 'src/store/apps/item-doin'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'

const PlanDetail = () => {
  const router = useRouter()
  const { id } = router.query

  const dispatch = useDispatch()
  const plans = useSelector(state => state.plan.data || [])
  const pos = useSelector(state => state.purchaseOrder.data || [])
  const asetMasuk = useSelector(state => state.asetMasuk?.data || [])
  const itemDoIn = useSelector(state => state.itemDoin?.allData || [])

  console.log('Data plan: ', plans)

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState('in')
  const [selectedPO, setSelectedPO] = useState(null)
  const [openItemDialog, setOpenItemDialog] = useState(false)
  const [selectedDoInId, setSelectedDoInId] = useState(null)

  const handleOpenDialog = (type, po) => {
    setDialogType(type)
    setSelectedPO(po)
    setOpenDialog(true)
  }

  const handleClose = () => {
    setOpenDialog(false)
    setSelectedPO(null)
  }

  const handleOpenItemDialog = doInId => {
    setSelectedDoInId(doInId)
    setOpenItemDialog(true)
  }

  const handleCloseItemDialog = () => {
    setOpenItemDialog(false)
    setSelectedDoInId(null)
  }

  useEffect(() => {
    dispatch(fetchPlans())
    dispatch(fetchPO())
    dispatch(fetchAsetMasuk())
    dispatch(fetchAllItem())
  }, [dispatch])

  const plan = plans.find(p => p.id === id)
  if (!plan) return <Typography>Loading...</Typography>

  const relatedPO = pos.filter(po => po.plan_id?.toString() === id?.toString())
  const relatedPOIds = relatedPO.map(po => po.id?.toString())
  const totalAsetMasuk = asetMasuk.filter(item => relatedPOIds.includes(item.po_id?.toString())).length
  const totalAsetKeluar = relatedPO.reduce((acc, po) => acc + (Number(po.asset_keluar) || 0), 0)

  const filteredItems = itemDoIn.filter(item => item.do_in_id?.toString() === selectedDoInId?.toString())

  const currentItems = filteredItems

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Button variant='text' size='small' onClick={() => router.back()} startIcon={<Icon icon='tabler:arrow-back' />}>
          Back
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h5' sx={{ fontWeight: 600 }}>
              Detail {plan.judul} - {plan.project_id}
            </Typography>
            <Grid container spacing={2} mt={2}>
              <Grid item xs={6}>
                <Typography>
                  <strong>Nama Plan:</strong> {plan.judul}
                </Typography>
                <Typography>
                  <strong>Nama Project:</strong> {plan.project_id}
                </Typography>
                <Typography>
                  <strong>IO: </strong> {plan.io}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>
                  <strong>Jumlah Aset:</strong> {plan.jumlah_barang}
                </Typography>
                <Typography>
                  <strong>Total Aset Masuk:</strong> {totalAsetMasuk}
                </Typography>
                <Typography>
                  <strong>Total Aset Keluar:</strong> {totalAsetKeluar}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h5' sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
              List PO
            </Typography>

            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 150 }}>
                      Nama Pekerjaan
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                      No_PO_SPK_PKS
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>Create Date</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                      Delivery Date
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                      Nilai Pengadaan
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>Aset Masuk</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>Aset Keluar</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 100 }}>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {relatedPO.map(po => (
                    <TableRow key={po.id}>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 150 }}>
                        {po.nama_pekerjaan}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                        {po.no_po_spk_pks}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>
                        {po.tanggal_po_spk_pks}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                        {po.tanggal_delivery}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 130 }}>
                        {po.nilai_pengadaan}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>
                        {asetMasuk.filter(item => item.po_id?.toString() === po.id?.toString()).length}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 120 }}>
                        {/* Belum ada data asset keluar, set 0 dulu */}0
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', minWidth: 100 }}>
                        <Box display='flex' flexDirection='column' gap={1} sx={{ py: 1 }}>
                          <Button
                            size='small'
                            variant='contained'
                            color='success'
                            sx={{ minWidth: 100, whiteSpace: 'nowrap', px: 2, py: 1 }}
                            onClick={() => handleOpenDialog('in', po)}
                          >
                            Asset In
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {dialogType === 'in' ? 'Asset Masuk' : 'Asset Keluar'}
          <IconButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPO ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nama Pekerjaan</TableCell>
                  <TableCell>NO DO</TableCell>
                  <TableCell>Lokasi Gudang</TableCell>
                  <TableCell>Tanggal Masuk</TableCell>
                  <TableCell>No GR</TableCell>
                  <TableCell>Keterangan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asetMasuk
                  .filter(item => item.po_id?.toString() === selectedPO.id?.toString())
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{selectedPO.nama_pekerjaan}</TableCell>
                      <TableCell>{item.no_do}</TableCell>
                      <TableCell>{item.lokasi_gudang}</TableCell>
                      <TableCell>{item.tanggal_masuk}</TableCell>
                      <TableCell>{item.no_gr}</TableCell>
                      <TableCell>{item.keterangan}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>Data PO belum dipilih.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* List Aset Masuk (Plan) */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              List Aset Masuk
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Nama Pekerjaan</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>NO DO</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Lokasi Gudang</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Tanggal Masuk</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>No GR</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Keterangan</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asetMasuk
                  .filter(item => relatedPOIds.includes(item.po_id?.toString()))
                  .map((item, index) => {
                    const po = pos.find(p => p.id?.toString() === item.po_id?.toString())
                    return (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{po?.nama_pekerjaan || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.no_do}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.lokasi_gudang}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.tanggal_masuk}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.no_gr}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{item.keterangan}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          <Button size='small' variant='outlined' onClick={() => handleOpenItemDialog(item.id)}>
                            List Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={openItemDialog} onClose={handleCloseItemDialog} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Daftar Item Aset Masuk
          <IconButton onClick={handleCloseItemDialog}>
            <Icon icon='tabler:x' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant='h6'>Jumlah Items: {filteredItems.length}</Typography>

          {filteredItems.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item, idx) => (
                    <TableRow key={item.id || idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.sn || '-'}</TableCell>
                      <TableCell>{item.jumlah || '-'}</TableCell>
                      <TableCell>{item.status || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 3 }}>
              Belum ada item untuk aset masuk ini.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* List Aset Keluar (Plan) - Struktur Sama dengan Aset Masuk */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              List Aset Keluar
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Nama Pekerjaan</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>NO DO</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Lokasi Gudang</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Tanggal Masuk</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>No GR</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Keterangan</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Placeholder data kosong, nanti bisa isi data asli */}
                <TableRow>
                  <TableCell colSpan={7} sx={{ fontSize: '0.75rem' }}>
                    Belum ada data aset keluar.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PlanDetail
