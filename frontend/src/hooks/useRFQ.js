import { useState } from 'react'

export function useRFQ() {
  const [rfqs, setRfqs] = useState([])

  const fetchRFQs = async () => {}

  return { rfqs, fetchRFQs }
}

export default useRFQ
