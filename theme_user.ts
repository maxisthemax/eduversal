import { createTheme, ThemeOptions } from "@mui/material/styles";

// Create a theme instance.

const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: "#006DEE",
      contrastText: "#ffffff",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        slotProps: {
          input: {
            sx: {
              height: "55px",
              fontSize: "16px",
              py: "18px",
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
        sx: {
          textAlign: "start",
          height: "55px",
          fontSize: "16px",
          py: "18px",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: "none",
          fontSize: "16px",
          height: "55px",
          minWidth: "120px",
          px: "36px",
          py: "18px",
        },
        disableElevation: true,
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          maxHeight: "unset",
          overflowY: "unset",
        },
      },
    },
    MuiTab: {
      styleOverrides: { textColorPrimary: { textTransform: "none" } },
    },
  },
};

const theme = createTheme(baseTheme);

export default theme;
