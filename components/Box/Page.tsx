//*mui
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

//*components
import FlexBox from "./FlexBox";

function Page({
  children,
  leftButton,
  rightButton,
}: {
  children: React.ReactNode;
  leftButton?: React.ReactNode[];
  rightButton?: React.ReactNode[];
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ width: "100%", pb: 1 }}>
        {leftButton?.map((button) => button)}
        <FlexBox />
        {rightButton?.map((button) => button)}
      </Stack>
      {children}
    </Box>
  );
}

export default Page;
