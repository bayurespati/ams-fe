// ===============================
// React & MUI Imports
// ===============================
import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Dialog from '@mui/material/Dialog'
import { DataGrid } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import axios from 'axios'

// ===============================
// Helper: Vertical Row Component
// ===============================
const VerticalRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', py: 1 }}>
    <Box sx={{ width: '35%', fontWeight: 600 }}>{label}</Box>
    <Box sx={{ width: '65%' }}>{value || '-'}</Box>
  </Box>
)

const Detail = ({ id, setView }) => {
  const [header, setHeader] = useState(null)
  const [items, setItems] = useState([])
  const [openImage, setOpenImage] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [openReject, setOpenReject] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  // ===============================
  // Fetch Data
  // ===============================
  const fetchDetail = async () => {
    try {
      const resHeader = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}do-in`, { params: { id } })
      const doInData = resHeader.data.data.find(item => item.uuid === id)

      setHeader(doInData)

      const resItems = await axios.get(`${process.env.NEXT_PUBLIC_AMS_URL}item-do-in`, {
        params: { do_in_id: id }
      })
      setItems(resItems.data.data)
    } catch (err) {
      console.error('Error fetch detail:', err)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  // ===============================
  // Table columns
  // ===============================
  const itemColumns = [
    { field: 'nama_barang', headerName: 'Nama Barang', flex: 0.25 },
    { field: 'sn', headerName: 'Serial Number', flex: 0.15 },
    { field: 'jumlah', headerName: 'Jumlah', flex: 0.1 },
    {
      field: 'owner',
      headerName: 'Pemilik',
      flex: 0.25,
      renderCell: ({ row }) => `${row.owner.name} (${row.owner.phone})`
    }
  ]

  // ===============================
  // HANDLER: APPROVE DO-IN
  // ===============================
  const handleApprove = async () => {
    try {
      const payload = {
        id: id,
        status: 'approve',
        keterangan_status: null
      }

      await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in/process`, payload)

      alert('Berhasil approve DO-IN')
      setView('1')
    } catch (err) {
      console.error(err)
      alert('Gagal melakukan approve')
    }
  }
  const handleReject = () => {
    setOpenReject(true) // ERROR
  }

  const submitReject = async () => {
    if (!rejectNote.trim()) {
      alert('Keterangan wajib diisi!')
      return
    }

    try {
      const payload = {
        id: id,
        status: 'rejected',
        keterangan_status: rejectNote
      }

      await axios.post(`${process.env.NEXT_PUBLIC_AMS_URL}do-in/process`, payload)

      alert('Berhasil reject DO-IN')
      setOpenReject(false)
      setView('1')
    } catch (err) {
      console.error(err)
      alert('Gagal melakukan reject')
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Detail Asset Masuk'
          action={
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => setView('1')}>
              Kembali
            </Button>
          }
        />

        <CardContent sx={{ pt: 0 }}>
          {/* ===============================
              SECTION: PURCHASE ORDER
          =============================== */}
          {header?.po && (
            <Paper elevation={0} sx={{ p: 3, mb: 5, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Informasi Purchase Order (PO)
              </Typography>

              <VerticalRow label='Nama Pekerjaan' value={header.po.nama_pekerjaan} />
              <VerticalRow label='No PO / SPK / PKS' value={header.po.no_po_spk_pks} />
              <VerticalRow label='Tanggal PO' value={header.po.tanggal_po_spk_pks} />
              <VerticalRow label='Nilai Pengadaan' value={`Rp ${header.po.nilai_pengadaan.toLocaleString()}`} />
              <VerticalRow label='Tanggal Delivery' value={header.po.tanggal_delivery} />
              <VerticalRow label='Akun' value={header.po.akun} />
              <VerticalRow label='Cost Center' value={header.po.cost_center} />

              {/* FILE PO */}
              <VerticalRow
                label='File PO / SPK / PKS'
                value={
                  header.po.file_po_spk_pks ? (
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<Icon icon='tabler:download' />}
                      href={`${process.env.NEXT_PUBLIC_AMS_URL}${header.po.file_po_spk_pks}`}
                      target='_blank'
                    >
                      Download PO
                    </Button>
                  ) : (
                    'Tidak ada file'
                  )
                }
              />

              {/* FILE BOQ */}
              <VerticalRow
                label='File BOQ'
                value={
                  header.po.file_boq ? (
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<Icon icon='tabler:download' />}
                      href={`${process.env.NEXT_PUBLIC_AMS_URL}${header.po.file_boq}`}
                      target='_blank'
                    >
                      Download BOQ
                    </Button>
                  ) : (
                    'Tidak ada file'
                  )
                }
              />
            </Paper>
          )}
          {/* ===============================
              SECTION: DO-IN INFO
          =============================== */}
          {header && (
            <Paper elevation={0} sx={{ p: 3, mb: 5, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Informasi Asset Masuk (DO-In)
              </Typography>

              <VerticalRow label='No DO' value={header.no_do} />
              <VerticalRow label='Tanggal Masuk' value={header.tanggal_masuk} />
              <VerticalRow label='No GR' value={header.no_gr} />
              <VerticalRow label='Penerima' value={header.penerima} />
              <VerticalRow label='Lokasi Gudang' value={header.lokasi_gudang} />
              <VerticalRow label='Keterangan' value={header.keterangan} />

              {/* FILE EVIDENCE */}
              <VerticalRow
                label='File Evidence'
                value={
                  header.file_evidence !== '0' ? (
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<Icon icon='tabler:download' />}
                      href={`${process.env.NEXT_PUBLIC_AMS_URL}${header.file_evidence}`}
                      target='_blank'
                    >
                      Download Evidence
                    </Button>
                  ) : (
                    'Tidak ada file'
                  )
                }
              />

              {/* FOTO */}
              <VerticalRow
                label='Foto Penerimaan'
                value={
                  header.file_foto_terima ? (
                    <img
                      src={`https://iams-api.pins.co.id/storage/${header.file_foto_terima}`}
                      width={160}
                      style={{
                        borderRadius: 10,
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                      alt='Foto penerimaan'
                      onClick={() => {
                        setPreviewImage(`https://iams-api.pins.co.id/storage/${header.file_foto_terima}`)
                        setOpenImage(true)
                      }}
                      onError={e => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    'Tidak ada foto'
                  )
                }
              />

              <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth='sm' fullWidth>
                <Box sx={{ p: 4 }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    Alasan Penolakan
                  </Typography>

                  <textarea
                    style={{
                      width: '100%',
                      minHeight: 120,
                      borderRadius: 8,
                      padding: 12,
                      border: '1px solid #ccc'
                    }}
                    placeholder='Masukkan keterangan penolakan...'
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button variant='outlined' onClick={() => setOpenReject(false)}>
                      Batal
                    </Button>
                    <Button variant='contained' color='error' onClick={submitReject}>
                      Submit
                    </Button>
                  </Box>
                </Box>
              </Dialog>
            </Paper>
          )}
          {/* ===============================
              SECTION: ITEM TABLE
          =============================== */}
          <Typography variant='h6' sx={{ mb: 2 }}>
            List Item DO-IN
          </Typography>
          <DataGrid
            autoHeight
            rows={items.map(item => ({ id: item.uuid, ...item }))}
            columns={itemColumns}
            pageSizeOptions={[10, 20]}
            sx={{ borderRadius: 2, mb: 5 }}
          />
          {/* ===============================
                 ACTION BUTTONS
            =============================== */}
          <Divider sx={{ mb: 3 }} />
          {header && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Teks peringatan muncul hanya jika status progress */}
              {header.status === 'progress' && (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Pastikan seluruh data sudah benar sebelum melakukan tindakan.
                </Typography>
              )}

              {/* Kondisi status */}
              {header.status === 'approve' && (
                <Box
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600
                  }}
                >
                  ✔ Aset telah di-approve
                </Box>
              )}

              {header.status === 'rejected' && (
                <Box
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: '#FFEBEE',
                    color: '#C62828',
                    fontWeight: 600
                  }}
                >
                  ✖ Aset telah ditolak
                </Box>
              )}

              {/* TOMBOL muncul hanya saat PROGRESS */}
              {header.status === 'progress' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant='contained'
                    color='success'
                    startIcon={<Icon icon='tabler:check' />}
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>

                  <Button variant='outlined' color='error' startIcon={<Icon icon='tabler:x' />} onClick={handleReject}>
                    Reject
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ===============================
          DIALOG POPUP FOTO
      =============================== */}
      <Dialog open={openImage} onClose={() => setOpenImage(false)} maxWidth='md'>
        <img src={previewImage} style={{ width: '100%', borderRadius: 10 }} />
      </Dialog>
    </>
  )
}

export default Detail
