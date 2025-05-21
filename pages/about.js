// pages/about.js
import Layout from "../components/Layout";
import { Container, Typography } from "@mui/material";

export default function About() {
  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1">
          This is the About Us page. Here you can add information about your company or blog.
        </Typography>
      </Container>
    </Layout>
  );
}
