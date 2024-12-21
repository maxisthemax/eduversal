//*mui
import Box from "@mui/material/Box";

function FlexBox({ minHeight = 0 }) {
  return <Box sx={{ flexGrow: 1, minHeight: minHeight }} />;
}

export default FlexBox;
