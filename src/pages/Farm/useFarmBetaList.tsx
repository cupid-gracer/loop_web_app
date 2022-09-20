import { useRecoilValue } from "recoil"
import { useState } from "react"

import {
  getLpTokenInfoQuery,
  useFindPairPoolPrice,
  useTokenMethods,
} from "../../data/contract/info"
import { div, gt, gte, lt, multiple, number, plus } from "../../libs/math"
import { LIST } from "../../hooks/Farm/useFarmingList"
import { SMALLEST, UST } from "../../constants"
import {FarmUserRewardsFarm2, FarmUserRewardsFarm4} from "./FarmUserRewards"
import { FarmRewardsFarm2 } from "./FarmRewards"
import {
  adjustAmount,
  commas,
  decimal,
  isNative,
  niceNumber,
} from "../../libs/parse"
import usePoolDynamic from "../../forms/Pool/usePoolDynamic"
import { Type } from "../PoolDynamic"
import {
  MemoizCalculateTxFeeAPY,
  SimpleCalculateAPYFarm2,
} from "./CalculateAPY"
import { useFindSevenDayFee } from "../../data/contract/statistic"
import CalculateUserTVL from "./CalculateUserTVL"
import {
  FarmUserRewardPerSecondFarm2,
  FarmUserRewardPerSecondFarm4,
} from "./FarmUserRewardPerSecond"
import {
  FarmContractTYpe,
  lpTokenBalancesFactory2Query,
  useFindFarminglpTokenBalanceFarm2,
  useFindlistOfDistributableTokensByPoolFarm2,
  useFindStakedByUserFarmQueryFarm2,
  useFindUserRewardInPoolFarm2,
  useStakeableListFarm2,
  useStakedableTokensFarm4,
  useStakedableTokensListFarm4,
} from "../../data/farming/FarmV2"
import {
  FactoryType,
  useFarms,
  useFindPairPool,
  useLOOPPrice,
  useLpTokenBalancesQuery,
} from "../../data/contract/normalize"
import { calculateAPR2, CalculateAPRFarm2 } from "./CalculateAPR"
import { bound } from "../../components/Boundary"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import { useProtocol } from "../../data/contract/protocol"
import {
  getTotalStakedForFarming4Query,
  useFindStakedByUserFarmQueryFarm4,
  usePoolPairPoolList,
} from "../../data/contract/migrate"
import { styled } from "@material-ui/core"
import { unitPricesStore } from "../../data/API/common"
import {
  tradingListFactory4Store,
  tradingListStore,
} from "../../data/API/dashboard"

