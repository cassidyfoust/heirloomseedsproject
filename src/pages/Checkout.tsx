import React, { useState } from "react";
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
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [hasDonated, setHasDonated] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>("");

  const handleDonationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasDonated(event.target.checked);
    if (!event.target.checked) {
      setDonationAmount("");
    }
  };

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
                  Support Our Project
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Your donations help us preserve heirloom seed varieties and
                  support sustainable agriculture. While optional, every
                  contribution makes a difference.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hasDonated}
                        onChange={handleDonationChange}
                        color="primary"
                      />
                    }
                    label="I have made a donation to support the Heirloom Seeds Project"
                  />
                  {hasDonated && (
                    <TextField
                      fullWidth
                      label="Donation Amount ($)"
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      sx={{ mt: 2 }}
                      InputProps={{
                        inputProps: { min: 0, step: "0.01" },
                      }}
                    />
                  )}
                </Box>
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
