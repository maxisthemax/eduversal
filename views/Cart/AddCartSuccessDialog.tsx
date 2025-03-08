import { useRouter } from "next/navigation";

//*components
import { CustomIcon } from "@/components/Icons";

//*mui
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

function AddCartSuccessDialog({ open }) {
  const { push } = useRouter();
  return (
    <Dialog open={open}>
      <DialogContent>
        <Stack spacing={2} sx={{ alignItems: "center", p: 2 }}>
          <CustomIcon
            icon="check_circle"
            iconColor="#5DAD48"
            type="outlined"
            fill={true}
            fontSizeSx="42px"
          />
          <Typography variant="h6" align="center">
            Added to cart successfully
          </Typography>
          <Stack spacing={2} direction="row">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                push("/photos");
              }}
            >
              Back to Photos
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                push("/cart");
              }}
            >
              View cart
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default AddCartSuccessDialog;
