import { useState } from "react";
import AuthWrapper from "../../components/AuthWrapper";
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
  Divider
} from "@mui/material";

export default function SecurityPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [removeData, setRemoveData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Handle admin removal
  const handleAdminRemove = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(removeData),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess("Admin removed successfully");
      setOpenDialog(false);
      setRemoveData({ username: "", password: "" });
    } catch (err) {
      setError(err.message || "Failed to remove admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <Box sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          {/* Password Reset Section */}
          <Paper sx={{ p: 4, mb: 4, borderRadius: '12px' }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#1e293b',
                mb: 3
              }}
            >
              Reset Admin Password
            </Typography>

            <form onSubmit={handlePasswordReset}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value
                })}
                required
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Paper>

          {/* Remove Admin Section */}
          <Paper sx={{ p: 4, borderRadius: '12px' }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontFamily: '"Libre Baskerville", serif',
                fontWeight: 700,
                color: '#dc2626',
                mb: 3
              }}
            >
              Remove Admin Access
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                mb: 3
              }}
            >
              This action will permanently remove admin access for the specified user.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenDialog(true)}
            >
              Remove Admin Access
            </Button>
          </Paper>

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Confirmation Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle sx={{ 
              fontFamily: '"Libre Baskerville", serif',
              color: '#dc2626' 
            }}>
              Remove Admin Access
            </DialogTitle>
            <DialogContent>
              <Typography paragraph sx={{ mb: 3 }}>
                Please confirm admin credentials to remove access:
              </Typography>
              <TextField
                fullWidth
                label="Username"
                value={removeData.username}
                onChange={(e) => setRemoveData({
                  ...removeData,
                  username: e.target.value
                })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={removeData.password}
                onChange={(e) => setRemoveData({
                  ...removeData,
                  password: e.target.value
                })}
                required
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenDialog(false)}
                sx={{ color: '#64748b' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAdminRemove}
                variant="contained"
                color="error"
                disabled={loading}
              >
                {loading ? "Removing..." : "Remove Admin"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </AuthWrapper>
  );
}