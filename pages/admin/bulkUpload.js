// pages/admin/bulkUpload.js
import { useState } from "react";
import AuthWrapper from "../../components/AuthWrapper";
import Layout from "../../components/Layout";
import { Box, Container, Paper, Typography, Button } from "@mui/material";
import AdminLayout from "../../components/AdminLayout";

export default function BulkUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/bulkUpload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      setMessage(data.message || "Bulk upload successful");
    } catch (err) {
      console.error("Error uploading bulk file:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
    <AdminLayout>
        <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 4 }}>
          <Container maxWidth="md">
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                Bulk Upload Scheduled Posts
              </Typography>
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              {message && <Typography color="primary" sx={{ mb: 2 }}>{message}</Typography>}
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              <Button variant="contained" sx={{ ml: 2 }} disabled={loading} onClick={handleUpload}>
                {loading ? "Uploading..." : "Upload Excel"}
              </Button>
            </Paper>
          </Container>
        </Box>
     </AdminLayout>
    </AuthWrapper>
  );
}
