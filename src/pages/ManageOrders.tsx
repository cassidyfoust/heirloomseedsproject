import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface OrderWithSeeds extends Order {
  seeds: Array<{
    seed: {
      id: number;
      name: string;
      description: string;
      category: string;
    };
    quantity: number;
  }>;
}

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithSeeds | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders();
      setOrders(response);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await api.getOrderById(orderId);
      setSelectedOrder(response);
      setDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Failed to fetch order details");
    }
  };

  const handleStatusChange = async (
    orderId: number,
    currentStatus: boolean
  ) => {
    try {
      await api.updateOrderStatus(orderId, !currentStatus);
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Manage Orders
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.is_complete ? "Complete" : "Pending"}
                      color={order.is_complete ? "success" : "warning"}
                      onClick={() =>
                        handleStatusChange(order.id, order.is_complete)
                      }
                      sx={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography>Name: {selectedOrder.customer_name}</Typography>
                  <Typography>Email: {selectedOrder.customer_email}</Typography>
                  <Typography>
                    Address: {selectedOrder.customer_address}
                  </Typography>
                  <Typography>
                    Order Date:{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Seeds in Order
                </Typography>
                <List>
                  {selectedOrder.seeds.map((item, index) => (
                    <React.Fragment key={item.seed.id}>
                      <ListItem>
                        <ListItemText
                          primary={item.seed.name}
                          secondary={`Category: ${item.seed.category} | Quantity: ${item.quantity}`}
                        />
                      </ListItem>
                      {index < selectedOrder.seeds.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ManageOrders;
