import { useRouter } from "next/navigation";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

//*utils
import axios from "@/utils/axios";

function Account() {
  //*define
  const { push } = useRouter();

  return (
    <Box>
      <Button
        variant="contained"
        onClick={async () => {
          await axios.post("auth/signOut");
          push("/signin");
        }}
      >
        SIGN OUT
      </Button>
    </Box>
  );
}

export default Account;
