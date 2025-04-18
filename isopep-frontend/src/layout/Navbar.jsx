import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';


export default function Navbar() {
  const location = useLocation();

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          ForgeChain
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
          <Button component={Link} to="/kpi">KPI</Button>
<Button component={Link} to="/admin">Admin</Button>
<Button color="inherit" component={Link} to="/audit">
  Audit Logs
</Button>

          <Button
            color="inherit"
            component={Link}
            to="/agreements"
            variant={location.pathname === '/agreements' ? 'outlined' : 'text'}
          >
            Agreements
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
