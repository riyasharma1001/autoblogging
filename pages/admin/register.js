// pages/admin/register.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningIcon from '@mui/icons-material/Warning';

export default function RegisterPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    verificationUsername: "",
    verificationPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [recoveryPhrases, setRecoveryPhrases] = useState([]);

  // Check if any admin exists when component mounts
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/check-admin");
        const data = await res.json();
        
        if (!data.hasAdmin) {
          setIsVerified(true); // Skip verification if no admin exists
          setAdminExists(false);
        }
        
      } catch (err) {
        console.error("Error checking admin:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  // Handle verification step
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.verificationUsername,
          password: formData.verificationPassword
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setIsVerified(true);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        username: formData.username,
        password: formData.password,
      };

      // Only include verification credentials if admin exists
      if (adminExists) {
        registrationData.verificationCreds = {
          username: formData.verificationUsername,
          password: formData.verificationPassword
        };
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setRecoveryPhrases(data.recoveryPhrases);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="sm">
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: '12px' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{
              fontFamily: '"Libre Baskerville", serif',
              fontWeight: 700,
              color: '#1e293b',
              textAlign: 'center',
              mb: 4
            }}
          >
            {!adminExists ? "Register First Admin" : 
             isVerified ? "Register New Admin" : "Verify Existing Admin"}
          </Typography>

          {(!isVerified && adminExists) ? (
            // Verification Form
            <Box component="form" onSubmit={handleVerify}>
              <TextField
                fullWidth
                label="Admin Username"
                margin="normal"
                value={formData.verificationUsername}
                onChange={(e) => setFormData({
                  ...formData,
                  verificationUsername: e.target.value
                })}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Admin Password"
                margin="normal"
                value={formData.verificationPassword}
                onChange={(e) => setFormData({
                  ...formData,
                  verificationPassword: e.target.value
                })}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Admin"}
              </Button>
            </Box>
          ) : (
            // Registration Form
            <Box component="form" onSubmit={handleRegister}>
              {!adminExists && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  You are registering the first admin account for this system.
                </Alert>
              )}
              <TextField
                fullWidth
                label="New Admin Username"
                margin="normal"
                value={formData.username}
                onChange={(e) => setFormData({
                  ...formData,
                  username: e.target.value
                })}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="New Admin Password"
                margin="normal"
                value={formData.password}
                onChange={(e) => setFormData({
                  ...formData,
                  password: e.target.value
                })}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                margin="normal"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({
                  ...formData,
                  confirmPassword: e.target.value
                })}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register Admin"}
              </Button>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Recovery Phrases Dialog remains unchanged */}
        <Dialog 
          open={showSuccess} 
          maxWidth="sm" 
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle sx={{
            bgcolor: '#f8fafc',
            fontFamily: '"Libre Baskerville", serif',
            fontWeight: 700,
            color: '#1e293b'
          }}>
            Registration Successful - Save Your Recovery Phrases
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#f8fafc' }}>
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ mb: 3 }}
            >
              IMPORTANT: These 7 recovery phrases are your only way to reset your password if you forget it. 
              Save them in a secure location!
            </Alert>
            
            <List sx={{ mb: 3 }}>
              {recoveryPhrases.map((phrase, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <KeyIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${index + 1}. ${phrase}`}
                    primaryTypographyProps={{
                      fontFamily: 'monospace',
                      fontSize: '1.1rem'
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyPhrases}
              fullWidth
              sx={{ mb: 2 }}
            >
              Copy Phrases to Clipboard
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/admin/login")}
              fullWidth
            >
              I've Saved the Phrases - Continue to Login
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
