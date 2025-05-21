// components/Layout.js
import { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  TextField,
  Container,
  Menu,
  MenuItem,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  Slide,
  ClickAwayListener
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Footer from "./Footer";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Layout({ children, categories = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?query=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Modify categories split based on viewport
  const displayCategories = isMobile ? categories : categories.slice(0, 5);
  const moreCategories = isMobile ? [] : categories.slice(5);

  return (
    <Box>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: '#ffffff',
          borderBottom: '1px solid',
          borderColor: '#f1f5f9',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Main Toolbar */}
        <Container maxWidth="xl">
          <Toolbar sx={{ 
            justifyContent: 'space-between', 
            py: 2,
            gap: 2,
            flexWrap: 'nowrap'
          }}>
            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              href="/"
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b',
                textDecoration: 'none',
                fontSize: { xs: '1.5rem', sm: '1.875rem' },
                letterSpacing: '-0.02em',
                '&:hover': {
                  color: '#0f172a',
                }
              }}
            >
              My CMS
            </Typography>

            {/* Desktop Categories and Search with reduced gap */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1, // Reduced gap
                ml: 'auto',
                mr: 2, // Add right margin
                position: 'relative',
                transition: 'transform 0.3s ease',
                transform: isSearchOpen ? 'translateX(-260px)' : 'translateX(0)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  alignItems: 'center',
                }}>
                  {displayCategories.map((cat) => (
                    <Button
                      key={cat._id}
                      component={Link}
                      href={`/?category=${encodeURIComponent(cat.name)}`}
                      sx={{
                        color: router.query.category === cat.name ? '#2563eb' : '#64748b',
                        background: router.query.category === cat.name ? '#f8fafc' : 'transparent',
                        '&:hover': {
                          background: '#f8fafc',
                          color: '#2563eb',
                        },
                        textTransform: 'none',
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: router.query.category === cat.name ? 600 : 500,
                        fontSize: '0.95rem',
                        letterSpacing: '-0.01em',
                        transition: 'all 0.2s ease-in-out',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        border: '1px solid',
                        borderColor: router.query.category === cat.name ? '#e2e8f0' : 'transparent'
                      }}
                    >
                      {cat.name}
                    </Button>
                  ))}

                  {/* More Categories Menu */}
                  {moreCategories.length > 0 && (
                    <>
                      <Button
                        onClick={handleMenuClick}
                        endIcon={<KeyboardArrowDownIcon />}
                        sx={{
                          color: '#64748b',
                          '&:hover': {
                            background: '#f8fafc',
                            color: '#2563eb',
                          },
                          textTransform: 'none',
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontSize: '0.95rem',
                          borderRadius: '8px',
                          px: 2
                        }}
                      >
                        More
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                          elevation: 2,
                          sx: {
                            mt: 1.5,
                            background: '#ffffff',
                            borderRadius: 2,
                            border: '1px solid #f1f5f9',
                            minWidth: 180,
                          }
                        }}
                      >
                        {moreCategories.map((cat) => (
                          <MenuItem 
                            key={cat._id}
                            component={Link}
                            href={`/?category=${encodeURIComponent(cat.name)}`}
                            sx={{
                              color: '#64748b',
                              '&:hover': {
                                background: '#f8fafc',
                                color: '#2563eb',
                              }
                            }}
                          >
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* Search Icon - Always Visible */}
            <Box sx={{ 
              position: 'relative',
              ml: isMobile ? 'auto' : 0, // Adjust margin based on viewport
            }}>
              <IconButton
                onClick={() => setIsSearchOpen(true)}
                sx={{
                  color: '#64748b',
                  '&:hover': {
                    color: '#2563eb',
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>

            {/* Search Bar Overlay */}
            {isSearchOpen && (
              <ClickAwayListener onClickAway={() => setIsSearchOpen(false)}>
                <Box
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    position: 'absolute',
                    right: { xs: '16px', sm: '24px' },
                    left: { xs: '16px', sm: 'auto' },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: { xs: 'calc(100% - 32px)', sm: '250px' },
                    zIndex: 10,
                  }}
                >
                  <TextField
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        color: '#334155',
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '0.95rem',
                        letterSpacing: '-0.01em',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                        },
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                          '& fieldset': {
                            borderColor: '#94a3b8',
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
                          '& fieldset': {
                            borderColor: '#2563eb',
                          }
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </ClickAwayListener>
            )}
          </Toolbar>
        </Container>

        {/* Modified Mobile Categories Bar */}
        {isMobile && (
          <Box 
            sx={{ 
              borderTop: '1px solid',
              borderColor: '#f1f5f9',
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              px: 2,
              py: 1.5,
              backgroundColor: '#ffffff',
              '&::-webkit-scrollbar': {
                display: 'none' // Hide scrollbar for cleaner look
              },
              msOverflowStyle: 'none', // IE and Edge
              scrollbarWidth: 'none', // Firefox
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                gap: 2,
                width: 'max-content',
              }}
            >
              {categories.map((cat) => ( // Using all categories
                <Button
                  key={cat._id}
                  component={Link}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                  sx={{
                    color: router.query.category === cat.name ? '#2563eb' : '#64748b',
                    background: router.query.category === cat.name ? '#f8fafc' : 'transparent',
                    '&:hover': {
                      background: '#f8fafc',
                      color: '#2563eb',
                    },
                    textTransform: 'none',
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: router.query.category === cat.name ? 600 : 500,
                    fontSize: '0.875rem',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    px: 2,
                    py: 0.75,
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </AppBar>

      {/* Header Separator - Darker shade */}
      <Divider 
        sx={{ 
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          my: 3,
          borderColor: '#cbd5e1', // Darker shade
          '&::before, &::after': {
            borderColor: '#cbd5e1',
          }
        }}
      />

      {/* Main Content */}
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1,
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 4 },
          my: { xs: 2, sm: 3, md: 4 },
          mx: 'auto',
          maxWidth: { sm: 'calc(100% - 32px)', md: 'calc(100% - 48px)' },
          background: '#ffffff',
          borderRadius: '17px',
          
          position: 'relative'
        }}
      >
        {children}
      </Container>

      {/* Footer Separator - Darker shade */}
      <Divider 
        sx={{ 
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          my: 3,
          borderColor: '#cbd5e1', // Darker shade
          '&::before, &::after': {
            borderColor: '#cbd5e1',
          }
        }}
      />

      <Footer />
    </Box>
  );
}
