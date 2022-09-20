import { bound } from "../../../components/Boundary"
import styles from "../DashboardHeader.module.scss"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"
import { div } from "../../../libs/math"
import { decimal } from "../../../libs/parse"
import Count from "../../../components/Count"
import { SMALLEST } from "../../../constants"
import classNames from "classnames"


const TotalValueLocked = ({amount}:{amount: string}) => {
  // const { max_apr, loading } = useAprRanges()
  
  return bound(amount && (
      <span className={styles.dflex}>
        <span className={classNames(styles.aprRange,styles.pL)}>
        <Count>{decimal(div(amount,SMALLEST), 2)}</Count>
        </span>
        <span className={styles.pL}>UST</span>
      </span>
    ),
    <LoadingPlaceholder size={"sm"} color={"black"} />
  )
}

export default TotalValueLocked
