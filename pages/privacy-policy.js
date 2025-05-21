// pages/privacy.js
import Layout from "../components/Layout";
import { Container, Typography } from "@mui/material";

export default function Privacy() {
  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1">
          This is the Privacy Policy page. Detail how user data is collected, used, and protected.
        </Typography>
      </Container>
    </Layout>
  );
}
