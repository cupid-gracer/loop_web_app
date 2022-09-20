import styles from './FarmRewards.module.scss'
import {div, gt, minus, multiple, plus, pow} from "../../libs/math";
import FarmRewardPerSecondRow, {
    FarmRewardPerSecondRowFarm2,
    FarmRewardPerSecondRowFarm4
} from "./FarmRewardPerSecondRow";
import {
    FarmContractTYpe,
    getDistributionWaitTimeQueryFarm2,
    useFindStakedByUserFarmQueryFarm2, useTotalStakedForFarming
} from "../../data/farming/FarmV2";
import {getTotalStakedForFarming4Query, useFindStakedByUserFarmQueryFarm4} from "../../data/contract/migrate";
import {useRecoilValue} from "recoil";
import {useFindTokenDetails} from "../../data/form/select";
import {useFindPairPoolPrice, useGetTokenInfoQuery, useTokenMethods} from "../../data/contract/info";
import {adjustAmount, commas, decimal, isNative} from "../../libs/parse";
import {SMALLEST} from "../../constants";
import {useRewardNextPayoutFarm2} from "../../graphql/queries/Farm/useRewardNextPayout";
import {useFindBalance, useFindBankBalance} from "../../data/contract/normalize";
import {useProtocol} from "../../data/contract/protocol";


interface Props {
    data: undefined | FarmReward[]
    lp: string
    farmContractType: FarmContractTYpe
    expanded?: boolean
}

export interface FarmReward {
    daily_reward: string,
    info: {
        token: { contract_addr: string }
    }
}

const FarmUserRewardPerSecond = ({ data, lp, farmContractType }: Props) => {
    return (
        <div className={styles.flex}>
            {
                data && data.map((item:FarmReward, index) => (<FarmRewardPerSecondRow farmContractType={farmContractType} lp={lp} item={item} key={index} />))
            }
        </div>
    )
}

export default FarmUserRewardPerSecond

export const FarmUserRewardPerSecondFarm2 = ({ data, lp, farmContractType }: Props) => {
    return (
        <div className={styles.flex}>
            {
                data && data.map((item:FarmReward, index) => (<FarmRewardPerSecondRowFarm2 farmContractType={farmContractType} lp={lp} item={item} key={index} />))
            }
        </div>
    )
}

export const FarmUserRewardPerSecondFarm4 = ({ data, lp, farmContractType, expanded }: Props) => {
    const findStakedByUserFarmFn = useFindStakedByUserFarmQueryFarm2(farmContractType)
    const findStakedByUserFarm4Fn = useFindStakedByUserFarmQueryFarm4()
    const getDistributionWaitTimeV2 = useRecoilValue(getDistributionWaitTimeQueryFarm2(farmContractType))
    const findTokenDetailFn = useFindTokenDetails()
    const { check8decOper } = useTokenMethods()
    const total_stakedListFarm4 = useRecoilValue(getTotalStakedForFarming4Query(farmContractType))
    const { contents: findTotalStakedList } = useTotalStakedForFarming(farmContractType)
    const getTokenInfoFn = useGetTokenInfoQuery()
    const findPairPoolPriceFn = useFindPairPoolPrice()
    const { getUstPair } = useProtocol()
    const { timeLeft } = useRewardNextPayoutFarm2(farmContractType, lp)

    const dataList = data?.map((item) => {
        const { info, daily_reward } = item
        const token = info.token !== undefined ? info.token.contract_addr : ""
        const contractSymbol =
            info.token !== undefined
                ? getTokenInfoFn?.(info.token.contract_addr)?.symbol
                : "";
        const decimals = !isNative(token) ? findTokenDetailFn(token)?.decimals : 6
        const findTotalStakedForFarming = farmContractType === FarmContractTYpe.Farm4 ? total_stakedListFarm4?.[lp] ?? "0" : findTotalStakedList?.[lp] ?? "0"

        const perDayRewardDec = check8decOper(info.token?.contract_addr)
            ? decimal(adjustAmount(true, true, daily_reward), 6)
            : daily_reward
        const price =
            findPairPoolPriceFn?.(
                getUstPair(info.token.contract_addr) ?? "",
                info.token.contract_addr
            ) ?? "0"

        const perDayReward = decimal(div(perDayRewardDec, SMALLEST), 6)
        const totalSuppply = lp && findTotalStakedForFarming ? div(findTotalStakedForFarming ?? "0", pow('10', decimals ?? 6)) : "0"
        const totalHours = div("86400", getDistributionWaitTimeV2)
        const perDev = div(multiple(perDayReward, totalHours ?? "4"), totalSuppply)
        const staked = farmContractType === FarmContractTYpe.Farm4 ? findStakedByUserFarm4Fn(lp) ?? "0" : findStakedByUserFarmFn(lp) ?? "0"
        const userPerDevRewrd = multiple(div(staked, pow('10', decimals ?? 6)), perDev)
        const perSecond = div(userPerDevRewrd, "86400")

        const elapsedTime = minus(getDistributionWaitTimeV2 ?? "21600", timeLeft)
        const persecondReward = multiple(perSecond, elapsedTime)
        return {
            persecondReward,
            token,
            contractSymbol,
            price: decimal(price, 6),
            ustPrice: decimal(multiple(persecondReward, decimal(price, 6)), 6)
        }
    })
    const totalUstValue = dataList?.reduce((partialSum, a) => plus(partialSum, a.ustPrice), '0')

    return (
        <div className={styles.flex}>
            {
                dataList && dataList.map((item:any, index) => (<FarmRewardPerSecondRowFarm4 {...item} multiline={gt(dataList.length, "1")} farmContractType={farmContractType}  key={index} />))
            }
            { expanded && (gt(totalUstValue, '0') && <span className={styles.sm}>{commas(decimal(totalUstValue, 6))} UST</span>) }
        </div>
    )
}

