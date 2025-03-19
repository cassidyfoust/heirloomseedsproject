import React, { useState, useEffect, useMemo } from "react";
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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  SelectChangeEvent,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api, Order, OrderStatus } from "../services/api";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear";

type SortField = "customer_name" | "status" | "created_at";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    email: "",
    status: "",
    seedName: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "created_at",
    order: "desc",
  });

  useEffect(() => {
    fetchOrders();
  }, [page, filters, sortConfig]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders({
        page,
        limit: ITEMS_PER_PAGE,
        email: filters.email,
        status: filters.status,
        seedName: filters.seedName,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      });

      // Ensure response has the expected structure
      if (!response || !Array.isArray(response.items)) {
        console.error("Invalid response format:", response);
        setError("Invalid response format from server");
        setOrders([]);
        setTotalItems(0);
        return;
      }

      setOrders(response.items);
      setTotalItems(response.total || 0);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders");
      setOrders([]);
      setTotalItems(0);
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
    currentStatus: OrderStatus
  ) => {
    try {
      // Cycle through statuses: incomplete -> in_progress -> complete -> incomplete
      const nextStatus: OrderStatus =
        currentStatus === "incomplete"
          ? "in_progress"
          : currentStatus === "in_progress"
          ? "complete"
          : "incomplete";

      await api.updateOrderStatus(orderId, nextStatus);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("Failed to update order status");
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
    setPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSelectFilterChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      email: "",
      status: "",
      seedName: "",
    });
    setPage(1); // Reset to first page when clearing filters
  };

  // Memoize filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let filteredOrders = [...orders];

    // Apply filters
    if (filters.email) {
      filteredOrders = filteredOrders.filter((order) =>
        order.customer_email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === filters.status
      );
    }

    if (filters.seedName) {
      filteredOrders = filteredOrders.filter((order) => {
        // Check if any seed in the order matches the search term
        return order.seeds.some((item) =>
          item.seed.name.toLowerCase().includes(filters.seedName.toLowerCase())
        );
      });
    }

    // Apply sorting
    filteredOrders.sort((a, b) => {
      if (sortConfig.field === "customer_name") {
        return sortConfig.order === "asc"
          ? a.customer_name.localeCompare(b.customer_name)
          : b.customer_name.localeCompare(a.customer_name);
      }
      if (sortConfig.field === "status") {
        const statusOrder = { incomplete: 0, in_progress: 1, complete: 2 };
        return sortConfig.order === "asc"
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }
      if (sortConfig.field === "created_at") {
        return sortConfig.order === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return filteredOrders;
  }, [orders, filters, sortConfig]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "complete":
        return "success";
      case "in_progress":
        return "info";
      case "incomplete":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "complete":
        return "Complete";
      case "in_progress":
        return "In Progress";
      case "incomplete":
        return "Incomplete";
      default:
        return status;
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

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Filter by Email"
                name="email"
                value={filters.email}
                onChange={handleTextFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleSelectFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="incomplete">Incomplete</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="complete">Complete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Search by Seed Name"
                  name="seedName"
                  value={filters.seedName}
                  onChange={handleTextFilterChange}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  disabled={
                    !Object.values(filters).some((value) => value !== "")
                  }
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Customer
                    <Tooltip title="Sort by customer name">
                      <IconButton
                        size="small"
                        onClick={() => handleSort("customer_name")}
                      >
                        {sortConfig.field === "customer_name" ? (
                          sortConfig.order === "asc" ? (
                            <ArrowUpwardIcon />
                          ) : (
                            <ArrowDownwardIcon />
                          )
                        ) : null}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Status
                    <Tooltip title="Sort by status">
                      <IconButton
                        size="small"
                        onClick={() => handleSort("status")}
                      >
                        {sortConfig.field === "status" ? (
                          sortConfig.order === "asc" ? (
                            <ArrowUpwardIcon />
                          ) : (
                            <ArrowDownwardIcon />
                          )
                        ) : null}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Date
                    <Tooltip title="Sort by date">
                      <IconButton
                        size="small"
                        onClick={() => handleSort("created_at")}
                      >
                        {sortConfig.field === "created_at" ? (
                          sortConfig.order === "asc" ? (
                            <ArrowUpwardIcon />
                          ) : (
                            <ArrowDownwardIcon />
                          )
                        ) : null}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      onClick={() => handleStatusChange(order.id, order.status)}
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

        {/* Add pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(totalItems / ITEMS_PER_PAGE)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>

        {/* Order Details Dialog */}
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
                  <Typography variant="body2" color="text.secondary">
                    Email: {selectedOrder.customer_email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Address: {selectedOrder.customer_address}
                  </Typography>
                  {selectedOrder.donation_amount > 0 && (
                    <Typography variant="body2" color="primary">
                      Donation Amount: $
                      {Number(selectedOrder.donation_amount).toFixed(2)}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Status: {getStatusLabel(selectedOrder.status)}
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
                  {selectedOrder.seeds
                    .filter((item) =>
                      filters.seedName
                        ? item.seed.name
                            .toLowerCase()
                            .includes(filters.seedName.toLowerCase())
                        : true
                    )
                    .map((item, index) => (
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
