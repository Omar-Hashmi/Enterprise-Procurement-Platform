import { create } from 'zustand';

const NOTIFICATIONS_STORAGE_KEY = 'epp_notifications_state';

const loadPersistedNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return { notifications: [], unreadCount: 0 };
    const parsed = JSON.parse(raw);
    const notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
};

const savePersistedNotifications = (notifications) => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify({ notifications: notifications.slice(0, 50) })
    );
  } catch {
    // Ignore storage quota or serialization issues
  }
};

const initialState = loadPersistedNotifications();

export const useNotificationStore = create((set, get) => ({
  notifications: initialState.notifications,
  unreadCount: initialState.unreadCount,
  latestToast: null,

  addNotification: (notification) => {
    if (!notification) return;

    const id = notification.id || notification._id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const normalized = {
      id,
      title: notification.title || 'System Notification',
      message: notification.message || '',
      type: notification.type || 'general',
      relatedEntity: notification.relatedEntity || notification.entityId || null,
      relatedEntityType: notification.relatedEntityType || null,
      timestamp: notification.timestamp || new Date().toISOString(),
      isRead: false,
    };

    set((state) => {
      // Prevent exact duplicate notifications within recent 10 items
      const isDuplicate = state.notifications
        .slice(0, 10)
        .some(
          (n) =>
            n.id === normalized.id ||
            (n.title === normalized.title &&
              n.message === normalized.message &&
              Math.abs(new Date(n.timestamp).getTime() - new Date(normalized.timestamp).getTime()) < 3000)
        );

      if (isDuplicate) {
        return state;
      }

      const updated = [normalized, ...state.notifications].slice(0, 50);
      const unreadCount = updated.filter((n) => !n.isRead).length;
      savePersistedNotifications(updated);

      return {
        notifications: updated,
        unreadCount,
        latestToast: normalized,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = updated.filter((n) => !n.isRead).length;
      savePersistedNotifications(updated);
      return { notifications: updated, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      savePersistedNotifications(updated);
      return { notifications: updated, unreadCount: 0 };
    });
  },

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      const unreadCount = updated.filter((n) => !n.isRead).length;
      savePersistedNotifications(updated);
      return { notifications: updated, unreadCount };
    });
  },

  clearAll: () => {
    savePersistedNotifications([]);
    set({ notifications: [], unreadCount: 0, latestToast: null });
  },

  dismissToast: () => {
    set({ latestToast: null });
  },
}));

export default useNotificationStore;
