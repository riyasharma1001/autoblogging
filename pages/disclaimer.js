// pages/disclaimer.js
import Layout from "../components/Layout";
import { Container, Typography } from "@mui/material";

export default function Disclaimer() {
  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Disclaimer
        </Typography>
        <Typography variant="body1">
          This is the Disclaimer page. Provide legal disclaimers and limitations of liability.
        </Typography>
      </Container>
    </Layout>
  );
}
