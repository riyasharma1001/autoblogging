// pages/admin/categories/index.js
import AuthWrapper from "../../../components/AuthWrapper";
import Layout from "../../../components/Layout";
import dbConnect from "../../../utils/db";
import Category from "../../../models/Category";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

export async function getServerSideProps() {
  try {
    await dbConnect();
    console.log("[categories] DB connected.");

    // Fetch categories from your Category model
    const categories = await Category.find().sort({ name: 1 }).lean();
    console.log("[categories] Fetched from DB:", categories);

    const serializedCats = categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
    }));

    return {
      props: {
        initialCategories: serializedCats,
      },
    };
  } catch (err) {
    console.error("[categories] Error fetching categories:", err);
    return {
      props: {
        initialCategories: [],
        errorMsg: "Failed to load categories",
      },
    };
  }
}

export default function CategoriesPage({ initialCategories, errorMsg }) {
  // We store them in state so we can remove them client-side on delete
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState(errorMsg || "");

  // handleCreateNew => navigate to create page
  const handleCreateNew = () => {
    window.location.href = "/admin/categories/new";
  };

  // handleDelete => call your API
  const handleDelete = async (catId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Delete error! status: ${res.status}`);
      }
      // Remove from local state
      setCategories((prev) => prev.filter((c) => c._id !== catId));
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category");
    }
  };

  return (
    <AuthWrapper>
      
        <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4 }}>
          <Container maxWidth="md">
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                All Categories
              </Typography>

              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button variant="contained" onClick={handleCreateNew}>
                  Create a new category
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {categories.length === 0 ? (
                <Typography>No categories found.</Typography>
              ) : (
                <List>
                  {categories.map((cat) => (
                    <ListItem
                      key={cat._id}
                      disablePadding
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(cat._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemButton>
                        <ListItemText primary={cat.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Container>
        </Box>
      
    </AuthWrapper>
  );
}
