// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

// ** Utility Component for Visually Hidden Input
const VisuallyHiddenInput = props => (
  <input
    {...props}
    style={{
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      width: '1px'
    }}
  />
)

const InputFileUploadBtn = ({ files, setFiles, accept = '.pdf,.jpg,.png,.jpeg,.gif,.csv,.xlsx', maxSizeMB = 2 }) => {
  const [fileName, setFileName] = useState('')
  const [filePreview, setFilePreview] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = event => {
    const file = event.target.files[0]

    if (!file) return

    const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase())

    const fileNameLower = file.name.toLowerCase()
    const fileExt = fileNameLower.substring(fileNameLower.lastIndexOf('.'))

    const isValidExt = acceptedTypes.includes(fileExt) || acceptedTypes.includes(file.type)

    const isValidSize = file.size <= maxSizeMB * 1024 * 1024

    if (!isValidExt) {
      setError(`Only files with type/extension: ${accept} are allowed.`)
      return
    }

    if (!isValidSize) {
      setError(`File size must be less than ${maxSizeMB} MB.`)
      return
    }

    setError('')
    setFiles([file])
    setFileName(file.name)
    setFilePreview(URL.createObjectURL(file))
  }

  return (
    <Box>
      <Button component='label' variant='outlined' color='success' size='medium'>
        upload file
        <VisuallyHiddenInput type='file' onChange={handleFileChange} accept={accept} />
      </Button>

      {fileName && (
        <Typography
          variant='body1'
          sx={{ marginLeft: 2, cursor: 'pointer' }}
          onClick={() => window.open(filePreview, '_blank')}
        >
          {fileName}
        </Typography>
      )}

      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default InputFileUploadBtn
