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
  Menu,
  MenuItem,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";

interface NavbarProps {
  selectedSeeds?: Map<number, number>;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedSeeds,
  isAuthenticated,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          <Button color="inherit" component={RouterLink} to="/seed-library">
            Seed Library
          </Button>
          <Button color="inherit" component={RouterLink} to="/about">
            About
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
            <>
              <Button
                color="inherit"
                startIcon={<InventoryIcon />}
                component={RouterLink}
                to="/admin"
              >
                Inventory
              </Button>
              <Button
                color="inherit"
                startIcon={<ReceiptIcon />}
                component={RouterLink}
                to="/admin/orders"
              >
                Orders
              </Button>
            </>
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
