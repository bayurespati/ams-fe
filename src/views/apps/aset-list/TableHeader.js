// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddIcon from '@mui/icons-material/Add'

const TableHeaderAset = ({ value, handleFilter, onAdd, onUpload }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2
      }}
    >
      {/* Search Box */}
      <TextField
        value={value}
        sx={{ width: { xs: '100%', sm: '250px' } }}
        placeholder='Search...'
        size='small'
        onChange={e => handleFilter(e.target.value)}
      />

      {/* Tombol Upload */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => onAdd && onAdd()}>
          Tambah Aset
        </Button>
        <Button variant='outlined' component='label' startIcon={<UploadFileIcon />}>
          Upload Excel
          <input hidden type='file' onChange={onUpload} />
        </Button>
      </Box>
    </Box>
  )
}

export default TableHeaderAset
