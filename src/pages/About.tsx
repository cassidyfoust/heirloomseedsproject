import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const About: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Welcome Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: "primary.light" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Thank you for visiting.
          </Typography>
          <Typography variant="body1">
            Volunteers, donations & your questions/comments are welcome
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              We want to hear from you!
            </Typography>
            <Link
              href="mailto:FreeHeirloomSeeds@gmail.com"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "primary.main",
                "&:hover": { color: "primary.dark" },
              }}
            >
              <EmailIcon />
              FreeHeirloomSeeds@gmail.com
            </Link>
          </Box>
        </Paper>

        {/* About Us Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body1" paragraph>
                Free Heirloom Seeds is a grassroots effort to empower
                individuals & communities with the resources necessary to
                provide for their basic needs, without chemicals, without
                corporations & without genetic engineering.
              </Typography>
              <Typography variant="body1" paragraph>
                Through donations we are able to offer free heirloom & open
                pollinated seeds to the general public.
              </Typography>
              <Typography variant="body1" paragraph>
                This started as a small family project & has quickly grown into
                an international effort. Currently, all our seeds our hand
                packed by our founder, Michael Reeves, his family & a few
                volunteers.
              </Typography>
              <Typography variant="body1" paragraph>
                FreeHeirloomSeeds.org is operated out of our retail store, Stone
                Spirits, In Arcata California. We are currently operated as a
                sole proprietorship until such time as our non profit is stable
                enough to stand on it's own.
              </Typography>
            </Paper>

            {/* Our Mission Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph>
                It is our hope that through our efforts more people will begin
                to save seeds:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Ensuring biodiversity on earth" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Reducing pollution by producing more goods locally & with sustainable practices" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Increasing planetary health by giving more people affordable access to fresh local foods" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Reducing the relevance & impact of biotech & corporate 'food' producers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Empowering individuals & communities to be self sufficient" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Our Seeds
              </Typography>
              <Typography variant="body1" paragraph>
                Our seeds are grown by us, donated by individuals & businesses,
                wildcrafted, "grown out" for us by members of our community &
                purchased from reputable seed packers & producers.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Donations
              </Typography>
              <Typography variant="body1" paragraph>
                Donations go to increase our seed stock, seed packing, packing
                materials & postage.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Contact Us
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <LocationOnIcon color="primary" />
                  <Typography variant="body1">
                    Free Heirloom Seeds c/o Stone Spirits
                    <br />
                    865#B Arcata, CA 95521
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon color="primary" />
                  <Link
                    href="mailto:FreeHeirloomSeeds@gmail.com"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      "&:hover": { color: "primary.dark" },
                    }}
                  >
                    FreeHeirloomSeeds@gmail.com
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default About;
