import { gt, multiple, number, sum } from "../../libs/math"
import { useFetchTokens } from "../../hooks"
import { useEffect, useState } from "react"
import {
  useFindPairPoolPrice,
  useGetTokenInfoQuery, useTokenMethods,
} from "../../data/contract/info"
import { SMALLEST, UUSD } from "../../constants"
import {
  adjustAmount,
  isNative,
  lookupSymbol,
} from "../../libs/parse"
import { useFindBalance } from "../../data/contract/normalize"
import { useProtocol } from "../../data/contract/protocol"
import { removeTokenWorld } from "../Dashboard/helper"

export interface DATASOURCE {
  token: string
  symbol: string
  name: string
  pair?: string
  lpToken?: string
  balance: string
  price: string
  status: string
  value: string
  change: string
}

const useMyHoldings = () => {
  const { tokensListWithuusdPairs } = useFetchTokens()
  const getTokenBalanceFn = useFindBalance()
  const getTokenInfoFn = useGetTokenInfoQuery()
  const findPairPoolFn = useFindPairPoolPrice()
  const { check8decOper } = useTokenMethods()
  const { ibcList } = useProtocol()

  // const ibc = [
  //   {
  //     token: "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B",
  //     pair: "terra1wseaux4kpjle6andsvfzj4jv0a8tgmzeteapll",
  //     lp: "terra1xudur2f8x9vedlfu2s6gygjcyvnqehk7rxh6q6",
  //   },
  //   {
  //     token: "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09",
  //     pair: "terra1a3x69h7gj72l2vt35psv64kerpsu2fuafrxhrl",
  //     lp: "terra1a52wc4q9y5fcz00d3j9plsp37jl7ncjrjylrkj",
  //   }
  // ]
  // const prices = {
  //   "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B": "9.4",
  //   "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09": "4.7",
  // }
  const dataSource: DATASOURCE[] = [...tokensListWithuusdPairs, { token: UUSD, pair: UUSD, lp: UUSD }].map((uusdItem) => {

    const { token, pair, lp } = uusdItem
    const tokenInfo = isNative(token)
      ? { name: lookupSymbol(token), symbol: lookupSymbol(token) }
      : getTokenInfoFn?.(token)
    const nonNativebal = adjustAmount(
        check8decOper(token),
        check8decOper(token),
      getTokenBalanceFn?.(token) ?? "0"
    )
    const balance = isNative(token)
      ? multiple(getTokenBalanceFn?.(token) ?? "0", SMALLEST)
      : nonNativebal ?? "0"
    const nonNativePrice = adjustAmount(
        check8decOper(token),
      !check8decOper(token),
      findPairPoolFn?.(pair, token) ?? "0"
    )
    const price = token === "uusd" ? "1" : nonNativePrice ?? "0"
    const calPrice = price
    // ibcList[tokenInfo?.symbol] ? prices[tokenInfo?.symbol] : price
    // todo update status for listed and delisted
    return {
      symbol: ibcList[tokenInfo?.symbol] ? ibcList[tokenInfo?.symbol]?.symbol : tokenInfo?.symbol ?? "",
      name: ibcList[tokenInfo?.symbol] ? removeTokenWorld(ibcList[tokenInfo?.symbol]?.name,token) : removeTokenWorld(tokenInfo?.name,token) ?? "",
      token: token,
      pair,
      lpToken: lp,
      balance: balance ?? "0",
      price: calPrice,
      status: "LISTED",
      value: multiple(calPrice ?? "0", balance ?? "0"),
      change: "0",
    }
  })
  
  const totalValue = dataSource
    ? sum(
        dataSource
          .filter((data) => (gt(data.balance, '0') && gt(data.value, '0')) && !isNaN(number(data.balance)) && !isNaN(number(data.value)))
          .map(({ value }) => {
            
            return value
          })
      )
    : "0"

  return {
    totalValue,
    dataSource: dataSource.filter((data) => gt(data.balance, '0')),
  }
}

export default useMyHoldings
