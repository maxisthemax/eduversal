//*mui
import { SxProps } from "@mui/material";
import Box from "@mui/material/Box";

function FlexBox({
  minHeight = 0,
  sx = {},
}: {
  minHeight?: number;
  sx?: SxProps;
}) {
  return <Box sx={{ flexGrow: 1, minHeight: minHeight, ...sx }} />;
}

export default FlexBox;
