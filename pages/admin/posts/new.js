// pages/admin/posts/new.js
import { useState } from "react";
import { useRouter } from "next/router";
import AuthWrapper from "../../../components/AuthWrapper";
import Layout from "../../../components/Layout";
import dbConnect from "../../../utils/db";
import Category from "../../../models/Category";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import slugify from "slugify";

// Fetch available categories from the database
export async function getServerSideProps(context) {
  await dbConnect();

  let categories = [];
  try {
    const catDocs = await Category.find({}).sort({ name: 1 }).lean();
    categories = catDocs.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return {
    props: { categories },
  };
}

export default function NewPostPage({ categories }) {
  const router = useRouter();

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // We'll store local file paths (e.g. "/uploads/filename.jpg")
  const [image, setImage] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [published, setPublished] = useState(true);

  // UI states
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to upload a file locally via /api/uploadLocal
  const uploadFileLocally = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploadLocal", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to upload file locally");
    }
    const data = await res.json();
    return data.url; // returns e.g. "/uploads/filename.jpg"
  };

  // Handle file input for post image
  const handlePostImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const localPath = await uploadFileLocally(file);
      setImage(localPath);
    } catch (err) {
      console.error("Error uploading post image:", err);
      setError(err.message);
    }
  };

  // Handle file input for featured image
  const handleFeaturedImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const localPath = await uploadFileLocally(file);
      setFeaturedImage(localPath);
    } catch (err) {
      console.error("Error uploading featured image:", err);
      setError(err.message);
    }
  };

  // Generate Article from ChatGPT then filter the response
  const handleGenerateArticle = async () => {
    if (!title.trim()) {
      alert("Please enter a title first.");
      return;
    }
    setGenLoading(true);
    setError("");
    try {
      const userPrompt = `
        Write an article on "${title}". Article must be in 1500 words. Include meta tags for SEO.
        Respond only in HTML format.
      `;
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ChatGPT request failed: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      const rawHTML = data.result;
      if (!rawHTML) throw new Error("No HTML content found in AI response.");
      setContent(rawHTML);
      // Filter the raw HTML
      const filterRes = await fetch("/api/filterResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: rawHTML }),
      });
      if (!filterRes.ok) {
        const errorText = await filterRes.text();
        throw new Error(`Filtering failed: ${filterRes.status} - ${errorText}`);
      }
      const filterData = await filterRes.json();
      setContent(filterData.filtered);
    } catch (err) {
      console.error("Error generating article:", err);
      setError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  // Perform SEO Optimization on the content and then filter it
  const handleSeoOptimization = async () => {
    if (!content.trim()) {
      alert("No content available to optimize.");
      return;
    }
    setSeoLoading(true);
    setError("");
    try {
      // Create temporary post data for SEO optimization
      const tempPostData = {
        title,
        content,
        featuredImage,
        slug: slugify(title, { lower: true, strict: true }),
        categories: selectedCategory ? [selectedCategory] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const res = await fetch("/api/seoOptimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          html: content,
          postData: tempPostData 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`SEO optimization failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const optimizedHTML = data.optimized;
      setContent(optimizedHTML);

      // Filter the newly optimized HTML
      const filterRes = await fetch("/api/filterResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: optimizedHTML }),
      });

      if (!filterRes.ok) {
        throw new Error(`Filtering failed: ${filterRes.status}`);
      }

      const filterData = await filterRes.json();
      setContent(filterData.filtered);
    } catch (err) {
      console.error("Error optimizing content:", err);
      setError(err.message);
    } finally {
      setSeoLoading(false);
    }
  };

  // Fix meta tags of the post content
  const handleFixMetaTags = async () => {
    if (!content.trim()) {
      alert("No content available to fix meta tags.");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      // Create post data for meta tag fixing
      const postData = {
        title,
        content,
        featuredImage,
        slug: slugify(title, { lower: true, strict: true }),
        categories: selectedCategory ? [selectedCategory] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Call the fixSeoTags endpoint
      const res = await fetch("/api/fixMetaTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          html: content,
          postData 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Meta tag fixing failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      setContent(data.fixedHtml);
      alert("Meta tags fixed successfully!");

    } catch (err) {
      console.error("Error fixing meta tags:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save the post (with local image paths) if published
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!published) {
        setError("Post is not published, so it won't be saved.");
        setLoading(false);
        return;
      }
      const body = {
        title,
        content,
        image,         // local file path, e.g. "/uploads/filename.jpg"
        featuredImage, // local file path
        categories: selectedCategory ? [selectedCategory] : [],
        published,
      };
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }
      router.push("/admin/posts");
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyles = {
    color: "primary.main",
    borderColor: "primary.main",
    "&:hover": {
      borderColor: "primary.dark",
      color: "primary.dark",
    },
    "&:focus": { outline: "none" },
    "&:active": {
      boxShadow: "none",
      backgroundColor: "transparent",
    },
    "&.Mui-disabled": {
      color: "rgba(25, 118, 210, 0.5)",
      borderColor: "rgba(25, 118, 210, 0.5)",
    },
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
                Create New Post
              </Typography>
              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateArticle}
                    disabled={genLoading || seoLoading}
                    sx={buttonStyles}
                  >
                    {genLoading ? "Generating..." : "Generate Article"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSeoOptimization}
                    disabled={seoLoading || genLoading}
                    sx={buttonStyles}
                  >
                    {seoLoading ? "Optimizing..." : "Perform SEO-optimization"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleFixMetaTags}
                    disabled={seoLoading || genLoading}
                    sx={buttonStyles}
                  >
                    Fix Meta Tags
                  </Button>
                </Box>
                <TextField
                  label="Content (HTML)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  rows={8}
                  fullWidth
                  helperText="AI-generated HTML or manually written HTML"
                />
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Image:
                  </Typography>
                  <input type="file" onChange={handlePostImageChange} />
                  {image && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={image}
                        alt="Post"
                        style={{ maxWidth: "200px", borderRadius: "4px" }}
                      />
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Featured Image:
                  </Typography>
                  <input type="file" onChange={handleFeaturedImageChange} />
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
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
