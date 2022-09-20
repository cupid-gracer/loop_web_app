import {TokenInfo, useGetTokenInfoQuery, useTokenMethods,} from "../../data/contract/info"
import {useRecoilValue} from "recoil"
import {FarmReward} from "./FarmRewards"
import {adjustAmount, commas, decimal, isNative, lookupSymbol,} from "../../libs/parse"
import {SMALLEST} from "../../constants"
import {div, minus, multiple, pow} from "../../libs/math"
import styles from "./FarmRewards.module.scss"
import {
  findDevTokenUserBalance,
  getDistributionWaitTimeQuery,
  useFindDevTokenUserBalance
} from "../../data/farming/stakeUnstake"
import useRewardNextPayout, {useRewardNextPayoutFarm2} from "../../graphql/queries/Farm/useRewardNextPayout"
import {
  FarmContractTYpe,
  getDistributionWaitTimeQueryFarm2,
  useFindDevTokensByLpFarm2,
  useFindStakedByUserFarmQueryFarm2,
  useTotalStakedForFarming
} from "../../data/farming/FarmV2"
import useContractQuery from "../../graphql/useContractQuery"
import {getTotalStakedForFarming4Query, useFindStakedByUserFarmQueryFarm4} from "../../data/contract/migrate"
import { useFindTokenDetails } from "../../data/form/select"
import classnames from "classnames";

interface Props {
  item: FarmReward
  lp: string
  farmContractType: FarmContractTYpe
  multiline?: boolean
}

const FarmRewardPerSecondRow = ({ item, lp }: Props) => {
  const getTokenInfoFn = useGetTokenInfoQuery()
  
  const getDistributionWaitTime = useRecoilValue(getDistributionWaitTimeQuery)
  const { check8decOper } = useTokenMethods()
  const { info, daily_reward } = item
  const token = info.token !== undefined ? info.token.contract_addr : ""
  const contractSymbol =
    info.token !== undefined
      ? getTokenInfoFn?.(info.token.contract_addr)?.symbol
      : ""

    const findDevTokenSupply = useRecoilValue(findDevTokenUserBalance)
  const findDevTokenBalance = useFindDevTokenUserBalance()
  const perDayRewardDec = check8decOper(info.token?.contract_addr)
      ? decimal(adjustAmount(true, true, daily_reward), 6)
      : daily_reward

  const perDayReward = decimal(div(perDayRewardDec, SMALLEST), 6)
  const totalSuppply = lp ? findDevTokenSupply(lp) : "0"
  const perDev = div(perDayReward, totalSuppply)
  const userBalance  = findDevTokenBalance(lp)
  const userPerDevRewrd = multiple(userBalance, perDev)
  const perSecond = div(userPerDevRewrd, "86400")
  const { timeLeft } = useRewardNextPayout()
  const elapsedTime = minus(getDistributionWaitTime ?? "21600", timeLeft)
  const persecondReward = multiple(perSecond, elapsedTime)
  return (
    <div className={styles.row}>
      <span className={styles.price}>
        {commas(decimal(persecondReward, 6))}{" "}
      </span>
      <span>
        {" "}
        {isNative(token)
          ? ` ${lookupSymbol(token)}`
          : ` ${lookupSymbol(contractSymbol)}`}
      </span>
    </div>
  )
}

export default FarmRewardPerSecondRow

export const FarmRewardPerSecondRowFarm2 = ({ item, lp, farmContractType }: Props) => {
  const findStakedByUserFarmFn = useFindStakedByUserFarmQueryFarm2(farmContractType)
  const getDistributionWaitTimeV2 = useRecoilValue(getDistributionWaitTimeQueryFarm2(farmContractType))
  const getTokenInfoFn = useGetTokenInfoQuery()
  const findTokenDetailFn = useFindTokenDetails()
  const { info, daily_reward } = item
  const token = info.token !== undefined ? info.token.contract_addr : ""
  const decimals = !isNative(token) ? findTokenDetailFn(token)?.decimals : 6
  const contractSymbol =
      info.token !== undefined
          ? getTokenInfoFn?.(info.token.contract_addr)?.symbol
          : ""
  const { check8decOper } = useTokenMethods()
  const findDevTokensByLpFarm2 = useFindDevTokensByLpFarm2(farmContractType)
  const devToken = findDevTokensByLpFarm2(lp)
  const devTokenInfo = useDevTokenInfo(devToken)
  const perDayRewardAdjustDec = check8decOper(info.token?.contract_addr)
      ? decimal(adjustAmount(true, true, daily_reward), 6)
      : daily_reward

  const perDayReward = decimal(div(perDayRewardAdjustDec, SMALLEST), decimals ?? 6)
 
  const totalSuppply = lp ? div(devTokenInfo?.total_supply, pow('10', decimals ?? 6)) : "0"
  const totalHours = div("86400", getDistributionWaitTimeV2)
  const perDev = div(multiple(perDayReward, totalHours ?? "4"), totalSuppply)
  const staked = findStakedByUserFarmFn(lp)
  const userPerDevRewrd = multiple(div(staked, pow('10', decimals ?? 6)), perDev)
  const perSecond = div(userPerDevRewrd, "86400")
  const { timeLeft } = useRewardNextPayoutFarm2(farmContractType, lp)
  const elapsedTime = minus(getDistributionWaitTimeV2 ?? "21600", timeLeft)
  const persecondReward = multiple(perSecond, elapsedTime)

  return (
    !['terra1w8kvd6cqpsthupsk4l0clwnmek4l3zr7c84kwq','terra17jnhankdfl8vyzj6vejt7ag8uz0cjc9crkl2h7'].includes(token) ? <div className={styles.row}>
      <span className={styles.price}>
        {commas(decimal(persecondReward, 6))}{" "}
      </span>
        <span>
        {" "}
          {isNative(token)
              ? ` ${lookupSymbol(token)}`
              : ` ${lookupSymbol(contractSymbol)}`}
      </span>
      </div> : <></>
  )
}

export const FarmRewardPerSecondRowFarm4 = ({ persecondReward, token, contractSymbol, multiline = false }: { persecondReward: string, token: string, contractSymbol: string, multiline: boolean, }) => {

  return (
    !['terra1w8kvd6cqpsthupsk4l0clwnmek4l3zr7c84kwq','terra17jnhankdfl8vyzj6vejt7ag8uz0cjc9crkl2h7'].includes(token) ? <div className={styles.row}>
      <span className={classnames( styles.price_v4, multiline ? styles.price_v3Sm : "")}>
        {commas(decimal(persecondReward, 6))}{" "}
      </span>
        <span className={classnames(styles.whiteMd, multiline ? styles.whiteSm : '')}>
        {" "}
          {isNative(token)
              ? ` ${lookupSymbol(token)}`
              : ` ${lookupSymbol(contractSymbol)}`}
      </span>
      </div> : <></>
  )
}

const useDevTokenInfo = (devToken: string | undefined) => {
  const variables = {
    contract: devToken ?? "",
    msg: { token_info: {} },
  }

  const query = useContractQuery<TokenInfo>(variables)
  return query.parsed as TokenInfo
}

