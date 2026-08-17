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

export const VENDOR_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLACKLISTED: 'blacklisted',
};

export const APPROVAL_ROLES = [
  USER_ROLES.DEPARTMENT,
  USER_ROLES.FINANCE_MANAGER,
  USER_ROLES.PROCUREMENT_MANAGER,
  USER_ROLES.CEO,
];

export const APPROVAL_ROLE_DISPLAY = {
  department: 'Department Review',
  finance_manager: 'Finance Manager',
  procurement_manager: 'Procurement Manager',
  ceo: 'Chief Executive Officer (CEO)',
};

export const ROLE_ACTIVE_PR_STATUS = {
  department: 'Pending',
  finance_manager: 'Department Approved',
  procurement_manager: 'Finance Approved',
  ceo: 'Procurement Approved',
};


export const getStatusColor = (status) => {
  switch (status?.toLowerCase?.()) {
    case 'approved':
    case 'department approved':
    case 'finance approved':
    case 'procurement approved':
    case 'ceo approved':
    case 'delivered':
    case 'completed':
    case 'active':
      return 'success';
    case 'pending':
    case 'issued':
    case 'in progress':
      return 'warning';
    case 'rejected':
    case 'blacklisted':
      return 'error';
    case 'suspended':
      return 'secondary';
    case 'cancelled':
      return 'default';
    default:
      return 'primary';
  }
};

