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
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { api, Seed } from "../services/api";

interface EditableSeed extends Seed {
  isEditing?: boolean;
  tempQuantity?: number;
}

const AdminSeedInventory: React.FC = () => {
  const [seeds, setSeeds] = useState<EditableSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    setLoading(true);
    try {
      const response = await api.getSeeds({
        limit: 100, // Get all seeds for admin view
        sortBy: "name",
        sortOrder: "asc",
      });
      setSeeds(response.items);
    } catch (err) {
      setError("Failed to fetch seeds");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seed: EditableSeed) => {
    setSeeds((prev) =>
      prev.map((s) =>
        s.id === seed.id
          ? { ...s, isEditing: true, tempQuantity: s.quantity_available }
          : s
      )
    );
  };

  const handleSave = async (seed: EditableSeed) => {
    if (!seed.tempQuantity) return;

    try {
      await api.updateSeed(seed.id, {
        ...seed,
        quantity_available: seed.tempQuantity,
      });
      setSeeds((prev) =>
        prev.map((s) =>
          s.id === seed.id
            ? {
                ...s,
                quantity_available: seed.tempQuantity!,
                isEditing: false,
                tempQuantity: undefined,
              }
            : s
        )
      );
    } catch (err) {
      setError("Failed to update seed quantity");
    }
  };

  const handleCancel = (seed: EditableSeed) => {
    setSeeds((prev) =>
      prev.map((s) =>
        s.id === seed.id
          ? { ...s, isEditing: false, tempQuantity: undefined }
          : s
      )
    );
  };

  const categories = Array.from(
    new Set(seeds.map((seed) => seed.category))
  ).sort();

  const filteredSeeds = seeds.filter((seed) => {
    const matchesSearch = seed.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || seed.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                variant="outlined"
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
          sx={{ maxHeight: "calc(100vh - 200px)" }}
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
              {filteredSeeds.map((seed) => (
                <TableRow key={seed.id}>
                  <TableCell>{seed.name}</TableCell>
                  <TableCell>{seed.category}</TableCell>
                  <TableCell align="right">
                    {seed.isEditing ? (
                      <TextField
                        type="number"
                        value={seed.tempQuantity}
                        onChange={(e) =>
                          setSeeds((prev) =>
                            prev.map((s) =>
                              s.id === seed.id
                                ? { ...s, tempQuantity: Number(e.target.value) }
                                : s
                            )
                          )
                        }
                        size="small"
                        sx={{ width: 100 }}
                      />
                    ) : (
                      seed.quantity_available
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {seed.isEditing ? (
                      <>
                        <Tooltip title="Save">
                          <IconButton
                            color="primary"
                            onClick={() => handleSave(seed)}
                            disabled={seed.tempQuantity === undefined}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            color="error"
                            onClick={() => handleCancel(seed)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(seed)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default AdminSeedInventory;
