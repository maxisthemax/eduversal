import { createTheme, ThemeOptions } from '@mui/material/styles'

// Create a theme instance.

const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#006DEE',
      contrastText: '#ffffff',
    },
  },
}

const theme = createTheme(baseTheme)

export default theme
