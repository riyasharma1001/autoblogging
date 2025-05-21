import { useState } from 'react';
import AuthWrapper from '../../../components/AuthWrapper';
import AdminLayout from '../../../components/AdminLayout';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/bulkUpload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSuccess(data.message);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <AuthWrapper>
      <AdminLayout>
        <Container maxWidth="md">
          <Paper
            sx={{
              p: 4,
              my: 4,
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b',
                mb: 4,
              }}
            >
              Bulk Upload Posts
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
              Upload an Excel file with a "Title" column. Each title will be
              processed just like manual post creation - generating content and
              optimizing for SEO.
            </Alert>

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Select Excel File
                </Button>
              </label>

              {file && (
                <Typography sx={{ mb: 2 }}>
                  Selected file: {file.name}
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={loading || !file}
                sx={{ mt: 2 }}
              >
                {loading ? 'Processing...' : 'Start Upload'}
              </Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Container>
      </AdminLayout>
    </AuthWrapper>
  );
}