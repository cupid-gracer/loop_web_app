import { Dispatch, SetStateAction, useState } from "react"
import createContext from "../../../hooks/createContext"

interface FarmMigrate {
  messages: any,
  transactions: any,
  step: number | string,
  store: {
    messages: Dispatch<SetStateAction<any | undefined>>,
    transactions: Dispatch<SetStateAction<any | undefined>>,
    step: Dispatch<SetStateAction<string | number | undefined>>
  }
}

const stats = createContext<FarmMigrate>("useFarmMigrate")
export const [useFarmMigrate, FarmMigrateProvider] = stats

/* state */
export const useStatsState = (): FarmMigrate => {
  const initialMessages = []
  const initialStep = 2

  const [messages, setMessage] = useState<any>(initialMessages)
  const [transactions, setTransactions] = useState<any>({})
  const [step, setStep] = useState<any>(initialStep)

  const store = {
    messages: setMessage,
    step: setStep,
    transactions: setTransactions,
  }

  return { messages, step, transactions, store }
}
