import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { api, Seed } from "../services/api";
import EditSeedModal from "../components/EditSeedModal";

interface EditableSeed extends Seed {
  isEditing?: boolean;
  tempQuantity?: number;
}

const ITEMS_PER_PAGE = 50;

const AdminSeedInventory: React.FC = () => {
  const [seeds, setSeeds] = useState<EditableSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  console.log("[AdminSeedInventory] Component rendering");

  useEffect(() => {
    console.log("[AdminSeedInventory] Component mounted");
    return () => {
      console.log("[AdminSeedInventory] Component unmounted");
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    console.log("[AdminSeedInventory] Fetching categories");
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        console.log("[AdminSeedInventory] Categories fetched:", data);
        setCategories(data as string[]);
      } catch (err) {
        console.error("[AdminSeedInventory] Failed to fetch categories:", err);
        setError("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch seeds
  useEffect(() => {
    console.log("[AdminSeedInventory] Fetching seeds with params:", {
      page,
      searchQuery,
      selectedCategory,
    });
    const fetchSeeds = async () => {
      setLoading(true);
      try {
        const response = await api.getSeeds({
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
          category: selectedCategory === "all" ? undefined : selectedCategory,
        });
        console.log("[AdminSeedInventory] Seeds fetched:", {
          count: response.items.length,
          total: response.total,
        });
        setSeeds(response.items);
        setTotalItems(response.total);
      } catch (err) {
        console.error("[AdminSeedInventory] Failed to fetch seeds:", err);
        setError("Failed to fetch seeds");
      } finally {
        setLoading(false);
      }
    };
    fetchSeeds();
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    console.log("[AdminSeedInventory] Seeds state changed:", {
      count: seeds.length,
    });
  }, [seeds]);

  useEffect(() => {
    console.log("[AdminSeedInventory] Loading state changed:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("[AdminSeedInventory] Error state changed:", error);
  }, [error]);

  useEffect(() => {
    console.log("[AdminSeedInventory] Page changed:", page);
  }, [page]);

  useEffect(() => {
    console.log("[AdminSeedInventory] Search query changed:", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log(
      "[AdminSeedInventory] Selected category changed:",
      selectedCategory
    );
  }, [selectedCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[AdminSeedInventory] Search input changed");
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    console.log("[AdminSeedInventory] Category changed");
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    console.log("[AdminSeedInventory] Page changed to:", value);
    setPage(value);
  };

  const handleAddSeed = () => {
    console.log("[AdminSeedInventory] Opening add seed dialog");
    // ... rest of the code
  };

  const handleEdit = (seed: Seed) => {
    setSelectedSeed(seed);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedSeed(null);
    setEditModalOpen(false);
  };

  const handleSaveSeed = async (updatedSeed: Partial<Seed>) => {
    if (!selectedSeed) return;

    try {
      await api.updateSeed(selectedSeed.id, updatedSeed);
      // Refresh the seeds list
      const response = await api.getSeeds({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });
      setSeeds(response.items);
      handleCloseEditModal();
      setSnackbar({
        open: true,
        message: "Seed updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to update seed:", err);
      setError("Failed to update seed");
      setSnackbar({
        open: true,
        message: "Failed to update seed",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading && seeds.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Seed Inventory Management
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search seeds by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={handleCategoryChange}
                variant="outlined"
                disabled={loading}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer
          component={Paper}
          sx={{ maxHeight: "calc(100vh - 300px)" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}
                >
                  Seed Name
                </TableCell>
                <TableCell
                  sx={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}
                >
                  Category
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}
                >
                  Quantity Available
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: "#e8f5e9", fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seeds.map((seed) => (
                <TableRow key={seed.id}>
                  <TableCell>{seed.name}</TableCell>
                  <TableCell>{seed.category}</TableCell>
                  <TableCell align="right">{seed.quantity_available}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(seed)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(totalItems / ITEMS_PER_PAGE)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        </Box>
      </Box>

      {selectedSeed && (
        <EditSeedModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveSeed}
          seed={selectedSeed}
          categories={categories}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminSeedInventory;
