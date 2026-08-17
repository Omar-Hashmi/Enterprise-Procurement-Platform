export const PURCHASE_REQUEST_STATUS = {
  PENDING: 'Pending',
  DEPARTMENT_APPROVED: 'Department Approved',
  FINANCE_APPROVED: 'Finance Approved',
  PROCUREMENT_APPROVED: 'Procurement Approved',
  CEO_APPROVED: 'CEO Approved',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const PURCHASE_ORDER_STATUS = {
  ISSUED: 'Issued',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const APPROVAL_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  DEPARTMENT_MANAGER: 'department_manager',
  FINANCE_MANAGER: 'finance_manager',
  FINANCE_OFFICER: 'finance_officer',
  PROCUREMENT_MANAGER: 'procurement_manager',
  PROCUREMENT_OFFICER: 'procurement_officer',
  WAREHOUSE_STAFF: 'warehouse_staff',
  CEO: 'ceo',
  VENDOR: 'vendor',
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
    case 'Department Approved':
    case 'Finance Approved':
    case 'Procurement Approved':
    case 'CEO Approved':
    case 'Delivered':
    case 'Completed':
      return 'success';
    case 'Pending':
    case 'Issued':
    case 'In Progress':
      return 'warning';
    case 'Rejected':
      return 'error';
    case 'Cancelled':
      return 'default';
    default:
      return 'primary';
  }
};
