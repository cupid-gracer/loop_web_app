import { sum, div, gt, multiple, plus, number } from "../../libs/math"
import { percent } from "../../libs/num"
import { useFetchTokens } from "../../hooks"
import usePoolShare from "../../forms/usePoolShare"
import usePoolDynamic from "../../forms/Pool/usePoolDynamic"
import { SMALLEST } from "../../constants"
import { decimal, isNative, lookupSymbol } from "../../libs/parse"
import { useGetTokenInfoQuery, useTokenMethods } from "../../data/contract/info"
import {
  useFindBalance,
  usePairPool,
  useRawPairsFactory2,
} from "../../data/contract/normalize"
import { useProtocol } from "../../data/contract/protocol"
import { clearConfigCache } from "prettier"
import { useFindTokenDetails } from "../../data/form/select"
import { useRecoilValue } from "recoil"
import { unitPricesStore } from "../../data/API/common"
import { tradingListStore } from "../../data/API/dashboard"
import {
  FarmContractTYpe,
  useFindStakedByUserFarmQueryFarm2,
} from "../../data/farming/FarmV2"
import { useFindStakedByUserFarmQueryFarm4 } from "../../data/contract/migrate"
import { constants } from "zlib"

const usePairsList = () => {
  const { contractPairList } = useFetchTokens()
  const getTokenInfoFn = useGetTokenInfoQuery()
  const { ibcList } = useProtocol()

  return contractPairList.map(
    (contractPair: {
      asset_infos: {
        token?: { contract_addr: string }
        native_token?: { denom: string }
      }[]
      contract_addr: string
      liquidity_token: string
    }) => {
      const pairs = contractPair.asset_infos.map((info) => {
        if (info?.native_token !== undefined) {
          const ibc = ibcList[info.native_token.denom]

          return {
            token: info.native_token.denom ?? "",
            symbol: ibc
              ? ibc?.symbol
              : lookupSymbol(info.native_token.denom) ?? "",
          }
        } else {
          const tokenInfo = getTokenInfoFn?.(info.token?.contract_addr ?? "")
          const symbol = lookupSymbol(tokenInfo?.symbol) ?? ""

          return { token: info.token?.contract_addr ?? "", symbol }
        }
      })
      return {
        pairs,
        token: contractPair.liquidity_token,
        name: pairs.map((pair) => pair.symbol).join(" - "),
        symbol: pairs.map((pair) => pair.symbol).join(" - "),
        lpToken: contractPair.liquidity_token,
        contract_addr: contractPair.contract_addr,
        pair: contractPair.contract_addr,
        status: "LISTED",
      }
    }
  )
}

export const usePairsListV2Provides = () => {
  const { contents: contractPairList } = useRawPairsFactory2()
  const getTokenInfoFn = useGetTokenInfoQuery()
  const { ibcList } = useProtocol()

  return contractPairList?.map(
    (contractPair: {
      asset_infos: {
        token?: { contract_addr: string }
        native_token?: { denom: string }
      }[]
      contract_addr: string
      liquidity_token: string
    }) => {
      const pairs = contractPair.asset_infos.map((info) => {
        if (info?.native_token !== undefined) {
          const ibc = ibcList[info.native_token.denom]

          return {
            token: info.native_token.denom ?? "",
            symbol: ibc
              ? ibc?.symbol
              : lookupSymbol(info.native_token.denom) ?? "",
          }
        } else {
          const tokenInfo = getTokenInfoFn?.(info.token?.contract_addr ?? "")
          const symbol = lookupSymbol(tokenInfo?.symbol) ?? ""

          return { token: info.token?.contract_addr ?? "", symbol }
        }
      })
      return {
        pairs,
        token: contractPair.liquidity_token,
        name: pairs.map((pair) => pair.symbol).join(" - "),
        symbol: pairs.map((pair) => pair.symbol).join(" - "),
        lpToken: contractPair.liquidity_token,
        contract_addr: contractPair.contract_addr,
        pair: contractPair.contract_addr,
        status: "LISTED",
      }
    }
  )
}


