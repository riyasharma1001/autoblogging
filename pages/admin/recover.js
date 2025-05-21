import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";

export default function RecoverPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    phrases: ["", "", "", "", "", "", ""], // Changed from 5 to 7 empty strings
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          recoveryPhrases: formData.phrases,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h4" gutterBottom sx={{
            fontFamily: '"Libre Baskerville", serif',
            fontWeight: 700,
            color: '#1e293b',
            mb: 4,
            textAlign: 'center'
          }}>
            Password Recovery
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Username</StepLabel>
            </Step>
            <Step>
              <StepLabel>Recovery Phrases</StepLabel>
            </Step>
            <Step>
              <StepLabel>New Password</StepLabel>
            </Step>
          </Stepper>

          <form onSubmit={activeStep === 2 ? handleSubmit : undefined}>
            {activeStep === 0 && (
              <Box>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({
                    ...formData,
                    username: e.target.value
                  })}
                  required
                  margin="normal"
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Enter your recovery phrases in the exact order they were provided:
                </Typography>
                {formData.phrases.map((phrase, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    label={`Recovery Phrase ${index + 1}`}
                    value={phrase}
                    onChange={(e) => {
                      const newPhrases = [...formData.phrases];
                      newPhrases[index] = e.target.value;
                      setFormData({ ...formData, phrases: newPhrases });
                    }}
                    required
                    margin="normal"
                  />
                ))}
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({
                    ...formData,
                    newPassword: e.target.value
                  })}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({
                    ...formData,
                    confirmPassword: e.target.value
                  })}
                  required
                  margin="normal"
                />
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              {activeStep > 0 && (
                <Button
                  onClick={() => setActiveStep(prev => prev - 1)}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              
              {activeStep < 2 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(prev => prev + 1)}
                  disabled={
                    (activeStep === 0 && !formData.username) ||
                    (activeStep === 1 && formData.phrases.some(p => !p))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
              )}
            </Box>
          </form>

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
    </Box>
  );
}