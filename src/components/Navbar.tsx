import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InventoryIcon from "@mui/icons-material/Inventory";

interface NavbarProps {
  selectedSeeds?: Map<number, number>;
  isAuthenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ selectedSeeds, isAuthenticated }) => {
  const navigate = useNavigate();

  const getTotalSelectedSeeds = () => {
    if (!selectedSeeds) return 0;
    return Array.from(selectedSeeds.values()).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          Heirloom Seeds
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Seed Library
          </Button>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/cart"
            disabled={getTotalSelectedSeeds() === 0}
          >
            <Badge badgeContent={getTotalSelectedSeeds()} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {isAuthenticated ? (
            <Button
              color="inherit"
              startIcon={<InventoryIcon />}
              component={RouterLink}
              to="/admin"
            >
              Inventory Management
            </Button>
          ) : (
            <IconButton
              color="inherit"
              onClick={() => navigate("/login")}
              title="Admin Panel"
            >
              <AdminPanelSettingsIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