const useMyPool = () => {
  const getTokenBalanceFn = useFindBalance()
  const tradingData = useRecoilValue(tradingListStore)

  const { contents } = usePairPool()

  const findPairPools = (token: string) => {
    return contents?.[token] ?? undefined
  }
  const list = usePairsList()

  const getPool = usePoolDynamic()
  const getPoolShare = usePoolShare()

  const { check8decOper } = useTokenMethods()

  const unitPrices = useRecoilValue(unitPricesStore)

  function calculateTVL(fromLP, token1Price, token2Price) {
    const assetAmount = check8decOper(fromLP.asset.token)
      ? div(fromLP.asset.amount, "100000000")
      : div(fromLP.asset.amount, SMALLEST)
    const uusdAmount = check8decOper(fromLP.uusd.token)
      ? div(fromLP.uusd.amount, "100000000")
      : div(fromLP.uusd.amount, SMALLEST)

    return plus(
      multiple(assetAmount, token1Price),
      multiple(uusdAmount, token2Price)
    )
  }

  const dataSource =
    list &&
    list
      .map((item) => {
        const { pairs, contract_addr, lpToken } = item
        const balance = getTokenBalanceFn?.(lpToken) ?? "0"

        const pairPoolResult = findPairPools?.(contract_addr) ?? undefined
        //@ts-ignore
        const { fromLP } = getPool({
          amount: balance ?? "0",
          token: pairs[0]?.token,
          token2: pairs[1]?.token,
          pairPoolResult: pairPoolResult,
          type: "provide",
        })
        const poolShare = getPoolShare({
          amount: div(balance ?? "0", SMALLEST),
          total: div(pairPoolResult?.total_share ?? "0", SMALLEST),
        })

        const { ratio, lessThanMinimum, minimum } = poolShare
        const prefix = lessThanMinimum ? "<" : ""
        const share = prefix + percent(lessThanMinimum ? minimum : ratio)

        const token1UnitPrice: any =
          isNative(fromLP.asset.token) && fromLP.asset.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == fromLP.asset.token
              )?.price
        const token2UnitPrice: any =
          isNative(fromLP.uusd.token) && fromLP.uusd.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == fromLP.uusd.token
              )?.price

        const liq = calculateTVL(fromLP, token1UnitPrice, token2UnitPrice)

        const wtvalue = decimal(liq, 6)

        const currentItem = tradingData.find(
          (item: any) => item.pairAddress === contract_addr
        )

        return {
          ...item,
          balance: balance ?? "0",
          withdrawable: fromLP,
          withdrawableValue: wtvalue,
          TxFee: currentItem?.TxFee,
          share,
        }
      })
      .filter((data) => gt(data.balance, "0"))

  const totalWithdrawableValue =
    dataSource && dataSource.length > 0
      ? sum(
          dataSource
            .filter(
              ({ withdrawableValue }) =>
                !isNaN(number(withdrawableValue)) && gt(withdrawableValue, "0")
            )
            .map(({ withdrawableValue }) => withdrawableValue)
        )
      : "0"

  return {
    keys: [],
    loading: false,
    dataSource,
    totalWithdrawableValue,
  }
}

export default useMyPool

export const useMyPoolV2Provides = () => {
    const getTokenBalanceFn = useFindBalance()

    const { contents } = usePairPool()
    const tradingData = useRecoilValue(tradingListStore)

    const FarmType = FarmContractTYpe

    const findStakedByUserFarmFnV2 = useFindStakedByUserFarmQueryFarm2(
        FarmType.Farm2
    )
    const findStakedByUserFarmFnV3 = useFindStakedByUserFarmQueryFarm2(
        FarmType.Farm3
    )

    const findPairPools = (token: string) => {
        return contents?.[token] ?? undefined
    }
    const list = usePairsListV2Provides()

    const getPool = usePoolDynamic()
    const getPoolShare = usePoolShare()
    const { check8decOper } = useTokenMethods()
    const unitPrices = useRecoilValue(unitPricesStore)

    function calculateTVL(fromLP, token1Price, token2Price) {
        const assetAmount = check8decOper(fromLP.asset.token)
            ? div(fromLP.asset.amount, "100000000")
            : div(fromLP.asset.amount, SMALLEST)
        const uusdAmount = check8decOper(fromLP.uusd.token)
            ? div(fromLP.uusd.amount, "100000000")
            : div(fromLP.uusd.amount, SMALLEST)

        return plus(
            multiple(assetAmount, token1Price),
            multiple(uusdAmount, token2Price)
        )
    }

    const data = list
        ? list
            ?.filter((item) => {
                //@ts-ignore
                return ["terra1k0f77x4057fexvmyrhzwhge3vxcl5kkgwck89p"].includes(
                    item?.contract_addr ?? ""
                )
            })
            .map((item) => {
                const { pairs, contract_addr, lpToken } = item
                const balance = getTokenBalanceFn?.(lpToken) ?? "0"

                const pairPoolResult = findPairPools?.(contract_addr) ?? undefined
                //@ts-ignore
                const { fromLP } = getPool({
                    amount: balance ?? "0",
                    token: pairs[0]?.token,
                    token2: pairs[1]?.token,
                    pairPoolResult: pairPoolResult,
                    type: "provide",
                })
                const poolShare = getPoolShare({
                    amount: div(balance ?? "0", SMALLEST),
                    total: div(pairPoolResult?.total_share ?? "0", SMALLEST),
                })

                const { ratio, lessThanMinimum, minimum } = poolShare
                const prefix = lessThanMinimum ? "<" : ""
                const share = prefix + percent(lessThanMinimum ? minimum : ratio)

                const token1UnitPrice: any =
                    isNative(fromLP.asset.token) && fromLP.asset.token === "uusd"
                        ? "1"
                        : unitPrices.find(
                        (item: any) => item.tokenAddress == fromLP.asset.token
                        )?.price
                const token2UnitPrice: any =
                    isNative(fromLP.uusd.token) && fromLP.uusd.token === "uusd"
                        ? "1"
                        : unitPrices.find(
                        (item: any) => item.tokenAddress == fromLP.uusd.token
                        )?.price

                const liq = calculateTVL(fromLP, token1UnitPrice, token2UnitPrice)

                const wtvalue = decimal(liq, 6)

                const currentItem = tradingData.find(
                    (item: any) => item.pairAddress === contract_addr
                )

                const stakedInFarm2 = findStakedByUserFarmFnV2(lpToken)
                const stakedInFarm3 = findStakedByUserFarmFnV3(lpToken)

                const isFarmed = gt(stakedInFarm2, "0") || gt(stakedInFarm3, "0")

                return {
                    ...item,
                    balance: balance ?? "0",
                    withdrawable: fromLP,
                    withdrawableValue: wtvalue,
                    share,
                    totalApr: currentItem?.APR,
                    TxFee: currentItem?.TxFee,
                    APY: currentItem?.APY,
                    isFarmed: isFarmed,
                }
            })
        : []

    const dataSource = data ? data.filter((data) => gt(data.balance, "0")) : []

    const totalWithdrawableValue =
        dataSource && dataSource.length > 0
            ? sum(
            dataSource
                .filter(
                    ({ withdrawableValue }) =>
                        !isNaN(number(withdrawableValue)) && gt(withdrawableValue, "0")
                )
                .map(({ withdrawableValue }) => withdrawableValue)
            )
            : "0"

    return {
        keys: [],
        loading: false,
        dataSource,
        totalWithdrawableValue,
    }
}

