//*mui
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

function Unauthorized() {
  return (
    <Container
      maxWidth="sm"
      sx={{ alignContent: "center", textAlign: "center" }}
    >
      <Typography typography={"h6"}>Unauthorized User</Typography>
    </Container>
  );
}

export default Unauthorized;
