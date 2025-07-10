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

const InputFileUploadBtn = ({ files, setFiles, accept = '.pdf,.jpg,.png,.jpeg,.gif' }) => {
  const [fileName, setFileName] = useState('')
  const [filePreview, setFilePreview] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = event => {
    const file = event.target.files[0]
    console.log(file)
    if (file) {
      // const isValidType = accept.split(',').includes(file.type)
      const isValidType = accept.split(',').some(ext => file.name.toLowerCase().endsWith(ext.trim()))


      // const isValidType = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif'].includes(file.type)
      const isValidSize = file.size <= 2 * 1024 * 1024 // 2 MB

      if (!isValidType) {
        setError(`Only files of type ${accept} are allowed.`)

        return
      }

      if (!isValidSize) {
        setError('File size must be less than 2 MB.')

        return
      }

      setError('')
      setFiles([file])
      setFileName(file.name)
      setFilePreview(URL.createObjectURL(file))
    }
  }

  return (
    <Box>
      <Button component='label' role={undefined} variant='outlined' color='success' tabIndex={-1} size='medium'>
        upload file
        {/* <Typography variant='body2'>Upload File</Typography> */}
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
