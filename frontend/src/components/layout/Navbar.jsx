import React, { useContext, useEffect, useState } from 'react';
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
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationPopover from '../notifications/NotificationPopover';
import { ColorModeContext } from '../../App';

export const Navbar = ({ onMobileNavToggle, drawerWidth = 260 }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [atTop, setAtTop] = useState(() => window.scrollY < 12);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      color="inherit"
      elevation={0}
      sx={{
        width: { xs: 'calc(100% - 24px)', sm: `calc(100% - ${drawerWidth + 48}px)` },
        left: { xs: 12, sm: drawerWidth + 24 },
        ml: 0,
        mt: { xs: 1.5, sm: 3 },
        borderRadius: 4,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) => atTop
          ? theme.palette.background.paper
          : theme.palette.mode === 'dark' ? 'rgba(12, 23, 40, 0.72)' : 'rgba(255, 255, 255, 0.70)',
        backdropFilter: atTop ? 'none' : 'blur(20px) saturate(165%)',
        boxShadow: atTop
          ? (theme) => theme.palette.mode === 'dark' ? '0 8px 22px rgba(0,0,0,0.2)' : '0 8px 22px rgba(15,23,42,0.07)'
          : (theme) => theme.palette.mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.28)' : '0 12px 30px rgba(15,23,42,0.1)',
        transition: 'background-color 180ms ease, backdrop-filter 180ms ease, box-shadow 180ms ease',
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

        {/* Brand / Logo on mobile */}
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
          <Tooltip title={mode === 'dark' ? 'Use light mode' : 'Use dark mode'}>
            <IconButton color="inherit" onClick={toggleColorMode} aria-label="toggle color mode" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
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
                border: '1px solid',
                borderColor: 'divider',
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
