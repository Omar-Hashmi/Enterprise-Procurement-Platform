import React, { useState } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import NotificationToast from '../notifications/NotificationToast';

const DRAWER_WIDTH = 272;

export const AppShell = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', backgroundColor: 'background.default' }}>
      {/* Top Navbar */}
      <Navbar onMobileNavToggle={handleDrawerToggle} drawerWidth={DRAWER_WIDTH} />

      {/* Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerClose}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3, lg: 4 },
          pt: { xs: 11.5, sm: 13, lg: 13 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>

      {/* Global Real-Time Notification Toast */}
      <NotificationToast />
    </Box>
  );
};

export default AppShell;
