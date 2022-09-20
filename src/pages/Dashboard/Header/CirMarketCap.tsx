import { useRecoilValue } from "recoil"

import { bound } from "../../../components/Boundary"
import styles from "../DashboardHeader.module.scss"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"
import { commas, decimal, formatAssetAmount } from "../../../libs/parse"
import { getCirMarketCap } from "../../../data/contract/statistic"
import { multiple, gt } from "../../../libs/math"
import { useLOOPPrice } from "../../../data/contract/normalize"
import { SMALLEST, UST } from "../../../constants"
import { loopUnitPrice } from "../../../data/API/common"

export const useMarketCap = () => {
  const content = useRecoilValue(getCirMarketCap)
  return content ? content?.data[0]?.circulatingSupply : "0"
}

const CirMarketCap = ({amount}:{amount: string}) => {
  // const loopSupply = useMarketCap()
  const LoopUstPrice = useRecoilValue(loopUnitPrice)
  

  return bound(
    amount && gt(amount, "0") && (
      <>
        <span className={styles.dflex}>
          <span className={styles.aprRange}>
            {formatAssetAmount(
             multiple(amount, SMALLEST), UST)}
          </span>
          <span className={styles.seprate}>UST</span>
        </span>
        <span className={styles.footer}>
          {formatAssetAmount(multiple(decimal(multiple(LoopUstPrice, "1000000000"),2), SMALLEST), UST)} Fully Diluted
        </span>
      </>
    ),
    <LoadingPlaceholder size={"sm"} color={"black"} />
  )
}

export default CirMarketCap

export const CirculatingSupply = ({amount}:{amount: string}) => {
  // const loopSupply = useMarketCap()
  
  return bound(
    amount && (
      <>
        <span className={styles.dflex}>
          <span className={styles.aprRange}>{formatAssetAmount(multiple(amount, SMALLEST), UST)}</span>
          <span className={styles.seprate}>LOOP</span>
        </span>
        <span className={styles.footer}>of 1b total</span>
      </>
    ),
    <LoadingPlaceholder size={"sm"} color={"black"} />
  )
}
