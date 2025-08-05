// ** React Imports
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// ** Axios & Redux Thunks
import { fetchData as fetchPlans } from 'src/store/apps/plan'
import { fetchData as fetchPO } from 'src/store/apps/purchase-order'
import { fetchData as fetchAsetMasuk } from 'src/store/apps/aset-masuk'
import { fetchData as fetchItemDoIn } from 'src/store/apps/item-doin'

//import { fetchData as fetchAsetKeluar } from 'src/store/apps/aset-keluar'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'

// ** Chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
const Dashboard = () => {
  const dispatch = useDispatch()
  const plans = useSelector(state => state.plan.data || [])
  const purchaseOrders = useSelector(state => state.purchaseOrder.data || [])
  const asetMasuk = useSelector(state => state.asetMasuk.allData || [])
  const itemDoIn = useSelector(state => state.itemDoIn?.allData || [])

  const asetKeluar = [
    { id: 1, jumlah_barang: 12, created_at: '2025-01-10T10:00:00Z' },
    { id: 2, jumlah_barang: 20, created_at: '2025-02-14T15:30:00Z' },
    { id: 3, jumlah_barang: 7, created_at: '2025-03-20T09:10:00Z' },
    { id: 4, jumlah_barang: 10, created_at: '2025-03-22T08:30:00Z' },
    { id: 5, jumlah_barang: 15, created_at: '2025-06-01T12:45:00Z' }
  ]

  useEffect(() => {
    dispatch(fetchPlans())
    dispatch(fetchPO())
    dispatch(fetchAsetMasuk())
    dispatch(fetchItemDoIn()) // ✅ Ambil item DO-IN
  }, [dispatch])

  const totalPlans = plans.length
  const totalPO = purchaseOrders.length
  const totalIn = asetMasuk.length

  const totalOut = asetKeluar.reduce((sum, item) => sum + (item.jumlah_barang || 0), 0)

  // Buat data untuk chart bulanan
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    in: 0,
    out: 0
  }))

  console.log('Aset Masuk:', asetMasuk)
  // Buat peta id DO-IN → tanggal_masuk
  const doInDateMap = asetMasuk.reduce((map, doIn) => {
    if (doIn.id && doIn.tanggal_masuk) {
      map[doIn.id] = new Date(doIn.tanggal_masuk)
    }
    return map
  }, {})

  // Hitung totalIn dan masukkan ke monthlyData

  asetMasuk.forEach(doIn => {
    const date = new Date(doIn.tanggal_masuk)
    const monthIndex = date.getMonth()

    if (!isNaN(monthIndex)) {
      monthlyData[monthIndex].in += 1 // Satu entri = satu aset masuk
    }
  })

  asetKeluar.forEach(item => {
    const date = new Date(item.created_at)
    const monthIndex = date.getMonth()

    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      monthlyData[monthIndex].out += item.jumlah_barang || 0
    } else {
      console.warn('Invalid created_at in asetKeluar:', item.created_at)
    }
  })

  plans.forEach(plan => {
    const date = new Date(plan.created_at)
    const monthIndex = date.getMonth()

    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      if (plan.tipe_transaksi === 'masuk') monthlyData[monthIndex].in += plan.jumlah_barang || 0
      if (plan.tipe_transaksi === 'keluar') monthlyData[monthIndex].out += plan.jumlah_barang || 0
    } else {
      console.warn('Tanggal tidak valid pada plan:', plan)
    }
  })

  return (
    <Grid container spacing={6}>
      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6'>Total Plans</Typography>
            <Typography variant='h4'>{totalPlans}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6'>Total PO</Typography>
            <Typography variant='h4'>{totalPO}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6'>Aset Masuk</Typography>
            <Typography variant='h4'>{totalIn}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h6'>Aset Keluar</Typography>
            <Typography variant='h4'>{totalOut}</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Line Chart */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Grafik Aset Masuk & Keluar per Bulan' />
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='in' fill='#82ca9d' name='Aset Masuk' />
                <Bar dataKey='out' fill='#8884d8' name='Aset Keluar' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Plan Table */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Daftar Plan' />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Judul</TableCell>
                    <TableCell>Nama Barang</TableCell>
                    <TableCell>Jumlah Aset</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((plan, index) => (
                    <TableRow key={plan.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{plan.judul}</TableCell>
                      <TableCell>{plan.nama_barang}</TableCell>
                      <TableCell>{plan.jumlah_barang}</TableCell>
                      <TableCell>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => (window.location.href = `/home/detail/${plan.id}`)}
                        >
                          Lihat Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
