// pages/admin/posts/index.js
import { useState } from "react";
import { useRouter } from "next/router";
import AuthWrapper from "../../../components/AuthWrapper";
import Layout from "../../../components/Layout";
import dbConnect from "../../../utils/db";
import Post from "../../../models/Post";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from "@mui/material";

// 1) Fetch all posts from DB
export async function getServerSideProps() {
  await dbConnect();

  let posts = [];
  try {
    const postDocs = await Post.find({}).sort({ createdAt: -1 }).lean();
    posts = postDocs.map((p) => ({
      _id: p._id.toString(),
      title: p.title || "",
      // add more fields if you want
    }));
  } catch (err) {
    console.error("Error fetching posts:", err);
  }

  return {
    props: {
      initialPosts: posts,
    },
  };
}

export default function PostsIndex({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2) Handle Delete
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      // Remove the deleted post from state
      setPosts(posts.filter(post => post._id !== postId));
      alert("Post deleted successfully");

    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      
        {/* Lighter theme: white background */}
        <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 4 }}>
          <Container maxWidth="md">
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                All Posts
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button 
                variant="contained"
                onClick={() => router.push('/admin/posts/new')}
                sx={{ mb: 2, backgroundColor: '#2563eb' }}
              >
                Add New Post
              </Button>

              {posts.length === 0 ? (
                <Typography>No posts found.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post._id}>
                          <TableCell component="th" scope="row">
                            {post.title}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              sx={{ mr: 1 }}
                              onClick={() => router.push(`/admin/posts/${post._id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDelete(post._id)}
                              disabled={loading}
                            >
                              {loading ? "Deleting..." : "Delete"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Container>
        </Box>
      
    </AuthWrapper>
  );
}
