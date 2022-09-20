import { bound } from "../../../components/Boundary"
import styles from "../DashboardHeader.module.scss"
import Count from "../../../components/Count"
import { useRecoilValue } from "recoil"
import { fetch24HourVolume, fetch7DaysVolume, fetchtotalVolume } from "../../../data/stats/contracts"
import { SMALLEST, UST } from "../../../constants"
import useDashboard, { StatsNetwork } from "../../../statistics/useDashboard"
import { div } from "../../../libs/math"
import LoadingPlaceholder from "../../../components/Static/LoadingPlaceholder"
import { decimal } from "../../../libs/parse"
import { statsStore } from "../../../data/API/dashboard"

const useVolume = () => {
  const last24HourVolume: any = useRecoilValue(fetch24HourVolume)
  const last7DayVolume:any = useRecoilValue(fetch7DaysVolume)
  const VolumeTotal:any = useRecoilValue(fetchtotalVolume)

  return {
    last24HourVolume,
    last7DayVolume,
    VolumeTotal
  }
}
const Volume = ({hour24, day7, total}:{hour24: string, day7: string, total?: string}) => {
  // const {VolumeTotal, last24HourVolume, last7DayVolume} = useVolume()
  // const { dashboard } = useDashboard(StatsNetwork.TERRA)
  const { volume } = useRecoilValue(statsStore)
  
  return bound(
    <>
      <span className={styles.dflex}>
        <span className={styles.volumetitle}>24Hour </span>
        <span className={styles.volume}>
        { bound(<Count>{decimal(div(volume.total, SMALLEST), 2)}</Count>, <LoadingPlaceholder size={"sm"} className={styles.loading} color={"lightGrey"} />)}
        </span>
        <span className={styles.volumeLabel}>{UST}</span>
      </span>
      <span className={styles.dflex}>
        <span className={styles.volumetitle}>7 Days </span>
        <span className={styles.volume}>
          <Count>{decimal(day7, 2)}</Count>
        </span>
        <span className={styles.volumeLabel}>{UST}</span>
      </span>
      <span className={styles.dflex}>
        <span className={styles.volumetitle}>Total</span>
        <span className={styles.volume}>
          <Count>{decimal(total, 2)}</Count>
        </span>
        <span className={styles.volumeLabel}>{UST}</span>
      </span>
    </>
  )
}

export default Volume
