import { bound } from "../../../components/Boundary"
import styles from "../DashboardHeader.module.scss"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"
import Count from "../../../components/Count"
import useDashboard, { StatsNetwork } from "../../../statistics/useDashboard"
import { gt } from "../../../libs/math"

// const useTransactions = () => {
//   const { dashboard } = useDashboard(StatsNetwork.TERRA)
//   return {
//     latest24h: dashboard ? dashboard.latest24h : undefined
//   }
// }

const Transactions = ({ transactions}:{transactions: string | number}) => {
  // const { latest24h } = useTransactions()

  return bound(gt(transactions ?? "0", "0") ? (
    <span className={styles.dflex}>
      <Count
        integer
        className={styles.count}
        priceClass={styles.price}
      >
        {transactions.toString()}
      </Count>
      {/* <span className={styles.transactionDays}> 7 Days </span> */}
    </span>
  ) : (
    <LoadingPlaceholder size={"sm"} className={styles.loading} color={"lightGrey"} />
  ),
  <LoadingPlaceholder size={"sm"} className={styles.loading} color={"lightGrey"} />
  )
}

export default Transactions
