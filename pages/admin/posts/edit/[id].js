// pages/admin/posts/edit/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthWrapper from "../../../../components/AuthWrapper";
import Layout from "../../../../components/Layout";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";

// Example: We'll simulate category fetching. In a real app, fetch from an API or pass them via getServerSideProps
const DUMMY_CATEGORIES = ["Auto", "Finance", "Tech"];

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  // Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    // In a real app, fetch the existing post data from your API
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPost(data);
        // Populate fields
        setTitle(data.title || "");
        setContent(data.content || "");
        setImage(data.image || "");
        setFeaturedImage(data.featuredImage || "");
        setPublished(data.published !== undefined ? data.published : true);
        // If you store a single category or multiple categories, adjust logic
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0]);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      }
    }
    fetchPost();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        title,
        content,
        image,
        featuredImage,
        published,
        // If your schema supports multiple categories, adapt accordingly
        categories: selectedCategory ? [selectedCategory] : []
      };
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update post");
      }
      router.push("/admin/posts");
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  if (!post) {
    return (
      <AuthWrapper>
        
          <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4 }}>
            <Container maxWidth="md">
              <Typography variant="h5">Loading post data...</Typography>
              {error && <Typography color="error">{error}</Typography>}
            </Container>
          </Box>
        
      </AuthWrapper>
    );
  }

  // Handle file changes if you allow file uploads
  const handleImageChange = (e, setFn) => {
    const file = e.target.files[0];
    if (!file) return;
    // You’d typically upload the file to your server or Cloud storage
    // For demo, we just set a fake path or file name
    setFn(URL.createObjectURL(file));
  };

  return (
    <AuthWrapper>
      
        <Box sx={{ backgroundColor: "#f0f4f8", minHeight: "100vh", py: 4 }}>
          <Container maxWidth="md">
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
              <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                Edit Post
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
                {/* Title Field */}
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                />

                {/* Content Field (could be a textarea or a WYSIWYG editor) */}
                <TextField
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  rows={5}
                  fullWidth
                />

                {/* Image Field (regular image) */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Image:
                  </Typography>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, setImage)}
                  />
                  {image && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={image}
                        alt="Uploaded"
                        style={{ maxWidth: "200px", borderRadius: "4px" }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Featured Image Field */}
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Featured Image:
                  </Typography>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, setFeaturedImage)}
                  />
                  {featuredImage && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={featuredImage}
                        alt="Featured"
                        style={{ maxWidth: "200px", borderRadius: "4px" }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Category (simple single category selection) */}
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {DUMMY_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Published Toggle */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                  }
                  label="Published"
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {loading ? "Saving..." : "Save Post"}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      
    </AuthWrapper>
  );
}
