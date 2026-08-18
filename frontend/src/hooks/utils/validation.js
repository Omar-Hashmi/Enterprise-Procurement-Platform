export function required(value) {
  return value != null && String(value).trim() !== ''
}

export function isEmail(value) {
  return /\S+@\S+\.\S+/.test(value)
}

export default { required, isEmail }
