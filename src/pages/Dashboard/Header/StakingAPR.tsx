import { bound } from "../../../components/Boundary"
import { useStakingApr } from "../helper"
import styles from "../DashboardHeader.module.scss"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"

// const useAPR = () => {
//   const staking_apr = useStakingApr()
//   return {
//     max_apr:  staking_apr ? staking_apr.max : '',
//     min_apr:  staking_apr ? staking_apr.min : '',
//     loading:  !staking_apr
//   }
// }

const StakingAPR = ({max_apr}:{max_apr: string | number}) => {
  // const { max_apr, loading } = useAPR()

  return bound(
    <span className={styles.dflex}>
      <span className={styles.title}>up to</span>
      <span className={styles.aprRange}>{max_apr}</span>
      <span>%</span>
    </span>,
    <LoadingPlaceholder size={"sm"} color={"black"} />
  )
}

export default StakingAPR
