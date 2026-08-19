import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { APPROVAL_ROLES, USER_ROLES } from '../../utils/constants';

export const Sidebar = ({ mobileOpen = false, onMobileClose, drawerWidth = 260 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isAdmin = userRole === USER_ROLES.ADMIN;

  const canAccessApprovals = [
    USER_ROLES.DEPARTMENT,
    USER_ROLES.DEPARTMENT_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.CEO,
    USER_ROLES.ADMIN,
  ].includes(userRole);

  const canAccessPO = [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.CEO,
  ].includes(userRole);

  const canAccessVendors = [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.DEPARTMENT,
    USER_ROLES.DEPARTMENT_MANAGER,
    USER_ROLES.CEO,
  ].includes(userRole);

  const canAccessContracts = [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.CEO,
  ].includes(userRole);

  const canAccessInventory = [
    USER_ROLES.ADMIN,
    USER_ROLES.WAREHOUSE_STAFF,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.PROCUREMENT_OFFICER,
  ].includes(userRole);

  const canAccessBudgets = [
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.FINANCE_OFFICER,
    USER_ROLES.DEPARTMENT,
    USER_ROLES.DEPARTMENT_MANAGER,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.CEO,
  ].includes(userRole);

  const canAccessAnalytics = [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.CEO,
    USER_ROLES.PROCUREMENT_OFFICER,
  ].includes(userRole);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardOutlinedIcon />,
    },
    {
      label: 'Purchase Requests',
      path: '/purchase-requests',
      icon: <AssignmentOutlinedIcon />,
    },
    ...(canAccessApprovals
      ? [
          {
            label: 'Approvals Queue',
            path: '/approvals',
            icon: <RateReviewOutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessPO
      ? [
          {
            label: 'Purchase Orders',
            path: '/purchase-orders',
            icon: <ShoppingBagOutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessVendors
      ? [
          {
            label: 'Vendors',
            path: '/vendors',
            icon: <StorefrontOutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessAnalytics
      ? [
          {
            label: 'Analytics',
            path: '/analytics',
            icon: <BarChartOutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessContracts
      ? [
          {
            label: 'Contracts',
            path: '/contracts',
            icon: <DescriptionOutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessInventory
      ? [
          {
            label: 'Inventory',
            path: '/inventory',
            icon: <Inventory2OutlinedIcon />,
          },
        ]
      : []),
    ...(canAccessBudgets
      ? [
          {
            label: 'Budgets',
            path: '/budgets',
            icon: <AccountBalanceOutlinedIcon />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: 'Audit Logs',
            path: '/audit-logs',
            icon: <HistoryOutlinedIcon />,
          },
        ]
      : []),
    {
      label: 'Profile & Security',
      path: '/profile',
      icon: <PersonOutlineIcon />,
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'text.primary', overflow: 'hidden' }}>
      {/* Brand Header */}
      <Box
        sx={{
          minHeight: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(14,165,233,.18), transparent 60%)'
            : 'linear-gradient(135deg, rgba(14,165,233,.12), transparent 60%)',
        }}
      >
        <BusinessCenterIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, color: 'text.primary' }}>
            ProcureFlow
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Enterprise Platform
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, p: 1.5, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.25,
            mb: 1,
            display: 'block',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Main Navigation
        </Typography>

        <List disablePadding>
          {navigationItems.map((item) => {
            const isSelected =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5, position: 'relative' }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 3,
                    px: 1.5,
                    py: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 280ms cubic-bezier(.2,.8,.2,1), background-color 280ms ease, color 220ms ease, box-shadow 280ms ease',
                    '&::before': {
                      content: '""', position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
                      borderRadius: '0 4px 4px 0', backgroundColor: 'primary.main',
                      transform: isSelected ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'center', transition: 'transform 280ms cubic-bezier(.2,.8,.2,1)',
                    },
                    '&:hover': { backgroundColor: 'action.hover', transform: 'translateX(5px)' },
                    '&.Mui-selected': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(14,165,233,.19)' : 'rgba(14,165,233,.13)',
                      color: 'primary.main',
                      transform: 'translateX(5px)',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Info */}
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Foundation v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="application navigation"
    >
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRadius: '0 22px 22px 0' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            left: 16,
            top: 16,
            height: 'calc(100% - 32px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 18px 44px rgba(0,0,0,.24)' : '0 18px 44px rgba(15,23,42,.07)',
            overflow: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
