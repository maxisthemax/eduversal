import * as yup from 'yup'
import { Form, Formik } from 'formik'
import axios from 'axios'

//*components
import Layout from 'components/Layout'
import { TextFieldForm } from 'components/Form'

//*mui
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Link from 'next/link'

//*validation
const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password is less than 6').required('Password is required'),
  name: yup.string().required('Name is required'),
})

export default function SignIn() {
  return (
    <Layout>
      <Container maxWidth="sm" sx={{ alignContent: 'center' }}>
        <Paper elevation={0}>
          <Formik
            initialValues={{ email: '', password: '', name: '' }}
            validationSchema={validationSchema}
            onSubmit={async ({ email, password, name }) => {
              const res = await axios.post('/api/auth/signUp', {
                email,
                password,
                name,
              })

              console.log(res)
            }}
          >
            {({ values, errors, handleChange, touched, handleBlur, handleSubmit }) => {
              const formProps = {
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
              }
              return (
                <Form onSubmit={handleSubmit}>
                  <Stack spacing={2} sx={{ p: 2 }}>
                    <Typography variant="h3">
                      <b>Sign Up</b>
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button fullWidth variant="contained" color="primary">
                        User
                      </Button>
                      <Button fullWidth variant="contained">
                        Marchants
                      </Button>
                    </Stack>
                    <TextFieldForm
                      name="name"
                      label="Name"
                      formProps={formProps}
                      props={{ required: true }}
                    />
                    <TextFieldForm
                      name="email"
                      label="Email"
                      formProps={formProps}
                      props={{ required: true, placeholder: 'Your Email' }}
                    />
                    <TextFieldForm
                      name="password"
                      label="Password"
                      formProps={formProps}
                      props={{ required: true, type: 'password' }}
                    />
                    <Button fullWidth type="submit" variant="contained" color="primary">
                      Register
                    </Button>
                    <Typography>
                      If you already have an account. <Link href={'/signin'}>Sign In Here</Link>
                    </Typography>
                  </Stack>
                </Form>
              )
            }}
          </Formik>
        </Paper>
      </Container>
    </Layout>
  )
}
