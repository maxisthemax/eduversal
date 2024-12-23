import { useRouter } from "next/navigation";

//*mui
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export default function VerifyEmail({ message, isVerified }) {
  const { push } = useRouter();
  return (
    <Container
      maxWidth="sm"
      sx={{ alignContent: "center", textAlign: "center" }}
    >
      <Stack spacing={2}>
        <Typography typography={"h6"}>{message}</Typography>
        {isVerified && (
          <Box>
            <Button onClick={() => push("/signin")} variant="contained">
              Sign In
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
