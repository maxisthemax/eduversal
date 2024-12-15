//*components
import Layout from "@/components/layout";

//*material
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

export default function SignIn() {
  return (
    <Layout>
      <Container maxWidth="sm" sx={{ alignContent: "center" }}>
        <Paper elevation={0}>
          <Stack spacing={2} sx={{ p: 2 }}>
            <Typography variant="h3">
              <b>Sign In</b>
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="contained" color="primary">
                User
              </Button>
              <Button fullWidth variant="contained">
                Marchants
              </Button>
            </Stack>
            <TextField label="Email" placeholder="Your Email" />
            <TextField label="Password" />
            <FormControlLabel
              control={<Checkbox />}
              label="Remember Me"
              labelPlacement="end"
            />
            <Button fullWidth variant="contained" color="primary">
              Sign In
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}
