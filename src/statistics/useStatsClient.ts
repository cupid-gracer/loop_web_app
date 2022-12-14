import { useMemo } from "react"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { useNetwork } from "../hooks"
import { DefaultApolloClientOptions } from "../layouts/Network"

export const useStatsClient = () => {
  const { stats: uri } = useNetwork()
  return  useMemo(
      () =>
          new ApolloClient({
            uri,
            cache: new InMemoryCache(),
            connectToDevTools: true,
            defaultOptions: DefaultApolloClientOptions,
          }),
      [uri]
  )
}

export default useStatsClient
