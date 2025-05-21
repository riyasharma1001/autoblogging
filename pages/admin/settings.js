// pages/admin/settings.js
import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import AuthWrapper from "../../components/AuthWrapper";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert
} from "@mui/material";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "",
    siteUrl: "",
    logoUrl: "",
    authorName: "",
    organizationName: "",
    openaiKey: "",
    ga4Id: "",
    adsenseId: "",
    publyticsCode: "",
    sitemapConfig: "",
    robotsTxt: "",
    adsTxt: "",
    bingVerificationId: "", // Added new state for Bing Verification ID
    customHeadCode: "", // Added new state for Custom Head Code
  });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Function to load settings from database
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      
      // Merge received data with defaults to ensure all fields exist
      setSettings(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      console.error('Error loading settings:', err);
      setMessage({ text: 'Failed to load settings', type: 'error' });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const data = await res.json();
      setSettings(data);
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setOpen(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ 
        text: err.message || 'Failed to save settings', 
        type: 'error' 
      });
      setOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthWrapper>
      
        <Box sx={{ py: 4 }}>
          <Container maxWidth="lg">
            <Paper sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Site Settings
              </Typography>

              <form onSubmit={handleSubmit}>
                {/* Site Identity Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Site Identity
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Site Name"
                        value={settings.siteName}
                        onChange={handleChange("siteName")}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Site URL"
                        value={settings.siteUrl}
                        onChange={handleChange("siteUrl")}
                        required
                        helperText="Example: https://yourdomain.com"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Logo URL"
                        value={settings.logoUrl}
                        onChange={handleChange("logoUrl")}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Author Name"
                        value={settings.authorName}
                        onChange={handleChange("authorName")}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Organization Name"
                        value={settings.organizationName}
                        onChange={handleChange("organizationName")}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Search Engine Verification Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Search Engine Verification
                  </Typography>

                  <TextField
                    fullWidth
                    label="Bing Verification ID"
                    value={settings.bingVerificationId || ''}
                    onChange={handleChange('bingVerificationId')}
                    margin="normal"
                    helperText="Enter your Bing Webmaster Tools verification ID"
                    sx={{ mb: 2 }}
                  />
                </Box>

                {/* Analytics Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Analytics & Ads
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="OpenAI API Key"
                        value={settings.openaiKey}
                        onChange={handleChange("openaiKey")}
                        type="password"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="GA4 Measurement ID"
                        value={settings.ga4Id}
                        onChange={handleChange("ga4Id")}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="AdSense Publisher ID"
                        value={settings.adsenseId}
                        onChange={handleChange("adsenseId")}
                        placeholder="pub-xxxxxxxxxxxxxxxxx"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Integration Codes Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Integration Codes
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Publytics Code Snippet"
                    value={settings.publyticsCode}
                    onChange={handleChange("publyticsCode")}
                  />
                </Box>

                {/* SEO Configuration Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    SEO Configuration
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Sitemap Configuration"
                        value={settings.sitemapConfig}
                        onChange={handleChange("sitemapConfig")}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="robots.txt Content"
                        value={settings.robotsTxt}
                        onChange={handleChange("robotsTxt")}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="ads.txt Content"
                        value={settings.adsTxt}
                        onChange={handleChange("adsTxt")}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Custom Head Code Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Custom Head Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add custom code to the <code>&lt;head&gt;</code> section of your site. 
                    This is useful for adding custom meta tags, scripts, or tracking codes.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Custom Head Code"
                    value={settings.customHeadCode}
                    onChange={handleChange("customHeadCode")}
                    placeholder="<!-- Add your custom head code here -->"
                    sx={{
                      fontFamily: 'monospace',
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                      },
                    }}
                    helperText="Be careful with custom code as it may affect your site's functionality"
                  />
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Paper>
          </Container>
        </Box>

        <Snackbar 
          open={open} 
          autoHideDuration={6000} 
          onClose={() => setOpen(false)}
        >
          <Alert 
            onClose={() => setOpen(false)} 
            severity={message.type} 
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      
    </AuthWrapper>
  );
}
