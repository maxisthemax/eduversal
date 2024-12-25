import { useRouter, useSearchParams } from "next/navigation";

//*mui
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

//*utils
import axios from "@/utils/axios";

function VerifyEmail({ message, isVerified, type }) {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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
        {type === "VERIFICATION_TOKEN_EXPIRED" && (
          <Box>
            <Button
              onClick={async () => {
                axios.post("auth/resendVerification", { email });
                push("/signin");
              }}
            >
              Resend Email Verification
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
}

export default VerifyEmail;
