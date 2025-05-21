// pages/contact.js
import Layout from "../components/Layout";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to an API endpoint
    console.log("Contact form submitted", { name, email, message });
    setSubmitted(true);
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Contact Us
        </Typography>
        {submitted ? (
          <Typography variant="body1">Thank you for contacting us!</Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Button variant="contained" type="submit" sx={{ mt: 2 }}>
              Send Message
            </Button>
          </Box>
        )}
      </Container>
    </Layout>
  );
}
