import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32", // Deep green
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    secondary: {
      main: "#81C784", // Light green
      light: "#A5D6A7",
      dark: "#388E3C",
    },
    background: {
      default: "#F1F8E9", // Very light green
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1B5E20", // Dark green
      secondary: "#2E7D32", // Medium green
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: "#1B5E20",
      fontWeight: 700,
    },
    h2: {
      color: "#2E7D32",
      fontWeight: 600,
    },
    h3: {
      color: "#388E3C",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});
