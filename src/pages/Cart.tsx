import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { Seed } from "../services/api";

interface CartItem {
  seed: Seed;
  quantity: number;
}

interface CartProps {
  selectedSeeds: Map<number, number>;
  seeds: Seed[];
  onQuantityChange: (seed: Seed, change: number) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({
  selectedSeeds,
  seeds,
  onQuantityChange,
  onClearCart,
}) => {
  const navigate = useNavigate();

  const cartItems: CartItem[] = Array.from(selectedSeeds.entries())
    .map(([seedId, quantity]) => {
      const seed = seeds.find((s) => s.id === seedId);
      return seed ? { seed, quantity } : null;
    })
    .filter((item): item is CartItem => item !== null);

  const totalSeeds = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add some seeds to your cart to get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/seed-library")}
          >
            Browse Seeds
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Typography variant="h4">Your Cart</Typography>
          <Button variant="outlined" color="error" onClick={onClearCart}>
            Clear Cart
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Card key={item.seed.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography variant="h6">{item.seed.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.seed.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Decrease quantity">
                        <IconButton
                          size="small"
                          onClick={() => onQuantityChange(item.seed, -1)}
                          disabled={item.quantity <= 0}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Typography
                        variant="body1"
                        sx={{ minWidth: 24, textAlign: "center" }}
                      >
                        {item.quantity}
                      </Typography>
                      <Tooltip title="Increase quantity">
                        <IconButton
                          size="small"
                          onClick={() => onQuantityChange(item.seed, 1)}
                          disabled={
                            item.quantity >= item.seed.quantity_available
                          }
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="body1">
                    Total Seeds: {totalSeeds}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Cart;
