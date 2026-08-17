import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

export const useSocket = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const queryClient = useQueryClient();
  const listenersAttachedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      listenersAttachedRef.current = false;
      return;
    }

    const socket = connectSocket(token);
    if (!socket) return;

    // Attach real-time domain event listeners once
    const handleGenericNotification = (data) => {
      if (!data) return;
      addNotification({
        title: data.title || 'Procurement Notice',
        message: data.message || 'You have received a new update.',
        type: data.type || 'general',
        relatedEntity: data.relatedEntity || data.entityId,
        relatedEntityType: data.relatedEntityType,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    };

    const handleApprovalEvent = (data) => {
      if (!data) return;
      const decision = data.decision || data.details?.decision || 'Processed';
      const prId = data.purchaseRequest || data.details?.purchaseRequest;

      addNotification({
        title: `Requisition ${decision === 'Approved' ? 'Approved' : decision === 'Rejected' ? 'Rejected' : 'Approval Update'}`,
        message: data.remarks || `Requisition status updated to ${decision}.`,
        type: 'approval',
        relatedEntity: prId,
        relatedEntityType: 'PurchaseRequest',
        timestamp: data.timestamp || new Date().toISOString(),
      });

      // Synchronize React Query caches
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      if (prId) {
        queryClient.invalidateQueries({ queryKey: ['purchaseRequest', prId] });
        queryClient.invalidateQueries({ queryKey: ['purchaseRequestApprovals', prId] });
        queryClient.invalidateQueries({ queryKey: ['purchaseRequestStatus', prId] });
      }
    };

    const handlePurchaseOrderEvent = (data) => {
      if (!data) return;
      const poNumber = data.poNumber || data.details?.purchaseOrder?.poNumber || 'PO';
      const poId = data._id || data.entityId || data.details?.purchaseOrder?._id;
      const status = data.status || data.details?.after?.status || 'Issued';

      addNotification({
        title: `Purchase Order ${status.toUpperCase()}`,
        message: `Purchase Order ${poNumber} is now marked as ${status}.`,
        type: 'purchase_order',
        relatedEntity: poId,
        relatedEntityType: 'PurchaseOrder',
        timestamp: data.timestamp || new Date().toISOString(),
      });

      // Synchronize React Query caches
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      if (poId) {
        queryClient.invalidateQueries({ queryKey: ['purchaseOrder', poId] });
      }
    };

    const handleVendorEvent = (data) => {
      if (!data) return;
      const vendorName = data.companyName || 'Supplier';
      const vendorId = data._id || data.vendorId;

      addNotification({
        title: 'Vendor Status Change',
        message: `Supplier ${vendorName} status has been updated.`,
        type: 'vendor',
        relatedEntity: vendorId,
        relatedEntityType: 'Vendor',
        timestamp: data.timestamp || new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorStatusSummary'] });
      if (vendorId) {
        queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      }
    };

    socket.on('notification', handleGenericNotification);
    socket.on('approval_created', handleApprovalEvent);
    socket.on('approval_decision', handleApprovalEvent);
    socket.on('purchase_order_created', handlePurchaseOrderEvent);
    socket.on('purchase_order_updated', handlePurchaseOrderEvent);
    socket.on('purchase_order_cancelled', handlePurchaseOrderEvent);
    socket.on('vendor_status_change', handleVendorEvent);

    return () => {
      socket.off('notification', handleGenericNotification);
      socket.off('approval_created', handleApprovalEvent);
      socket.off('approval_decision', handleApprovalEvent);
      socket.off('purchase_order_created', handlePurchaseOrderEvent);
      socket.off('purchase_order_updated', handlePurchaseOrderEvent);
      socket.off('purchase_order_cancelled', handlePurchaseOrderEvent);
      socket.off('vendor_status_change', handleVendorEvent);
    };
  }, [token, isAuthenticated, addNotification, queryClient]);

  return {
    getSocket,
  };
};

export default useSocket;
