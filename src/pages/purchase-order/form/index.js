// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import { useDispatch } from 'react-redux'
import FormValidationAsync from 'src/views/apps/purchase-order/FormValidationAsync'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'

//  ** Action Imports
import { addData } from 'src/store/apps/plan/index.js'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { textAlign, width } from '@mui/system'

const Po = () => {
  return (
    <>
      <div role='presentation'>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Purchase Order
          </Link>
          {/* <Link underline='hover' color='inherit' href='/material-ui/getting-started/installation/'>
           Core
         </Link> */}
          <Typography color='inherit'>Create New Po</Typography>
        </Breadcrumbs>
      </div>
      <FormValidationAsync />
    </>
  )
}

export default Po
