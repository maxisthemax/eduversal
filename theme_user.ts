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
          py: 1,
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

theme.typography.body1 = {
  ...theme.typography.body1,
  fontSize: "16px",

  [theme.breakpoints.down("md")]: {
    fontSize: "14px",
  },
};

theme.typography.h6 = {
  ...theme.typography.h6,

  [theme.breakpoints.down("md")]: {
    fontSize: "18px",
  },
};

theme.typography.h4 = {
  ...theme.typography.h4,

  [theme.breakpoints.down("md")]: {
    fontSize: "20px",
  },
};

export default theme;
