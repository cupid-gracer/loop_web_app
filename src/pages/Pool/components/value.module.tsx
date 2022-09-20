import styles from "./farm/farmComp.module.scss"
import { SMALLEST, UST } from "../../../constants"
import { decimal, formatAssetAmount } from "../../../libs/parse"
import { div, multiple } from "../../../libs/math"
import { tokenSymbol } from "../helper"

const valueModule = (value: any, withdrawableValue: any, tokenInfo: any) => {
  
  return (
    <div className={styles.value}>
      <div className={styles.header}>
        {decimal(
          formatAssetAmount(
            multiple(withdrawableValue?.withdrawableValue, SMALLEST),
            UST
          ),
          2
        )}{" "}
        UST
      </div>
      <div className={styles.sub}>
        <div>
          <span>{`${formatAssetAmount(
            multiple(decimal(div(value?.uusd?.amount, SMALLEST), 2), SMALLEST),
            UST
          )} ${tokenSymbol(value?.uusd?.token, tokenInfo)}`}</span>
        </div>
        <div>
          <span>{`${formatAssetAmount(
            multiple(decimal(div(value?.asset?.amount, SMALLEST), 2), SMALLEST),
            UST
          )} ${tokenSymbol(value?.asset?.token, tokenInfo)}`}</span>
        </div>
      </div>
    </div>
  )
}

export default valueModule
