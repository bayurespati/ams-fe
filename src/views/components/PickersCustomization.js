// ** MUI Imports
import Box from '@mui/material/Box'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import format from 'date-fns/format'

// ** Custom Component Imports
import CustomInput from './PickersCustomInput'

const PickersCustomization = ({ value, onChange, label, popperPlacement }) => {
  const formattedValue = value ? format(value, 'yyyy-MM-dd') : ''

  return (
    <Box>
      <div>
        <DatePicker
          fullwidth
          selected={value}
          dateFormat='yyyy-MM-dd'
          popperPlacement={popperPlacement}
          onChange={onChange}
          customInput={<CustomInput label={label} value={formattedValue} fullwidth />}
        />
      </div>
    </Box>
  )
}

export default PickersCustomization
