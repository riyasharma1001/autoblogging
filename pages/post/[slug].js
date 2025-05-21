import { connectToDatabase } from '../../utils/db';
import Post from '../../models/Post';
import Category from '../../models/Category';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { 
  Container, 
  Typography, 
  Box, 
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
  Grid 
} from '@mui/material';
import Link from 'next/link';
import { formatDate } from '../../utils/helpers';

// First modify getServerSideProps to fetch categories
export async function getServerSideProps({ params }) {
  await connectToDatabase();
  
  try {
    const post = await Post.findOne({ slug: params.slug }).lean();
    
    if (!post) {
      return {
        notFound: true
      };
    }

    // Fetch all categories
    const categories = await Category.find({}).lean();

    // Convert _id to string and dates to ISO strings
    const serializedPost = {
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };

    // Fetch related posts
    const relatedPosts = await Post.find({
      category: post.category,
      _id: { $ne: post._id }
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    return {
      props: {
        post: serializedPost,
        relatedPosts: JSON.parse(JSON.stringify(relatedPosts)),
        categories: JSON.parse(JSON.stringify(categories)) // Add categories to props
      }
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true
    };
  }
}

// Then update the component to receive and pass categories prop
export default function PostPage({ post, relatedPosts, categories }) {
  if (!post) return <div>Loading...</div>;

  const renderContent = () => {
    // If content is a string (regular HTML)
    if (typeof post.content === 'string') {
      return (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      );
    }
    
    // If content is Editor.js format
    if (post.content && post.content.blocks) {
      return post.content.blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <Typography key={index} paragraph>
                {block.data.text}
              </Typography>
            );
          case 'header':
            return (
              <Typography 
                key={index} 
                variant={`h${block.data.level}`} 
                component={`h${block.data.level}`}
                gutterBottom
              >
                {block.data.text}
              </Typography>
            );
          case 'image':
            return (
              <Box key={index} sx={{ my: 2 }}>
                <img 
                  src={block.data.url} 
                  alt={block.data.caption} 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                {block.data.caption && (
                  <Typography variant="caption" display="block" align="center">
                    {block.data.caption}
                  </Typography>
                )}
              </Box>
            );
          default:
            return null;
        }
      });
    }

    return <Typography>No content available</Typography>;
  };

  return (
    <Layout categories={categories}> {/* Pass categories to Layout */}
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Head>
      <Container maxWidth="lg">
        {/* Main Blog Post */}
        <Box sx={{ 
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          mb: 6
        }}>
          {/* Featured Image */}
          {post.featuredImage && (
            <Box sx={{
              position: 'relative',
              width: '100%',
              minHeight: { xs: '250px', sm: '400px', md: '500px' },
              overflow: 'hidden',
              borderRadius: '16px 16px 0 0',
            }}>
              <img
                src={post.featuredImage}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain', // Changed from 'cover' to 'contain'
                  objectPosition: 'center',
                  backgroundColor: '#f8fafc' // Light background for images with transparency
                }}
              />
            </Box>
          )}

          {/* Post Content */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            {/* Category Tag */}
            <Typography
              component="span"
              sx={{
                color: '#2563eb',
                background: '#f8fafc',
                px: 2,
                py: 0.5,
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontFamily: '"Outfit", sans-serif',
                mb: 3,
                display: 'inline-block'
              }}
            >
              {post.category}
            </Typography>

            {/* Title */}
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                color: '#1e293b',
                mb: 3,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              {post.title}
            </Typography>

            {/* Meta Info */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 4,
              color: '#64748b',
              fontFamily: '"Outfit", sans-serif',
              fontSize: '0.95rem'
            }}>
              <Typography>{formatDate(post.createdAt)}</Typography>
              <Typography>·</Typography>
              <Typography>{post.readTime} min read</Typography>
            </Box>

            {/* Content */}
            <Box
              sx={{
                '& p': {
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  color: '#334155',
                  mb: 3
                },
                '& h2': {
                  fontFamily: '"Libre Baskerville", serif',
                  fontWeight: 600,
                  fontSize: '1.75rem',
                  color: '#1e293b',
                  mt: 5,
                  mb: 3
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  my: 4
                }
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Box>
        </Box>

        {/* Comments Section */}
        {/* Add your comments component here */}

        {/* Related Posts */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Libre Baskerville", serif',
              fontWeight: 600,
              fontSize: '1.75rem',
              color: '#1e293b',
              mb: 4
            }}
          >
            More from {post.category}
          </Typography>

          <Grid container spacing={3}>
            {relatedPosts.map((relatedPost) => (
              <Grid item xs={12} sm={6} md={4} key={relatedPost._id}>
                <Card sx={{
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
                }}>
                  {relatedPost.featuredImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      sx={{
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0',
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Libre Baskerville", serif',
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        lineHeight: 1.4,
                        color: '#1e293b',
                        mb: 2
                      }}
                    >
                      {relatedPost.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        color: '#64748b',
                      }}
                    >
                      {relatedPost.excerpt}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      component={Link}
                      href={`/post/${relatedPost.slug}`}
                      sx={{
                        textTransform: 'none',
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 500,
                        fontSize: '0.95rem',
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
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}