import {useEffect, useState} from "react"
import {div, minus, multiple, number, plus} from "../../libs/math"
import {LOOP, SMALLEST, UST} from "../../constants"
import {decimal, numbers} from "../../libs/parse"
import {useLOOPPrice} from "../../data/contract/normalize"
import {StakeDuration} from "../LoopStake"
import {
  StakeContracts,
  useTokensDistributedPerDayList
} from "../../data/stake/stake18Mon"

interface Props {
  total_staked: string
  user_staked: string
  duration: StakeDuration
  showUstValue?: boolean
  lastDistributionTime: string | number
  disWaitTime: string | number
}

const CalculateRewardPerSecond = ({ total_staked, user_staked, duration,lastDistributionTime,disWaitTime, showUstValue = true }: Props) => {

  const { contents: tokensDistributedPerDayList } = useTokensDistributedPerDayList()

  // @ts-ignore
  const tokensDistributedPerDay: string = tokensDistributedPerDayList[StakeContracts[duration]]

  // const getDistributionWaitTime = useRecoilValue<string|undefined>(values.getDistributionWaitTimeQuery)
  const getDistributionWaitTime = disWaitTime
  // const getLastDistributionTime = useRecoilValue<string|undefined>(values.getLastDistributionTimeQuery)
  const getLastDistributionTime = lastDistributionTime
  const { contents } = useLOOPPrice()
  const [currentTime, setTime] = useState(div(Date.now(), 1000));

  useEffect(() => {
    const interval = setInterval(() => setTime(div(Date.now(), 1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);


  const perSecondUserReward = multiple(div(user_staked, total_staked), div(div(tokensDistributedPerDay, SMALLEST), "86400"))
  const remaningTime = minus(plus(getDistributionWaitTime, getLastDistributionTime), currentTime ?? "0")
  const elapsedTime = minus(getDistributionWaitTime, remaningTime)

  const persecondReward = decimal(multiple(perSecondUserReward, elapsedTime), 6)
  const persecondRewardUST = numbers(decimal(multiple(persecondReward, contents), 3))

  return (
      <>
        {!isNaN(number(persecondReward ?? "0")) && isFinite(number(persecondReward ?? "0")) ? numbers(persecondReward) ?? "0" : "0"} <span>{LOOP}</span>
        { showUstValue && <i>{!isNaN(number(persecondRewardUST ?? "0")) && isFinite(number(persecondRewardUST ?? "0")) ? numbers( persecondRewardUST ?? "0") : "0"} {UST}</i> }
      </>
)
}

export default CalculateRewardPerSecond