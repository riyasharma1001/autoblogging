// pages/index.js
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";
import { connectToDatabase } from "../utils/db";
import Post from "../models/Post";
import Category from "../models/Category";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";

function getExcerpt(post) {
  if (!post.content || !post.content.blocks) return "";
  const paragraphBlock = post.content.blocks.find(
    (block) => block.type === "paragraph"
  );
  if (!paragraphBlock) return "";
  let text = paragraphBlock.data.text || "";
  text = text.replace(/<[^>]+>/g, "");
  return text.length > 150 ? text.substring(0, 150) + "..." : text;
}

export async function getServerSideProps(context) {
  await connectToDatabase();

  try {
    const searchQuery = context.query.query || "";
    const categoryFilter = context.query.category || "";
    const page = parseInt(context.query.page) || 1;
    const postsPerPage = 9;
    
    // Create filter object
    let filter = { published: true };
    if (categoryFilter) filter.categories = categoryFilter;
    if (searchQuery) filter.$text = { $search: searchQuery };

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Fetch paginated posts
    let posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * postsPerPage)
      .limit(postsPerPage)
      .lean();

    // Fetch categories
    const categoriesData = await Category.find()
      .sort({ name: 1 })
      .lean();

    // Serialize the data
    const serializedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));

    const serializedCategories = categoriesData.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name
    }));

    return {
      props: {
        posts: serializedPosts,
        categories: serializedCategories,
        searchQuery,
        selectedCategory: categoryFilter,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts
        }
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        posts: [],
        categories: [],
        searchQuery: "",
        selectedCategory: "",
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0
        }
      }
    };
  }
}

export default function Home({ 
  posts = [], 
  categories = [], 
  searchQuery = "", 
  selectedCategory = "",
  pagination
}) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);

  const handlePageChange = (newPage) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page: newPage
      }
    });
  };

  return (
    <Layout categories={categories}>
      <Box sx={{ 
        background: '#ffffff',
        minHeight: "100vh",
        py: 4,
        borderRadius: '16px',
      }}>
        <Container maxWidth="lg">
          {/* Latest Posts Heading */}
          <Box sx={{ mb: 6, mt: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                fontSize: { xs: '2.25rem', md: '2.75rem' },
                color: '#1e293b',
                position: 'relative',
                display: 'inline-block',
                letterSpacing: '-0.02em',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-12px',
                  left: 0,
                  width: '80px',
                  height: '4px',
                  background: '#2563eb',
                  borderRadius: '2px'
                }
              }}
            >
              Latest Posts
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '1.1rem',
                color: '#64748b',
                mt: 3,
                maxWidth: '600px'
              }}
            >
              Explore our newest articles, insights, and stories from our blog
            </Typography>
          </Box>

          {/* Posts Grid */}
          <Box sx={{ 
            display: "grid", 
            gap: 3, 
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fill, minmax(280px, 1fr))"
            },
            position: 'relative',
            mb: 4
          }}>
            {posts.map((post) => (
              <Card 
                key={post._id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)',
                    borderColor: '#e2e8f0'
                  }
                }}
              >
                {post.featuredImage && (
                  <Box sx={{
                    position: 'relative',
                    paddingTop: '56.25%' // 16:9 aspect ratio
                  }}>
                    <CardMedia
                      component="img"
                      image={post.featuredImage}
                      alt={post.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  </Box>
                )}
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: 3,
                }}>
                  {/* Post Title */}
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{
                      fontFamily: '"Libre Baskerville", serif',
                      fontWeight: 600,
                      fontSize: '1.35rem',
                      lineHeight: 1.4,
                      color: '#1e293b',
                      mb: 2,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {post.title}
                  </Typography>
                  {/* Post Excerpt */}
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      letterSpacing: '-0.01em',
                      color: '#64748b',
                      mb: 2
                    }}
                  >
                    {getExcerpt(post)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  {/* Read More Button */}
                  <Button 
                    component={Link}
                    href={`/post/${post.slug}`}
                    sx={{
                      textTransform: 'none',
                      fontFamily: '"Outfit", sans-serif',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      color: '#2563eb',
                      '&:hover': {
                        background: '#f8fafc',
                        color: '#1d4ed8',
                      },
                      borderRadius: '8px',
                      px: 2,
                    }}
                  >
                    Read More
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 1,
              mt: 4,
              pb: 4
            }}>
              <Button
                disabled={pagination.currentPage <= 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  textTransform: 'none',
                  color: '#2563eb',
                  '&:hover': {
                    background: '#f8fafc',
                  },
                  '&.Mui-disabled': {
                    color: '#94a3b8'
                  }
                }}
              >
                Previous
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={pageNum === pagination.currentPage ? "contained" : "text"}
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 500,
                    ...(pageNum === pagination.currentPage ? {
                      background: '#2563eb',
                      color: '#ffffff',
                      '&:hover': {
                        background: '#1d4ed8',
                      }
                    } : {
                      color: '#2563eb',
                      '&:hover': {
                        background: '#f8fafc',
                      }
                    })
                  }}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  textTransform: 'none',
                  color: '#2563eb',
                  '&:hover': {
                    background: '#f8fafc',
                  },
                  '&.Mui-disabled': {
                    color: '#94a3b8'
                  }
                }}
              >
                Next
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Layout>
  );
}
