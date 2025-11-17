// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { CardContent, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData } from 'src/store/apps/aset-masuk'

// ** Custom Components
import TableHeader from 'src/views/apps/approval/TableHeader'
import Detail from 'src/pages/aset/approval/detail.js'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const defaultColumns = [
  {
    flex: 0.15,
    field: 'po_id',
    headerName: 'PO ID',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.po_id}</Typography>
  },
  {
    flex: 0.15,
    field: 'nama_pekerjaan',
    headerName: 'Nama Pekerjaan',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.po?.nama_pekerjaan || '-'}</Typography>
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
    headerName: 'NO. DO',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_do}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'tanggal_masuk',
    headerClassName: 'super-app-theme--header',
    headerName: 'Tgl Masuk',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.tanggal_masuk}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 150,
    field: 'no_gr',
    headerClassName: 'super-app-theme--header',
    headerName: 'No. GR',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.no_gr}</Typography>
  }
]

const ApprovalTable = () => {
  const [value, setValue] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [view, setView] = useState('1')
  const [detail, setDetail] = useState({})

  const dispatch = useDispatch()
  const store = useSelector(state => state.asetMasuk)

  useEffect(() => {
    dispatch(fetchData({ q: value }))
  }, [dispatch, value])

  const handleFilter = val => setValue(val)

  const columns = [
    ...defaultColumns,
    {
      flex: 0.15,
      minWidth: 100,
      sortable: false,
      field: 'actions',
      headerClassName: 'super-app-theme--header',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Tooltip arrow title='Detail'>
          <IconButton onClick={() => handleDetail(row)}>
            <Icon icon='tabler:info-circle' />
          </IconButton>
        </Tooltip>
      )
    }
  ]

  const handleDetail = row => {
    setDetail(row)
    setView('2')
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          {view === '1' ? (
            <Card>
              <CardHeader title='Approval Aset' />
              <CardContent>
                <TableHeader value={value} handleFilter={handleFilter} hideAddButton />
                <Box
                  sx={{
                    '& .super-app-theme--header': {
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <DataGrid
                    autoHeight
                    rows={store?.data || []}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                  />
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Detail setView={setView} id={detail.id} />
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default ApprovalTable
