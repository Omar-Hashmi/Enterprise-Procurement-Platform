import React from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getNotificationIcon = (type) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('approval')) {
    return { icon: <RateReviewOutlinedIcon fontSize="small" />, bgcolor: '#e0f2fe', color: '#0284c7' };
  }
  if (t.includes('purchase_order') || t.includes('po')) {
    return { icon: <ShoppingBagOutlinedIcon fontSize="small" />, bgcolor: '#fef3c7', color: '#d97706' };
  }
  if (t.includes('vendor')) {
    return { icon: <StorefrontOutlinedIcon fontSize="small" />, bgcolor: '#dcfce7', color: '#16a34a' };
  }
  if (t.includes('request')) {
    return { icon: <AssignmentOutlinedIcon fontSize="small" />, bgcolor: '#ede9fe', color: '#7c3aed' };
  }
  return { icon: <NotificationsNoneOutlinedIcon fontSize="small" />, bgcolor: '#f1f5f9', color: '#475569' };
};

export const NotificationPopover = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const clearAll = useNotificationStore((state) => state.clearAll);

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    onClose();

    // Contextual Entity Routing
    const entityType = notif.relatedEntityType?.toLowerCase() || notif.type?.toLowerCase() || '';
    const entityId = notif.relatedEntity;

    if (entityType.includes('purchaserequest') || entityType.includes('request')) {
      if (entityId) navigate(`/purchase-requests/${entityId}`);
      else navigate('/purchase-requests');
    } else if (entityType.includes('approval')) {
      if (entityId) navigate(`/purchase-requests/${entityId}`);
      else navigate('/approvals');
    } else if (entityType.includes('purchaseorder') || entityType.includes('purchase_order')) {
      if (entityId) navigate(`/purchase-orders/${entityId}`);
      else navigate('/purchase-orders');
    } else if (entityType.includes('vendor')) {
      if (entityId) navigate(`/vendors/${entityId}`);
      else navigate('/vendors');
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100vw - 32px)', sm: 380 },
          maxWidth: 380,
          maxHeight: 520,
          borderRadius: 2,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={markAllAsRead} color="primary">
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Notifications List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 380 }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
                color: 'text.secondary',
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              No notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time updates regarding your approvals, purchase orders, and requisitions will appear here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif) => {
              const iconMeta = getNotificationIcon(notif.type);
              const isUnread = !notif.isRead;

              return (
                <ListItem
                  key={notif.id}
                  alignItems="flex-start"
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #f1f5f9',
                    bgcolor: isUnread ? '#f0f9ff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: isUnread ? '#e0f2fe' : '#f8fafc',
                    },
                  }}
                  secondaryAction={
                    <Tooltip title="Dismiss">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        sx={{ color: 'text.secondary', opacity: 0.7, '&:hover': { opacity: 1 } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  onClick={() => handleNotificationClick(notif)}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: iconMeta.bgcolor,
                        color: iconMeta.color,
                      }}
                    >
                      {iconMeta.icon}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isUnread ? 700 : 500,
                            color: 'text.primary',
                            lineHeight: 1.3,
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {isUnread && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.25, pr: 2 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem', mt: 0.5, display: 'block' }}>
                          {formatRelativeTime(notif.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              color="inherit"
              onClick={clearAll}
              sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' }}
            >
              Clear all notifications
            </Button>
          </Box>
        </>
      )}
    </Popover>
  );
};

export default NotificationPopover;
