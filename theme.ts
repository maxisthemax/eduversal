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
      defaultProps: { size: "small", fullWidth: true },
    },
    MuiSelect: {
      defaultProps: { size: "small", sx: { textAlign: "start" } },
    },
    MuiButton: { defaultProps: { size: "small" } },
    MuiDialog: {
      styleOverrides: {
        paper: {
          maxHeight: "unset",
          overflowY: "unset",
        },
      },
    },
  },
};

const theme = createTheme(baseTheme);

export default theme;
