import axios from "axios";
import { useRouter } from "next/navigation";

//*mui
import Button from "@mui/material/Button";

export default function Home() {
  const { push } = useRouter();

  return (
    <>
      Photos
      <Button
        onClick={async () => {
          await axios.post("/api/auth/signOut");
          push("/signin");
        }}
      >
        Sign Out
      </Button>
    </>
  );
}
