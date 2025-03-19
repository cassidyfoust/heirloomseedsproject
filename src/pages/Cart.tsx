import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api, Seed } from "../services/api";

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
  const [openCheckout, setOpenCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_address: "",
    include_donation: false,
    donation_amount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert selectedSeeds Map to array format expected by API
      const seedsArray = Array.from(selectedSeeds.entries()).map(
        ([seed_id, quantity]) => ({
          seed_id,
          quantity,
        })
      );

      const orderData = {
        ...formData,
        seeds: seedsArray,
        donation_amount: formData.include_donation
          ? parseFloat(formData.donation_amount)
          : 0,
      };

      await api.createOrder(orderData);

      // Clear cart and redirect to success page
      onClearCart();
      navigate("/order-success");
    } catch (error: any) {
      setError(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSeedsList = () => {
    return Array.from(selectedSeeds.entries())
      .map(([seedId, quantity]) => {
        const seed = seeds.find((s) => s.id === seedId);
        return seed ? { ...seed, quantity } : null;
      })
      .filter((seed): seed is Seed & { quantity: number } => seed !== null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shopping Cart
        </Typography>

        {selectedSeeds.size === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/seed-library")}
              sx={{ mt: 2 }}
            >
              Browse Seeds
            </Button>
          </Box>
        ) : (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Grid container spacing={2}>
                  {getSelectedSeedsList().map((seed) => (
                    <Grid item xs={12} key={seed.id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {seed.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {seed.quantity}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" color="error" onClick={onClearCart}>
                  Clear Cart
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenCheckout(true)}
                >
                  Checkout
                </Button>
              </Box>
            </Box>

            <Dialog
              open={openCheckout}
              onClose={() => setOpenCheckout(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Checkout</DialogTitle>
              <DialogContent>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="customer_address"
                      multiline
                      rows={3}
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.include_donation}
                          onChange={handleInputChange}
                          name="include_donation"
                        />
                      }
                      label="Include a donation to support our mission"
                    />
                  </Grid>
                  {formData.include_donation && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Donation Amount"
                        name="donation_amount"
                        type="number"
                        value={formData.donation_amount}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: "$",
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setOpenCheckout(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  variant="contained"
                  disabled={
                    loading ||
                    !formData.customer_name ||
                    !formData.customer_email ||
                    !formData.customer_address ||
                    (formData.include_donation &&
                      (!formData.donation_amount ||
                        parseFloat(formData.donation_amount) <= 0))
                  }
                >
                  {loading ? <CircularProgress size={24} /> : "Place Order"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Cart;