export const useMyPoolV2 = () => {
  const getTokenBalanceFn = useFindBalance()
  const tradingData = useRecoilValue(tradingListStore)

  const { contents } = usePairPool()

  const findPairPools = (token: string) => {
    return contents?.[token] ?? undefined
  }
  const list = useMyPoolV2Provides()

  const getPool = usePoolDynamic()
  const getPoolShare = usePoolShare()

  const { check8decOper } = useTokenMethods()

  const unitPrices = useRecoilValue(unitPricesStore)

  function calculateTVL(fromLP, token1Price, token2Price) {
    const assetAmount = check8decOper(fromLP.asset.token)
      ? div(fromLP.asset.amount, "100000000")
      : div(fromLP.asset.amount, SMALLEST)
    const uusdAmount = check8decOper(fromLP.uusd.token)
      ? div(fromLP.uusd.amount, "100000000")
      : div(fromLP.uusd.amount, SMALLEST)

    return plus(
      multiple(assetAmount, token1Price),
      multiple(uusdAmount, token2Price)
    )
  }

  const dataSource =
    list &&
    list?.dataSource?.map((item) => {
        const { pairs, contract_addr, lpToken } = item
        const balance = getTokenBalanceFn?.(lpToken) ?? "0"

        const pairPoolResult = findPairPools?.(contract_addr) ?? undefined
        //@ts-ignore
        const { fromLP } = getPool({
          amount: balance ?? "0",
          token: pairs[0]?.token,
          token2: pairs[1]?.token,
          pairPoolResult: pairPoolResult,
          type: "provide",
        })
        const poolShare = getPoolShare({
          amount: div(balance ?? "0", SMALLEST),
          total: div(pairPoolResult?.total_share ?? "0", SMALLEST),
        })

        const { ratio, lessThanMinimum, minimum } = poolShare
        const prefix = lessThanMinimum ? "<" : ""
        const share = prefix + percent(lessThanMinimum ? minimum : ratio)

        const token1UnitPrice: any =
          isNative(fromLP.asset.token) && fromLP.asset.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == fromLP.asset.token
              )?.price
        const token2UnitPrice: any =
          isNative(fromLP.uusd.token) && fromLP.uusd.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == fromLP.uusd.token
              )?.price

        const liq = calculateTVL(fromLP, token1UnitPrice, token2UnitPrice)

        const wtvalue = decimal(liq, 6)

        const currentItem = tradingData.find(
          (item: any) => item.pairAddress === contract_addr
        )

        return {
          ...item,
          balance: balance ?? "0",
          withdrawable: fromLP,
          withdrawableValue: wtvalue,
          TxFee: currentItem?.TxFee,
          totalApr: currentItem?.TxFee,
          APY: currentItem?.APY,
          APR: currentItem?.APR,
          isFarmed: currentItem?.isInPool,
          share,
        }
      })
      .filter((data) => gt(data.balance, "0"))

  const totalWithdrawableValue =
    dataSource && dataSource.length > 0
      ? sum(
          dataSource
            .filter(
              ({ withdrawableValue }) =>
                !isNaN(number(withdrawableValue)) && gt(withdrawableValue, "0")
            )
            .map(({ withdrawableValue }) => withdrawableValue)
        )
      : "0"

  return {
    keys: [],
    loading: false,
    dataSource,
    totalWithdrawableValue,
  }
}
