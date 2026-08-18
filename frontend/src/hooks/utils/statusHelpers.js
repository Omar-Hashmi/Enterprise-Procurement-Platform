export function statusColor(status) {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING': return 'warning'
    case 'BLACK_LISTED': return 'error'
    default: return 'default'
  }
}

export default { statusColor }
