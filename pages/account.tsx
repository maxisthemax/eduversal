import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

//*mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

//*utils
import axios from "@/utils/axios";

function Account() {
  //*define
  const { push } = useRouter();
  const queryClient = useQueryClient();

  return (
    <Box>
      <Button
        variant="contained"
        onClick={async () => {
          await axios.post("auth/signOut");
          queryClient.clear();
          push("/signin");
        }}
      >
        SIGN OUT
      </Button>
    </Box>
  );
}

export default Account;
