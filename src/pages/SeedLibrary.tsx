import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  FormControlLabel,
  Switch,
  CardActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { api, Seed } from "../services/api";

const ITEMS_PER_PAGE = 9;

type SortOption = "name-asc" | "name-desc" | "category-asc" | "category-desc";

// Category color mapping
const categoryColors: { [key: string]: { light: string; main: string } } = {
  Tomatoes: { light: "#ffebee", main: "#e57373" },
  Beans: { light: "#f3e5f5", main: "#ba68c8" },
  Corn: { light: "#fff3e0", main: "#ffb74d" },
  // Add more categories with their colors as needed
};

// Default color for any new categories
const defaultCategoryColor = { light: "#e8eaf6", main: "#7986cb" };

const getCategoryColor = (category: string) => {
  return categoryColors[category] || defaultCategoryColor;
};

interface SelectedSeed {
  id: number;
  quantity: number;
}

interface SeedLibraryProps {
  selectedSeeds: Map<number, number>;
  onQuantityChange: (seed: Seed, change: number) => void;
  onClearCart: () => void;
  onSeedsUpdate: (seeds: Seed[]) => void;
  seeds: Seed[];
}

// Add this style object near the top of the file
const outOfStockOverlay = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1,
};

const outOfStockText = {
  color: "#fff",
  fontSize: "1.5rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  textAlign: "center",
  padding: "1rem",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  borderRadius: "4px",
};

const SeedLibrary: React.FC<SeedLibraryProps> = ({
  selectedSeeds,
  onQuantityChange,
  onClearCart,
  onSeedsUpdate,
  seeds,
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data as string[]);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch seeds when filters change
  useEffect(() => {
    const fetchSeeds = async () => {
      setLoading(true);
      try {
        const response = await api.getSeeds({
          page: 1,
          limit: 100, // Get all seeds
          sortBy,
          sortOrder,
        });
        console.log("Fetched seeds:", response.items);
        onSeedsUpdate(response.items);
        setTotalItems(response.total);
      } catch (err) {
        console.error("Failed to fetch seeds:", err);
        setError("Failed to fetch seeds");
      } finally {
        setLoading(false);
      }
    };
    fetchSeeds();
  }, [sortBy, sortOrder, onSeedsUpdate]);

  const handleCategoryChange = (
    event: React.MouseEvent<HTMLElement>,
    newCategory: string
  ) => {
    setSelectedCategory(newCategory);
    setPage(1); // Reset to first page when category changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleCategoryPillClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    setPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    const [field, order] = event.target.value.split("-");
    setSortBy(field as "name" | "category");
    setSortOrder(order as "asc" | "desc");
    setPage(1); // Reset to first page when sort changes
  };

  const getTotalSelectedSeeds = () => {
    return Array.from(selectedSeeds.values()).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const filteredSeeds = seeds.filter((seed) => {
    const matchesSearch = seed.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || seed.category === selectedCategory;
    const hasQuantity = showOutOfStock || seed.quantity_available > 0;
    return matchesSearch && matchesCategory && hasQuantity;
  });

  console.log("Filtered seeds:", filteredSeeds);

  const paginatedSeeds = filteredSeeds.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredSeeds.length / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h1" component="h1" gutterBottom>
              Seed Library
            </Typography>
            <Typography variant="h2">Browse Our Collection</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            {getTotalSelectedSeeds() > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onClearCart}
              >
                Clear Cart
              </Button>
            )}
            <Badge badgeContent={getTotalSelectedSeeds()} color="primary">
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate("/cart")}
                disabled={getTotalSelectedSeeds() === 0}
              >
                View Cart
              </Button>
            </Badge>
          </Box>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search seeds by name or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <ToggleButtonGroup
              value={selectedCategory}
              exclusive
              onChange={handleCategoryChange}
              aria-label="seed categories"
              sx={{
                flexWrap: "wrap",
                gap: 1,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: "16px !important",
                  padding: "6px 16px",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "primary.main",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="all" aria-label="all categories">
                All
              </ToggleButton>
              {categories.map((category) => (
                <ToggleButton
                  key={category}
                  value={category}
                  aria-label={category}
                  sx={{
                    backgroundColor: getCategoryColor(category).light,
                    color: getCategoryColor(category).main,
                    fontWeight: 600,
                    "&.Mui-selected": {
                      backgroundColor: getCategoryColor(category).main,
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: getCategoryColor(category).main,
                      },
                    },
                  }}
                >
                  {category}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}` as SortOption}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                <MenuItem value="category-asc">Category (A-Z)</MenuItem>
                <MenuItem value="category-desc">Category (Z-A)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={showOutOfStock}
                  onChange={(e) => {
                    setShowOutOfStock(e.target.checked);
                    setPage(1);
                  }}
                  color="primary"
                />
              }
              label="Show Out of Stock"
            />
          </Box>
        </Box>

        {/* Results count and selected seeds count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {totalItems} seed{totalItems !== 1 ? "s" : ""} found
          </Typography>
          {getTotalSelectedSeeds() > 0 && (
            <Typography variant="body1" color="primary">
              {getTotalSelectedSeeds()} seed
              {getTotalSelectedSeeds() !== 1 ? "s" : ""} selected
            </Typography>
          )}
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Seed Grid */}
        {!loading && !error && (
          <>
            <Grid container spacing={4}>
              {paginatedSeeds.map((seed) => (
                <Grid item key={seed.id} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      opacity: seed.quantity_available === 0 ? 0.7 : 1,
                    }}
                  >
                    {seed.quantity_available === 0 && (
                      <Box sx={outOfStockOverlay}>
                        <Typography sx={outOfStockText}>
                          Out of Stock
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 1,
                      }}
                    >
                      <Chip
                        label={seed.category}
                        onClick={() => handleCategoryPillClick(seed.category)}
                        sx={{
                          backgroundColor: getCategoryColor(seed.category)
                            .light,
                          color: getCategoryColor(seed.category).main,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            backgroundColor: getCategoryColor(seed.category)
                              .light,
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          },
                          ...(selectedCategory === seed.category && {
                            backgroundColor: getCategoryColor(seed.category)
                              .main,
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: getCategoryColor(seed.category)
                                .main,
                            },
                          }),
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 6 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {seed.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {seed.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Growing Season: {seed.growing_season}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Days to Maturity: {seed.days_to_maturity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Planting Depth: {seed.planting_depth}" | Spacing:{" "}
                          {seed.spacing_inches}"
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                          backgroundColor: "#e8f5e9",
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => onQuantityChange(seed, -1)}
                          disabled={selectedSeeds.get(seed.id) === 0}
                          sx={{
                            color: getCategoryColor(seed.category).main,
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography
                          sx={{
                            flex: 1,
                            textAlign: "center",
                            color: getCategoryColor(seed.category).main,
                            fontWeight: 600,
                          }}
                        >
                          {selectedSeeds.get(seed.id) || 0}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => onQuantityChange(seed, 1)}
                          disabled={
                            selectedSeeds.get(seed.id) ===
                            seed.quantity_available
                          }
                          sx={{
                            color: getCategoryColor(seed.category).main,
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* No results message */}
            {filteredSeeds.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No seeds found matching your search criteria
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default SeedLibrary;
