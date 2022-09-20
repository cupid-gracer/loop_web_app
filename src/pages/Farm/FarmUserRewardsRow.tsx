import { getTokenInfoQuery, useTokenMethods } from "../../data/contract/info"
import {
  adjustAmount,
  commas,
  decimal,
  isNative,
  lookupSymbol,
} from "../../libs/parse"
import { SMALLEST } from "../../constants"
import { div, gt } from "../../libs/math"
import styles from "./FarmRewards.module.scss"
import { FarmUserRewardType } from "./FarmUserRewards"
import { useRecoilValue } from "recoil"
import { useFindTokenDetails } from "../../data/form/select"
import classnames from "classnames";

interface Props {
  item: FarmUserRewardType
  setUserRewards?: any
    multiline?: boolean
}

const FarmRewardsRow = ({ item }: Props) => {
  const getTokenInfoFn = useRecoilValue(getTokenInfoQuery)
  const { check8decOper } = useTokenMethods()
  const findTokenDetailFn = useFindTokenDetails()
  const { info, amount } = item
  const token =
    info.token !== undefined ? info.token.contract_addr : info.nativeToken.denom
  const contractSymbol =
    info.token !== undefined
      ? getTokenInfoFn?.(info.token.contract_addr)?.symbol
      : ""
  const token1detail = findTokenDetailFn(token)

  const value = check8decOper(info.token?.contract_addr)
      ? decimal(adjustAmount(true, true, amount), 6)
      : amount
  
  const finalAmount = decimal(div(value, SMALLEST), !isNative(token) ? token1detail?.decimals ?? 6 :  6)

  return gt(amount, "0") ? (
    <div className={styles.row}>
      <span className={styles.price}>
      {`${gt(finalAmount, "1") ? commas(finalAmount) : finalAmount}  `}{" "}
      </span>
      <span>
        {" "}
        {isNative(token)
          ? ` ${lookupSymbol(token)}`
          : ` ${lookupSymbol(contractSymbol)}`}
      </span>
    </div>
  ) : (
    <></>
  )
}

export default FarmRewardsRow

export const FarmRewardsRowFarm2 = ({ item, multiline = false }: Props) => {
  const getTokenInfoFn = useRecoilValue(getTokenInfoQuery)
  const { check8decOper } = useTokenMethods()
  const findTokenDetailFn = useFindTokenDetails()
  const { info, amount } = item
  const token =
    info.token !== undefined ? info.token.contract_addr : info.nativeToken.denom
  const contractSymbol =
    info.token !== undefined
      ? getTokenInfoFn?.(info.token.contract_addr)?.symbol
      : ""
  const token1detail = findTokenDetailFn(token)

      const value = check8decOper(info.token?.contract_addr)
      ? decimal(adjustAmount(true, true, amount), 6)
      : amount
  
  const finalAmount = decimal(div(value, SMALLEST), !isNative(token) ? token1detail?.decimals ?? 6 :  6)

  return gt(amount, "0") ? (
    <div className={styles.row}>
      <span className={classnames(styles.price_v4, multiline ? styles.price_v3Sm : "")}>
        {`${gt(finalAmount, "1") ? commas(finalAmount) : finalAmount}  `}{" "}
      </span>
      <span className={classnames(styles.symbol, multiline ? styles.symbolSm : "")}>
        {" "}
        {isNative(token)
          ? ` ${lookupSymbol(token)}`
          : ` ${lookupSymbol(contractSymbol)}`}
      </span>
    </div>
  ) : (
    <></>
  )
}
