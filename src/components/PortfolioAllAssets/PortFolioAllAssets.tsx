import styles from "./PortFolioAllAssets.module.scss"
import COINS_ICON from "../../images/coins_icon.svg"
import useMy from "../../pages/My/useMy"
import { useFarmsList } from "../../pages/Farm/useFarmBetaList"
import { div, gt, plus } from "../../libs/math"
import { SMALLEST } from "../../constants"
import { commas, decimal } from "../../libs/parse"
import classNames from "classnames/bind"
import { unitPricesStore } from "../../data/API/dashboard"
import { useRecoilValue } from "recoil"
import {
  getFarmingPendingRewards,
  getStakingPendingRewards,
} from "../../pages/My/parser"
import { useTokenMethods } from "../../data/contract/info"
import useStaking from "../../pages/My/useStaking"

const useFarmTotalValueUstLocked = (): any => {
  const dataList = useFarmsList(true)
  const unitPrices = useRecoilValue(unitPricesStore)
  const { check8decOper } = useTokenMethods()

  const list =
    dataList && dataList.length > 0
      ? dataList
          ?.filter((farm) => gt(farm.staked ?? "0", "0"))
          ?.map((farm) => {
            return farm?.tvl ?? "0"
          })
      : []
  const totalValue =
    dataList && dataList.length > 0
      ? dataList
          ?.filter((farm) => gt(farm.staked ?? "0", "0"))
          ?.map((farm) => {
            return farm?.liquidity ?? "0"
          })
      : []

  const farmingPendingReward = getFarmingPendingRewards(
    dataList,
    unitPrices,
    check8decOper
  )

  return {
    farmRewards: list && list.length > 0 && list?.reduce((a, b) => plus(a, b)),
    totalValue:
      totalValue &&
      totalValue.length > 0 &&
      totalValue?.reduce((a, b) => plus(a, b)),
    farmingPendingReward: farmingPendingReward,
  }
}

const useStakingPendingRewards = (): any => {
  const dataList = useStaking()
  const stakingPendingRewards = getStakingPendingRewards(dataList?.dataSource)
  return stakingPendingRewards
}

const PortFolioAllAssets = () => {
  const { holdings, pool, staking } = useMy()
  let farmRewards: string = useFarmTotalValueUstLocked()?.farmRewards
  let farmStaking: string = useFarmTotalValueUstLocked()?.totalValue
  const stakingPendingRewards = useStakingPendingRewards()
  const farmingPendingRewards =
    useFarmTotalValueUstLocked()?.farmingPendingReward

  const test = useStakingPendingRewards()

  const holdingsValue = div(holdings?.totalValue, SMALLEST)
  const poolValue = pool?.totalWithdrawableValue
  const stakeValue = farmStaking
  const stakingValue = staking?.totalUstBalance
  const totalEarnedFromStaking = staking?.totalEarnedFromStaking.toString()

  const totalBalance = decimal(
    plus(plus(holdingsValue, poolValue), plus(stakeValue, stakingValue)),
    2
  )

  return (
    <div className={styles.assetsContainer}>
      <div className={styles.imageWrapper}>
        <span className={styles.coinImage}>
          <img src={COINS_ICON} />
        </span>
      </div>
      {totalBalance > "0" ? (
        <div className={styles.valuesContainer}>
          <span className={styles.itemWrapper}>
            <span>Total Balance</span>
            <span className={styles.dflex}>
              <span className={styles.textStyle}>{commas(totalBalance)}</span>
              <span className={styles.Style}>UST</span>
            </span>
          </span>

          <span className={styles.itemWrapper}>
            <span>Current Earnings</span>
            <span className={styles.dflex}>
              <span className={styles.textStyle}>
                {commas(
                  decimal(
                    plus(
                      farmRewards ?? "0",
                      commas(totalEarnedFromStaking) ?? "0"
                    ),
                    2
                  )
                )}
              </span>
              <span className={styles.Style}>UST</span>
            </span>
          </span>

          <span className={styles.itemWrapper}>
            <span>Total Pending Rewards</span>
            <span className={styles.dflex}>
              <span className={styles.textStyle}>
                {commas(
                  decimal(plus(stakingPendingRewards, farmingPendingRewards), 2)
                )}
              </span>
              <span className={styles.Style}>UST</span>
            </span>
          </span>
        </div>
      ) : (
        <div className={classNames(styles.valuesContainer, styles.emptyAssets)}>
          <span className={styles.itemWrapper}>
            <span>Total Balance</span>
            <span className={styles.dflex}>
              <span className={styles.textStyle}>0</span>
              <span className={styles.Style}>UST</span>
            </span>
          </span>
        </div>
      )}
    </div>
  )
}

export default PortFolioAllAssets
