import { useState } from 'react'

export function useContract() {
  const [contracts, setContracts] = useState([])

  const fetchContracts = async () => {}

  return { contracts, fetchContracts }
}

export default useContract
