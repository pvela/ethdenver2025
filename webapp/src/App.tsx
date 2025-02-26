import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAccount, useDisconnect } from 'wagmi';
import { connectWithSSO } from './components/connectors/SSOConnector';
import { WagmiProvider } from './components/providers/WagmiProvider';

function AppContent() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleLogin = async () => {
    try {
      await connectWithSSO();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Our supercool team!!
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/about">
            About
          </Button>
          {isConnected ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Typography>
              <Button color="inherit" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Connect Wallet
            </Button>
          )}
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

function App() {
  return (
    <WagmiProvider>
      <AppContent />
    </WagmiProvider>
  );
}

export default App; 