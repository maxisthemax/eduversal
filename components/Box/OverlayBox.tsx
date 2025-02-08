//*mui
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

interface OverlayBoxProps {
  isLoading: boolean;
  circularSize?: number;
  children: React.ReactNode[] | React.ReactNode;
}

function OverlayBox({
  isLoading,
  circularSize = 60,
  children,
}: OverlayBoxProps) {
  return (
    <Box sx={{ position: "relative" }}>
      {children}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          display: isLoading ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <CircularProgress size={circularSize} />
      </Box>
    </Box>
  );
}

export default OverlayBox;
