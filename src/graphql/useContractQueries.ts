import { Dictionary } from "ramda"
import { useQuery, useLazyQuery } from "@apollo/client"
import alias from "./alias"
import { parseResults } from "./response"
import {useProtocol} from "../data/contract/protocol";

type GenerateVariables = (item: ListedItem) => ContractVariables | undefined

export const useLazyContractQueries = <Parsed>(generate: GenerateVariables) => {
  const query = useGenerateQuery(generate)
  const [load, result] = useLazyQuery<Dictionary<ContractData>>(query)
  return { result: { load, ...result }, parsed: parse<Parsed>(result) }
}

export default <Parsed>(generate: GenerateVariables) => {
  const query = useGenerateQuery(generate)
  const result = useQuery<Dictionary<ContractData>>(query)
  return { result, parsed: parse<Parsed>(result) }
}

/* helpers */
const useGenerateQuery = (generate: GenerateVariables) => {
  const { listedAll } = useProtocol()
  return alias(
    listedAll.map((item) => ({ token: item.token, ...generate(item) }))
  )
}

const parse = <Parsed>({ data }: { data?: Dictionary<ContractData> }) =>
  data && parseResults<Parsed>(data)
