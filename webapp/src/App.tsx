import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Our supercool team!!
          </Typography>
          {/* <Button color="inherit" component={RouterLink} to="/">
            Drug List
          </Button> */}
          <Button color="inherit" component={RouterLink} to="/manufacturer">
            Manufacturer
          </Button>
          <Button color="inherit" component={RouterLink} to="/insurance">
            Insurance
          </Button>
          <Button color="inherit" component={RouterLink} to="/doctor">
            Doctor
          </Button>
          <Button color="inherit" component={RouterLink} to="/about">
            About
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Outlet />
        </Box>
      </Container>
    </>
  );
}

export default App; 