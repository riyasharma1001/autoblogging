// pages/admin/posts/[id].js
import { useState } from "react";
import { useRouter } from "next/router";
import dbConnect from "../../../utils/db";
import Post from "../../../models/Post";
import Category from "../../../models/Category";
import AuthWrapper from "../../../components/AuthWrapper";
import Layout from "../../../components/Layout";
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
import path from "path";
import UploadIcon from '@mui/icons-material/Upload';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import slugify from "slugify";

// 1) Fetch the post by ID and fetch categories
export async function getServerSideProps(context) {
  await dbConnect();
  const { id } = context.query;

  // Attempt to find the existing post
  const postDoc = await Post.findById(id).lean();
  if (!postDoc) {
    return { notFound: true };
  }

  // Convert Mongoose doc to plain object
  const post = {
    _id: postDoc._id.toString(),
    title: postDoc.title || "",
    content: postDoc.content || "",
    image: postDoc.image || "",
    featuredImage: postDoc.featuredImage || "",
    categories: postDoc.categories || [],
    published: postDoc.published ?? true,
  };

  // Also fetch all categories for the dropdown
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
    props: { post, categories },
  };
}

export default function EditPostPage({ post, categories }) {
  const router = useRouter();

  // 2) State for post fields
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(post.image);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage);
  // If multiple categories are supported, you might store them in an array,
  // but here we assume only one main category for simplicity
  const [selectedCategory, setSelectedCategory] = useState(post.categories[0] || "");
  const [published, setPublished] = useState(post.published);

  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);

  // 3) Helper function: upload file locally
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
    return data.url; // e.g. "/uploads/filename.jpg"
  };

  // 4) Handle image file input
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

  // 5) Handle featured image file input
  const handleFeaturedImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      // First upload the image
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/uploadLocal", {
        method: "POST",
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        throw new Error('No image URL received');
      }

      // Then update the post with all current data
      const postData = {
        title,
        content,
        image,
        featuredImage: uploadData.url,
        categories: selectedCategory ? [selectedCategory] : [],
        published
      };

      const updateRes = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

      if (!updateRes.ok) {
        throw new Error('Failed to update post');
      }

      // Update the local state
      setFeaturedImage(uploadData.url);
      
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  // New handler for featured image upload
  const handleFeaturedImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploadLocal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success && data.url) {
        // Update the post with new featured image URL
        const updateResponse = await fetch(`/api/posts/${post._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...post,
            featuredImage: data.url
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update post with new image');
        }

        // Update the local state
        setPost(prev => ({ ...prev, featuredImage: data.url }));
        setFeaturedImage(data.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Add your error handling UI here
    }
  };

  // 6) (Optional) Generate article from ChatGPT
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

  // 7) (Optional) Perform SEO optimization on the content
  const handleSeoOptimization = async () => {
    if (!content.trim()) {
      alert("No content available to optimize.");
      return;
    }
    setSeoLoading(true);
    setError("");
    try {
      // Update post data with current values
      const currentPostData = {
        ...post,
        title,
        content,
        featuredImage,
        slug: slugify(title, { lower: true, strict: true }),
        categories: selectedCategory ? [selectedCategory] : [],
        updatedAt: new Date()
      };

      const res = await fetch("/api/seoOptimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          html: content,
          postData: currentPostData 
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

  // Add this handler function with your other handlers
  const handleFixMetaTags = async () => {
    if (!content.trim()) {
      alert("No content available to fix meta tags.");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const postData = {
        ...post,
        title,
        content,
        featuredImage,
        slug: slugify(title, { lower: true, strict: true }),
        categories: selectedCategory ? [selectedCategory] : [],
        updatedAt: new Date()
      };

      const res = await fetch("/api/fixMetaTags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          html: content,
          postData 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fix meta tags');
      }

      const data = await res.json();
      if (!data.fixedHtml) {
        throw new Error('No fixed HTML returned');
      }

      setContent(data.fixedHtml);
      alert("Meta tags fixed successfully!");

    } catch (err) {
      console.error("Error fixing meta tags:", err);
      setError(err.message || 'Failed to fix meta tags');
    } finally {
      setLoading(false);
    }
  };

  // 8) Handle post update via PUT request
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        throw new Error('Not authenticated');
      }

      const body = {
        title,
        content,
        image,
        featuredImage,
        categories: selectedCategory ? [selectedCategory] : [],
        published,
      };

      const res = await fetch(`/api/posts/${post._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to headers
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          // Handle authentication error
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || `Failed to update post: ${res.status}`);
      }

      router.push("/admin/posts");
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      
        {/* Light background for your updated style */}
        <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 4 }}>
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
                onSubmit={handleUpdate}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Title */}
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                />

                {/* AI Generate & SEO Buttons */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateArticle}
                    disabled={genLoading || seoLoading}
                  >
                    {genLoading ? "Generating..." : "Generate Article"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSeoOptimization}
                    disabled={seoLoading || genLoading}
                  >
                    {seoLoading ? "Optimizing..." : "Perform SEO-optimization"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleFixMetaTags}
                    disabled={seoLoading || genLoading}
                  >
                    Fix Meta Tags
                  </Button>
                </Box>

                {/* Content (HTML) */}
                <TextField
                  label="Content (HTML)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  rows={8}
                  fullWidth
                  helperText="AI-generated HTML or manually written HTML"
                />

                {/* Image */}
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

                {/* Featured Image */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Featured Image</Typography>
                  
                  <input
                    type="file"
                    accept="image/*"
                    id="featured-image"
                    style={{ display: 'none' }}
                    onChange={handleFeaturedImageChange}
                  />
                  
                  <label htmlFor="featured-image">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      {featuredImage ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>

                  {featuredImage && (
                    <Box sx={{ mt: 2, position: 'relative' }}>
                      <img 
                        src={featuredImage}
                        alt="Featured preview"
                        style={{
                          maxWidth: '300px',
                          height: 'auto',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                      <IconButton
                        onClick={() => {
                          setFeaturedImage('');
                          handleFeaturedImageChange({ target: { files: [] } });
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  )}

                  {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}
                </Box>

                {/* Category Selection */}
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

                {/* Update Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {loading ? "Updating..." : "Update Post"}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      
    </AuthWrapper>
  );
}
