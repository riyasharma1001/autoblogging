// pages/terms.js
import Layout from "../components/Layout";
import { Container, Typography } from "@mui/material";

export default function Terms() {
  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          Terms &amp; Conditions
        </Typography>
        <Typography variant="body1">
          This is the Terms &amp; Conditions page. Outline the rules and guidelines for using your site.
        </Typography>
      </Container>
    </Layout>
  );
}
