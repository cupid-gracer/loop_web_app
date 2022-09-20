import axios from "axios"
import { useRecoilValue } from "recoil"
import { SMALLEST } from "../../constants"
import { depositedQuery } from "../../data/contract/info"
import { getTotalStakedForStakingQuery } from "../../data/contract/staking"
import {
  deposited18MonQuery,
  deposited3MonQuery,
  getTotalStakedForStaking18MonQuery,
  getTotalStakedForStaking3MonQuery,
} from "../../data/stake/stake18Mon"
import { div, num } from "../../libs/math"
import { decimal } from "../../libs/parse"
import { useFarmsList } from "../Farm/useFarmBetaList"
import { StakeDuration } from "../LoopStake"
import { useStakeAPY } from "../Stake/useStakeList"

export const useAprRanges = () => {
  const dataSource = useFarmsList(true)
  const max = dataSource?.find(
    (item) => item?.lpToken === "terra1chestqf8qj0jgvl0aa3ke2jutk940htytrmy0n"
  )?.all_apy

  return {
    max_apr: max ?? "",
    min_apr: "0",
    loading: dataSource?.length < 0,
  }
}

export const useStakingAprRanges = (duration) => {
  const values: any = {
    [StakeDuration["12MON"]]: {
      title: "LOOP 12 MONTHS",
      totalTokenStaked: getTotalStakedForStakingQuery,
      deposited: depositedQuery,
    },
    [StakeDuration["18MON"]]: {
      title: "LOOP 18 MONTHS",
      totalTokenStaked: getTotalStakedForStaking18MonQuery,
      deposited: deposited18MonQuery,
    },
    [StakeDuration["3MON"]]: {
      title: "LOOP 3 MONTHS",
      totalTokenStaked: getTotalStakedForStaking3MonQuery,
      deposited: deposited3MonQuery,
    },
  }[duration]

  const totalTokenStaked = useRecoilValue<string | undefined>(
    values?.totalTokenStaked
  )

  const deposited = useRecoilValue<string | undefined>(values.deposited)

  const apr = useStakeAPY(
    duration,
    div(deposited, SMALLEST),
    div(totalTokenStaked, SMALLEST)
  )

  return !isFinite(num(apr)) ? 0 : num(decimal(apr, 2))
}

export const useStakingApr = () => {
  const Mon12 = useStakingAprRanges(StakeDuration["12MON"])
  const Mon18 = useStakingAprRanges(StakeDuration["18MON"])
  const Mon3 = useStakingAprRanges(StakeDuration["3MON"])

  const apr = [Mon12, Mon18, Mon3]
  return {
    max: Math.max(...apr),
    min: Math.min(...apr),
  }
}

export const removeTokenWorld = (name: string, token: string) => {
  if (!name) return name
  if (name.includes("token")) {
    if (token == "terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4") {
      return "LOOP Finance"
    } else if (token == "terra1jx4lmmke2srcvpjeereetc9hgegp4g5j0p9r2q") {
      return "LOOP Community"
    }
    return name.replace("token", "")
  }
  if (name.includes("Token")) {
    if (token == "terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4") {
      return "LOOP Finance"
    } else if (token == "terra1jx4lmmke2srcvpjeereetc9hgegp4g5j0p9r2q") {
      return "LOOP Community"
    }
    return name.replace("Token", "")
  }
  if (name.includes("TOKEN")) {
    if (token == "terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4") {
      return "LOOP Finance"
    } else if (token == "terra1jx4lmmke2srcvpjeereetc9hgegp4g5j0p9r2q") {
      return "LOOP Community"
    }
    return name.replace("TOKEN", "")
  }

  return name
}
