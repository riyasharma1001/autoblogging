// pages/dmca.js
import Layout from "../components/Layout";
import { Container, Typography } from "@mui/material";

export default function DMCA() {
  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom>
          DMCA
        </Typography>
        <Typography variant="body1">
          This is the DMCA page. Include your DMCA policy and instructions for copyright claims.
        </Typography>
      </Container>
    </Layout>
  );
}