const useFarmBetaList = (
  FarmType: FarmContractTYpe,
  list: any[],
  forFarm: boolean = false
) => {
  const listofStakeable = useStakeableListFarm2(FarmType)
  const listofStakeableFarm4 = useStakedableTokensListFarm4()
  const { check8decOper } = useTokenMethods()
  const findUserRewardInPoolFarm2Fn = useFindUserRewardInPoolFarm2(FarmType)
  const findListOfDistributableTokensFn =
    useFindlistOfDistributableTokensByPoolFarm2(FarmType)
  const findStakedByUserFarmFn = useFindStakedByUserFarmQueryFarm2(FarmType)
  const findStakedByUserFarm4Fn = useFindStakedByUserFarmQueryFarm4()
  const findFarminglpTokenBalanceFn =
    useFindFarminglpTokenBalanceFarm2(FarmType)
  // const getTokenSupplyFn = useRecoilValue(findTokenInfoTotalSupply)
  const getTokenInfoFn = useRecoilValue(getLpTokenInfoQuery)
  const { getUstPair } = useProtocol()
  const findPairPoolPriceFn = useFindPairPoolPrice()
  const findPairPool = useFindPairPool()
  const { contents: pairPools } = usePoolPairPoolList()
  const getPool = usePoolDynamic()
  // const findLpBalance = useGetLpTokenBalance()

  const { contents: lpTokenBalances } = useLpTokenBalancesQuery()
  const lpBalancesFactory2 = useRecoilValue(lpTokenBalancesFactory2Query)
  const findSevenDayFee = useFindSevenDayFee()
  // const [combinedApy,setCombinedApy]=useState<any>('')
  const loopPrice = useLOOPPrice()?.contents
  const type = Type.WITHDRAW
  const unitPrices = useRecoilValue(unitPricesStore)

  function calculateTVL(poolData, token1Price, token2Price) {
    const assetAmount = check8decOper(poolData.fromLP.asset.token)
      ? div(poolData.fromLP.asset.amount, "100000000")
      : div(poolData.fromLP.asset.amount, SMALLEST)
    const uusdAmount = check8decOper(poolData.fromLP.uusd.token)
      ? div(poolData.fromLP.uusd.amount, "100000000")
      : div(poolData.fromLP.uusd.amount, SMALLEST)

    return plus(
      multiple(assetAmount, token1Price),
      multiple(uusdAmount, token2Price)
    )
  }

  const tradingDataFac2 = useRecoilValue(tradingListStore)
  const tradingDataFac4 = useRecoilValue(tradingListFactory4Store)
  const tradingData = [...tradingDataFac2, ...tradingDataFac4]
  const [userRewards, setUserRewards] = useState<any>(0)

  // function calculateTVL(poolData) {
  //     const assetAmount = check8decOper(poolData.fromLP.asset.token)
  //         ? adjustAmount(true, true, div(poolData.fromLP.asset.amount, SMALLEST))
  //         : div(poolData.fromLP.asset.amount, SMALLEST)
  //     const uusdAmount = check8decOper(poolData.fromLP.uusd.token)
  //         ? adjustAmount(true, true, div(poolData.fromLP.uusd.amount, SMALLEST))
  //         : div(poolData.fromLP.uusd.amount, SMALLEST)

  //     const token1UstPair = getUstPair(poolData.fromLP.asset.token)
  //     const token2UstPair = getUstPair(poolData.fromLP.uusd.token)
  //     const token1Price =
  //         isNative(poolData.fromLP.asset.token) &&
  //         poolData.fromLP.asset.token === "uusd"
  //             ? "1"
  //             : findPairPoolPriceFn?.(
  //             token1UstPair ?? "",
  //             poolData.fromLP.asset.token
  //         ) ?? "0"

  //     const token2Price =
  //         isNative(poolData.fromLP.uusd.token) &&
  //         poolData.fromLP.uusd.token === "uusd"
  //             ? "1"
  //             : findPairPoolPriceFn?.(
  //             token2UstPair ?? "",
  //             poolData.fromLP.uusd.token
  //         ) ?? "0"

  //     return plus(
  //         multiple(
  //             assetAmount,
  //             check8decOper(poolData.fromLP.asset.token)
  //                 ? multiple(token1Price, "100")
  //                 : token1Price
  //         ),
  //         multiple(
  //             uusdAmount,
  //             check8decOper(poolData.fromLP.uusd.token)
  //                 ? multiple(token2Price, "100")
  //                 : token2Price
  //         )
  //     )
  // }

  let allTVL = "0"
  let total_locked = "0"
  let userTVL = "0"
  const total_stakedListFarm4 = useRecoilValue(
    getTotalStakedForFarming4Query(FarmType)
  )

  return list
    .filter((item) => {
      return forFarm
        ? FarmType === FarmContractTYpe.Farm4
          ? listofStakeableFarm4 && listofStakeableFarm4.includes(item.lpToken)
          : listofStakeable && listofStakeable.includes(item.lpToken)
        : true
    })
    .map((item: LIST) => {
      const { lpToken, symbol, tokens } = item
      const all_rewards = findListOfDistributableTokensFn(lpToken)

      const staked =
        FarmType === FarmContractTYpe.Farm4
          ? findStakedByUserFarm4Fn(lpToken)
          : findStakedByUserFarmFn(lpToken)

      const all_staked =
        FarmType === FarmContractTYpe.Farm4
          ? total_stakedListFarm4?.[lpToken] ?? "0"
          : findFarminglpTokenBalanceFn(lpToken) ?? ""
      const sevenDaysFee = findSevenDayFee(item.contract_addr)
      const poolResult: any =
        FarmType === FarmContractTYpe.Farm4
          ? pairPools[item.contract_addr]
          : findPairPool(item.contract_addr)

      if (tokens) {
        const all_pool = getPool({
          amount: all_staked,
          token: item.lpToken,
          token2: UST,
          pairPoolResult: poolResult,
          type,
        })
        if (all_pool.fromLP) {
          const token1UnitPrice: any =
            isNative(all_pool.fromLP.asset.token) &&
            all_pool.fromLP.asset.token === "uusd"
              ? "1"
              : unitPrices.find(
                  (item: any) =>
                    item.tokenAddress == all_pool.fromLP.asset.token
                )?.price
          const token2UnitPrice: any =
            isNative(all_pool.fromLP.uusd.token) &&
            all_pool.fromLP.uusd.token === "uusd"
              ? "1"
              : unitPrices.find(
                  (item: any) => item.tokenAddress == all_pool.fromLP.uusd.token
                )?.price

          const tvl = decimal(
            calculateTVL(all_pool, token1UnitPrice, token2UnitPrice),
            6
          )
          allTVL = tvl
          // symbol.split('-')[0].trim()=='OSMO'? multiple(tvl, "2") :
          // symbol.split('-')[0].trim()=='SCRT' ? multiple(tvl, "2") :
          // tvl
        }

        const userPool = getPool({
          amount: staked,
          token: item.lpToken,
          token2: UST,
          pairPoolResult: poolResult,
          type,
        })
        if (userPool.fromLP) {
          const token1UnitPrice: any =
            isNative(userPool.fromLP.asset.token) &&
            userPool.fromLP.asset.token === "uusd"
              ? "1"
              : unitPrices.find(
                  (item: any) =>
                    item.tokenAddress == userPool.fromLP.asset.token
                )?.price
          const token2UnitPrice: any =
            isNative(userPool.fromLP.uusd.token) &&
            userPool.fromLP.uusd.token === "uusd"
              ? "1"
              : unitPrices.find(
                  (item: any) => item.tokenAddress == userPool.fromLP.uusd.token
                )?.price

          userTVL = decimal(
            calculateTVL(userPool, token1UnitPrice, token2UnitPrice),
            6
          )
        }
      }
      // console.log("all_rewards", all_rewards)
      let totalPricesArray: string[] = []
      all_rewards &&
        all_rewards.map((reward) => {
          const { info, daily_reward } = reward
          // const token = info.token !== undefined ? info.token.contract_addr : info.token
          const price =
            findPairPoolPriceFn?.(
              getUstPair(info.token.contract_addr) ?? "",
              info.token.contract_addr
            ) ?? "0"
          return price
            ? totalPricesArray.push(
                multiple(price, div(multiple(daily_reward, "24"), SMALLEST)) ??
                  "0"
              )
            : "0"
        })

      // const userAPY  = calculateAPY(totalUserPricesArray, userTVL)
      const allAPR = calculateAPR2({
        totalPricesArray,
        tvl: allTVL,
        sevenDaysFee: sevenDaysFee,
      })

      const receivedRewards = findUserRewardInPoolFarm2Fn(lpToken)

      const loopReward =
        all_rewards &&
        all_rewards.map((reward) => {
          return decimal(
            multiple(
              multiple(
                div(multiple(reward?.daily_reward, 24), SMALLEST),
                loopPrice
              ),
              7
            ),
            4
          )
        })
      const loopRewards =
        loopReward &&
        loopReward.length > 0 &&
        loopReward.reduce((a, b) => plus(a, b))

      const totalSupply = getTokenInfoFn?.(lpToken)?.total_supply ?? "0"
      const userPool = getPool({
        amount: totalSupply,
        token: lpToken,
        token2: UST,
        pairPoolResult: poolResult?.contents ? poolResult.contents : poolResult,
        type,
      })
      if (userPool.fromLP) {
        const token1UnitPrice: any =
          isNative(userPool.fromLP.asset.token) &&
          userPool.fromLP.asset.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == userPool.fromLP.asset.token
              )?.price
        const token2UnitPrice: any =
          isNative(userPool.fromLP.uusd.token) &&
          userPool.fromLP.uusd.token === "uusd"
            ? "1"
            : unitPrices.find(
                (item: any) => item.tokenAddress == userPool.fromLP.uusd.token
              )?.price
        total_locked = calculateTVL(userPool, token1UnitPrice, token2UnitPrice)
      }

      const totalLocked = multiple(
        multiple(total_locked, SMALLEST),
        lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd" ? "2" : "1"
      )
      let setCombinedApy = ""

      const setAPY = (value: string) => {
        setCombinedApy = value
      }

      const APY = tradingData.find((item) => item.lpToken == lpToken)?.APY
      const fees = tradingData.find((item) => item.lpToken == lpToken)?.TxFee
      const all_apr = tradingData.find((item) => item.lpToken == lpToken)?.APR

      const total_value = isNaN(number(userTVL))
          ? "0"
          : multiple(
              userTVL,
              lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                  ? "2"
                  : "1"
          )
      const estAPYInUst = div(multiple(total_value, all_apr), '100')

      return {
        ...item,
        FarmContractType: FarmType,
        symbol: symbol ?? "",
        loopRewards: loopRewards ?? "0",
        combined_apy: setCombinedApy,
        estAPYInUst: estAPYInUst ?? 0,
        rewards_beta:
          FarmType === FarmContractTYpe.Farm4 ? (
            <FarmUserRewardPerSecondFarm4
              farmContractType={FarmType}
              lp={lpToken}
              data={all_rewards}
            />
          ) : (
            <FarmUserRewardPerSecondFarm2
              farmContractType={FarmType}
              lp={lpToken}
              data={all_rewards}
            />
          ),
        rewards_betaFn: (expanded: boolean) =>
            FarmType === FarmContractTYpe.Farm4 ? (
                <FarmUserRewardPerSecondFarm4
                    farmContractType={FarmType}
                    lp={lpToken}
                    data={all_rewards}
                    expanded={expanded}
                />
            ) : (
                <FarmUserRewardPerSecondFarm2
                    farmContractType={FarmType}
                    lp={lpToken}
                    data={all_rewards}
                />
            ),
        rewards: FarmType === FarmContractTYpe.Farm4 ? <FarmUserRewardsFarm4 data={receivedRewards} /> :  <FarmUserRewardsFarm2 data={receivedRewards} />,
        receivedRewards: receivedRewards,
        all_rewards:
          all_rewards && all_rewards?.length > 0 ? (
            <FarmRewardsFarm2 farmType={FarmType} data={all_rewards} />
          ) : (
            <LoadingPlaceholder />
          ),
        apr: gt(allAPR, "50000")
          ? "50,000+ "
          : commas(
              decimal(
                isFinite(number(niceNumber(allAPR))) ? niceNumber(allAPR) : "0",
                2
              )
            ),
        all_apy: APY,
        // bound(
        //   <span style={{ color: "#32FE9A" }}>
        //     <SimpleCalculateAPYFarm2
        //       symbol={symbol}
        //       setCombinedAPY={setAPY}
        //       totalLocked={div(totalLocked, SMALLEST)}
        //       sevenDaysFee={sevenDaysFee}
        //       totalPricesArray={totalPricesArray}
        //       lpToken={lpToken}
        //       all_rewards={all_rewards}
        //       farmContractType={FarmType}
        //       tvl={
        //         isNaN(number(allTVL))
        //           ? "0"
        //           : multiple(
        //               allTVL,
        //               lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
        //                 ? "2"
        //                 : "1"
        //             )
        //       }
        //     />
        //   </span>,
        //   <LoadingPlaceholder size={"sm"} color={"green"} />
        // ),
        tx_fee_apy: bound(
          <MemoizCalculateTxFeeAPY
            sevenDaysFee={sevenDaysFee}
            all_rewards={all_rewards}
            total_locked={div(totalLocked, SMALLEST)}
            farmType={FarmType}
            forFarm={forFarm}
            lpToken={lpToken}
            farmContractType={FarmType}
            totalPricesArray={totalPricesArray}
            tvl={
              isNaN(number(allTVL))
                ? "0"
                : multiple(
                    allTVL,
                    lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                      ? "2"
                      : "1"
                  )
            }
          />,
          <LoadingPlaceholder size={"sm"} />
        ),
        all_apr: all_apr,
        // (
        //   <CalculateAPRFarm2
        //     symbol={symbol}
        //     totalLocked={div(totalLocked, SMALLEST)}
        //     sevenDaysFee={sevenDaysFee}
        //     totalPricesArray={totalPricesArray}
        //     lpToken={lpToken}
        //     all_rewards={all_rewards}
        //     farmContractType={FarmType}
        //     tvl={
        //       isNaN(number(allTVL))
        //         ? "0"
        //         : multiple(
        //             allTVL,
        //             lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
        //               ? "2"
        //               : "1"
        //           )
        //     }
        //   />
        // ),
        liquidity: isNaN(number(userTVL))
          ? "0"
          : multiple(
              userTVL,
              lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                ? "2"
                : "1"
            ),
        all_liquidity: isNaN(number(allTVL))
          ? "0"
          : multiple(
              allTVL,
              lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                ? "2"
                : "1"
            ),
        call_user_liquidity: (
          <CalculateUserTVL
            /*user_rewards={rewards}*/
            tvl={
              isNaN(number(userTVL))
                ? "0"
                : multiple(
                    userTVL,
                    lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                      ? "2"
                      : "1"
                  )
            }
          />
        ),
        call_user_liquidityFn: (expanded: boolean) => (
            <CalculateUserTVL
                /*user_rewards={rewards}*/
                expanded={expanded}
                tvl={
                  isNaN(number(userTVL))
                      ? "0"
                      : multiple(
                      userTVL,
                      lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                          ? "2"
                          : "1"
                      )
                }
            />
        ),
        call_liquidity: gt(allTVL, "0") ? (
          `$${commas(
            decimal(
              multiple(
                allTVL,
                lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                  ? "2"
                  : "1"
              ),
              3
            )
          )}`
        ) : (
          <LoadingPlaceholder />
        ),
        staked: staked ? div(staked, SMALLEST) : "0",
        total_fee: sevenDaysFee ?? "0",
        tx_fee: fees,
        total_locked: totalLocked ?? "0",
        total_staked: div(all_staked, SMALLEST),
        staked_percentage: multiple(div(staked, all_staked), "100"),
        all_staked: bound(
          all_staked ? div(all_staked, SMALLEST) : "0",
          <LoadingPlaceholder color={"green"} />
        ),
        isOpen: false,
        totalValueUst: isNaN(number(userTVL))
          ? "0"
          : multiple(
              userTVL,
              lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                ? "2"
                : "1"
            ),
        lp_balance:
          FarmType === FarmContractTYpe.Farm4
            ? lpBalancesFactory2[lpToken]
            : lpTokenBalances?.[item.lpToken],
        tvl: isNaN(number(userTVL))
          ? "0"
          : multiple(
              userTVL,
              lpToken === "terra1yy46j5xy7fykt6q58aa4u4y39h4fxc7jke2spd"
                ? "2"
                : "1"
            ),
      }
    })
}

export default useFarmBetaList

export const useFarmsList = (forFarm: boolean = false) => {
  const list = useFarms()

  const dataSource3: any = useFarmBetaList(FarmContractTYpe.Farm3, list, true)
  const dataSource2: any = useFarmBetaList(
    FarmContractTYpe.Farm2,
    list,
    forFarm
  ).filter(
    (item) =>
      ![...dataSource3.map((item) => item.lpToken)].includes(item.lpToken)
  )
  return [...dataSource2, ...dataSource3].sort((a, b) =>
    lt(a.combined_apy, b.combined_apy) ? 1 : -1
  )
}

export const useFarmsNewList = (forFarm: boolean = false) => {
  const list = useFarms(FactoryType.fac2)
  const dataSource2: any = useFarmBetaList(
    FarmContractTYpe.Farm4,
    list,
    forFarm
  )

  return [...dataSource2].sort((a, b) =>
    lt(a.combined_apy, b.combined_apy) ? 1 : -1
  )
}
