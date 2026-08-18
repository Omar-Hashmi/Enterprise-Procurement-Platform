export default function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleDateString()
}
