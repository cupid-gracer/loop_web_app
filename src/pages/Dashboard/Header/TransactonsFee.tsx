import { bound } from "../../../components/Boundary"
import styles from "../DashboardHeader.module.scss"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"
import Count from "../../../components/Count"
import { SMALLEST, UST } from "../../../constants"
import { gt, multiple } from "../../../libs/math"

// const useTransactionsFee = () => {
//   const totalVolume = useTotalVolume()

//   return {
//     totalVolume:  totalVolume ?? "0",
//   }
// }

const TransactionsFee = ({fee}:{ fee: string}) => {
  // const { totalVolume  } = useTransactionsFee()
  // const totalFee = "3100000"
  return bound(
    gt(fee, "0") ? (
      <>
        <Count
          symbol={UST}
          className={styles.count}
          priceClass={styles.price}
        >
          {multiple(fee, SMALLEST)}
        </Count>
        <span className={styles.footer}>
          <Count>
            {multiple(
              fee,
              0.25
            )}
          </Count>{" "}
          <span className={styles.label} style={{paddingLeft:'4px'}}>to LOOP Stakers</span>
        </span>
        <span className={styles.footer}>
          <Count>
            {multiple(
              fee,
              0.75
            )}
          </Count>{" "}
          <span className={styles.label} style={{paddingLeft:'4px'}}>to LP Providers</span>
        </span>
      </>
    ) : (
      <LoadingPlaceholder className={styles.loading} size={"sm"} color={"lightGrey"} />
    ),
    <LoadingPlaceholder className={styles.loading} size={"sm"} color={"lightGrey"} />
  )
}

export default TransactionsFee
