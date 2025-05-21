// pages/admin/categories/new.js
import { useState } from "react";
import { useRouter } from "next/router";
import AuthWrapper from "../../../components/AuthWrapper";
import Layout from "../../../components/Layout";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In a real app, you'd POST to /api/categories, for example:
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }
      // On success, navigate back to the categories list
      router.push("/admin/categories");
    } catch (err) {
      console.error("Error creating category:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <AuthWrapper>
      
        <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4 }}>
          <Container maxWidth="sm">
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                Create Category
              </Typography>

              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      
    </AuthWrapper>
  );
}
