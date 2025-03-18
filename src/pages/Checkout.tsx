import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Email" type="email" required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Address" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="City" required />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="State" required />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField fullWidth label="ZIP Code" required />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Card Number" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Expiry Date" required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CVV" required />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Typography variant="body1">Total Seeds: 0</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/order-confirmation")}
                >
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Checkout;
