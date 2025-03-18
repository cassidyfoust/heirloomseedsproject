import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";

const About: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          About Heirloom Seeds Project
        </Typography>

        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h2" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            The Heirloom Seeds Project is dedicated to preserving biodiversity
            and connecting gardeners who share a passion for heirloom varieties.
            We believe in the importance of maintaining genetic diversity in our
            food supply and preserving the rich heritage of traditional seed
            varieties.
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h2" gutterBottom>
            What We Do
          </Typography>
          <Typography paragraph>
            We provide a platform for seed savers to:
          </Typography>
          <ul>
            <li>Share and exchange heirloom seeds</li>
            <li>Document and preserve seed varieties</li>
            <li>Connect with other gardeners and seed savers</li>
            <li>Learn about traditional growing methods</li>
          </ul>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h2" gutterBottom>
            Get Involved
          </Typography>
          <Typography paragraph>
            Whether you're an experienced seed saver or just starting your
            journey, there's a place for you in our community. Join us in
            preserving these precious genetic resources for future generations.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;
