// components/Footer.js
import { Box, Typography, Link as MuiLink, Container, Grid, Divider } from "@mui/material";
import NextLink from "next/link";

export default function Footer() {
  // Quick Links section with correct URLs
  const quickLinks = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' }
  ];

  // Legal Links section with correct URLs
  const legalLinks = [
    { name: 'Privacy Policy', url: '/privacy-policy' },
    { name: 'Terms & Conditions', url: '/terms-and-conditions' },
    { name: 'Disclaimer', url: '/disclaimer' },
    { name: 'DMCA', url: '/dmca' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: '#FFFFFF',
        color: '#1e293b',
        py: 8,
        mt: 'auto',
        position: 'relative',
        borderTop: '1px solid #f1f5f9'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b',
                mb: 2,
                fontSize: '1.75rem',
                letterSpacing: '-0.02em'
              }}
            >
              My CMS
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: '"Outfit", sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                letterSpacing: '-0.01em',
                color: '#64748b'
              }}
            >
              A modern content management system built with Next.js and Material UI.
              Creating digital experiences that inspire and engage.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 600,
                mb: 3,
                color: '#1e293b',
                fontSize: '1.25rem',
                letterSpacing: '-0.01em'
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map((link) => (
                <NextLink
                  key={link.name}
                  href={link.url}
                  passHref
                  legacyBehavior
                >
                  <MuiLink
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      color: '#64748b',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: '#2563eb',
                        transform: 'translateX(5px)',
                      },
                      display: 'inline-block'
                    }}
                  >
                    {link.name}
                  </MuiLink>
                </NextLink>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 600,
                mb: 3,
                color: '#1e293b',
                fontSize: '1.25rem',
                letterSpacing: '-0.01em'
              }}
            >
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {legalLinks.map((link) => (
                <NextLink
                  key={link.name}
                  href={link.url}
                  passHref
                  legacyBehavior
                >
                  <MuiLink
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      color: '#64748b',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: '#2563eb',
                        transform: 'translateX(5px)',
                      },
                      display: 'inline-block'
                    }}
                  >
                    {link.name}
                  </MuiLink>
                </NextLink>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider 
          sx={{ 
            my: 6,
            borderColor: '#f1f5f9',
            width: '100%',
            maxWidth: '200px',
            mx: 'auto'
          }} 
        />

        <Typography
          variant="body2"
          align="center"
          sx={{
            color: '#94a3b8',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '0.875rem'
          }}
        >
          © {new Date().getFullYear()} My CMS. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
