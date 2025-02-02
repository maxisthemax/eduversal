/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef } from 'react'
import { flatten } from 'flat'
import { FormikErrors, FormikTouched, FormikValues } from 'formik'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

//*material
import TextField, { TextFieldProps } from '@mui/material/TextField'

interface FormProps {
  errors: FormikErrors<any>
  touched: FormikTouched<any>
  values: FormikValues
  handleChange: (e: any) => void
  handleBlur: (e: any) => void
}

const generateTextFieldFormProps = (
  name: string,
  formProps: FormProps,
  onExternalChange?: (inputValue: number) => void
): {
  name: string
  value: string
  onChange?: (e: any) => void
  onBlur?: (e: any) => void
  error: boolean
  helperText: string | undefined
} => {
  const error = flatten(formProps.errors) as Record<string, any>
  const touched = flatten(formProps.touched) as Record<string, any>
  const values = flatten(formProps.values) as Record<string, any>

  return {
    name: name,
    value: values[name],
    onChange: (e) => {
      formProps.handleChange(e)
      if (onExternalChange) onExternalChange(parseFloat(e.target.value))
    },
    onBlur: formProps.handleBlur,
    error: Boolean(touched[name]) && Boolean(error[name]) ? true : false,
    helperText: touched[name] ? (error[name] as string) : '',
  }
}

function TextFieldPriceForm({
  formProps,
  label,
  name,
  props,
  children,
  onExternalChange,
}: {
  formProps: FormProps
  label: string
  name: string
  props?: TextFieldProps
  children?: React.ReactNode
  onExternalChange?: (inputValue: number) => void
}) {
  return (
    <TextField
      label={label}
      {...generateTextFieldFormProps(name, formProps, onExternalChange)}
      {...props}
      InputProps={{
        inputComponent: NumericFormatCustom as any,
      }}
    >
      {children}
    </TextField>
  )
}

export default TextFieldPriceForm

interface CustomProps {
  onChange: (event: { target: { name: string; value: number } }) => void
  name: string
}

const NumericFormatCustom = forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          if (parseFloat(values.value) >= 0)
            onChange({
              target: {
                name: props.name,
                value: parseFloat(values.value),
              },
            })
          else
            onChange({
              target: {
                name: props.name,
                value: 0,
              },
            })
        }}
        thousandSeparator
        valueIsNumericString
        decimalScale={2}
        fixedDecimalScale={true}
        allowNegative={false}
      />
    )
  }
)
