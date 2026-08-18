import { useState, useEffect } from 'react'

export function useBudget() {
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchBudgets = async () => {
    setIsLoading(true)
    try {
      // fetch budgets from API
      setBudgets([])
    } finally {
      setIsLoading(false)
    }
  }

  const createBudget = async (payload) => {
    // implement API call
  }

  useEffect(() => {
    // fetchBudgets()
  }, [])

  return { budgets, fetchBudgets, createBudget, isLoading }
}

export default useBudget
