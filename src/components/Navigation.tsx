import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
          }}
        >
          Heirloom Seeds Project
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/seed-library"
            sx={{ mx: 1 }}
          >
            Seed Library
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/about"
            sx={{ mx: 1 }}
          >
            About
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
