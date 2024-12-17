//*mui
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

//*helpers
import { getFullHeightSize } from 'helpers/stringHelpers'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <AppBar color="inherit" elevation={0} position="static">
        <Toolbar>
          <Typography variant="h4" color="primary">
            <b>Photoversal Studio</b>
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack
        direction="row"
        sx={{
          height: getFullHeightSize(10),
          width: '100%',
        }}
      >
        {children}
      </Stack>
    </Box>
  )
}
