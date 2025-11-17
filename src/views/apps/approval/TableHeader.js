// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

const TableHeaderApproval = props => {
  const { value, handleFilter } = props

  return (
    <Box
      sx={{
        p: 2,
        pb: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <TextField size='small' value={value} placeholder='Search…' onChange={e => handleFilter(e.target.value)} />
    </Box>
  )
}

export default TableHeaderApproval
