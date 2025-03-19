import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { Seed } from "../services/api";

interface EditSeedModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedSeed: Partial<Seed>) => Promise<void>;
  seed: Seed;
  categories: string[];
}

const EditSeedModal: React.FC<EditSeedModalProps> = ({
  open,
  onClose,
  onSave,
  seed,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Seed>>({
    name: "",
    category: "",
    description: "",
    days_to_maturity: 0,
    quantity_available: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seed) {
      setFormData({
        name: seed.name,
        category: seed.category,
        description: seed.description,
        days_to_maturity: seed.days_to_maturity,
        quantity_available: seed.quantity_available,
      });
    }
  }, [seed]);

  const handleChange =
    (field: keyof Seed) =>
    (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === "days_to_maturity" || field === "quantity_available"
            ? parseInt(value as string, 10) || 0
            : value,
      }));
    };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save seed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Seed</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={handleChange("name")}
            fullWidth
            disabled={loading}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange("category") as any}
              label="Category"
              disabled={loading}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={formData.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            rows={4}
            disabled={loading}
          />
          <TextField
            label="Days to Maturity"
            type="number"
            value={formData.days_to_maturity}
            onChange={handleChange("days_to_maturity")}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Quantity Available"
            type="number"
            value={formData.quantity_available}
            onChange={handleChange("quantity_available")}
            fullWidth
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSeedModal;
