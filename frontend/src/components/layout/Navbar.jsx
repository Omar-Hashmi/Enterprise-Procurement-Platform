import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationPopover from '../notifications/NotificationPopover';

export const Navbar = ({ onMobileNavToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const isNotifOpen = Boolean(notifAnchorEl);

  const handleNotificationOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotifAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    // Stateless JWT logout: clear local state and token storage
    clearAuth();
    navigate('/login');
  };

  const displayName = user?.fullName || 'User';
  const roleDisplay = (user?.role || 'Employee').toUpperCase();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '64px', px: { xs: 2, sm: 3 } }}>
        {/* Mobile menu toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMobileNavToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand / Logo on mobile or context header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
            <BusinessCenterIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              ProcureFlow
            </Typography>
          </Box>
        </Box>

        {/* Action icons / User Profile Trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
            <IconButton
              color="inherit"
              size="medium"
              onClick={handleNotificationOpen}
              sx={{ color: unreadCount > 0 ? 'primary.main' : 'text.secondary' }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notification Popover Dropdown */}
          <NotificationPopover
            anchorEl={notifAnchorEl}
            open={isNotifOpen}
            onClose={handleNotificationClose}
          />

          {/* User Menu Trigger */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 1,
              cursor: 'pointer',
              borderRadius: 2,
              p: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, lineHeight: 1.2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {roleDisplay}
              </Typography>
            </Box>
          </Box>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 200,
                mt: 1.5,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {roleDisplay}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleNavigateProfile} sx={{ py: 1, fontSize: '0.875rem' }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              My Profile & Security
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1, color: 'error.main', fontSize: '0.875rem' }}>
              <ListItemIcon sx={{ color: 'error.main', minWidth: 32 }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
