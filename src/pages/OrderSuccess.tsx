import React from "react";
import { Container, Typography, Box, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// TODO CASS: fix seed library button to go to seeds page
// TODO CASS: user should not see orders page
const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: "success.main", mb: 2 }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Order Placed Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Thank you for your order. We'll process it right away and send you a
          confirmation email.
        </Typography>
        <Paper
          sx={{
            p: 3,
            mt: 4,
            width: "100%",
            backgroundColor: "success.light",
            color: "success.dark",
          }}
        >
          <Typography variant="body1">
            Your order has been received and is being processed. You will
            receive an email confirmation shortly.
          </Typography>
        </Paper>
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/seed-library")}>
            Back to Seed Library
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OrderSuccess;
