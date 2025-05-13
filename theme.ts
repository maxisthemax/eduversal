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
        size: "small",
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
        sx: {
          textAlign: "start",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: "none",
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
