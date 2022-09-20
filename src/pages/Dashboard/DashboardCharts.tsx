import { lookup } from "../../libs/parse"
import Grid from "../../components/Grid"
import Card from "../../components/Card"
import styles from "./DashboardChart.module.scss"
import { lte } from "../../libs/math"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import CompateAllPairsChart from "./DashboardStatsCharts/CompareAllPairsChart"
import LoopPriceChart from "./DashboardStatsCharts/LoopPriceChart"
import LiquidityChart from "./LiquidityChart"
import VolumeChart from "./VolumeChart"
import { bound } from "../../components/Boundary"
import useDashboard, { StatsNetwork } from "../../statistics/useDashboard"
import ProgressLoading from "../../components/Static/ProgressLoading"
import classNames from "classnames"

export const Loading = () => {
  return (
    <div className={styles.loading}>
      <ProgressLoading />
    </div>
  )
}

export const DashboardWrappper = ({
  collapseAble,
  setCollapseAble,
}: {
  collapseAble?: boolean
  setCollapseAble?: any
}) => {
  const { dashboard } = useDashboard(StatsNetwork.TERRA)
  return (
    <DashboardCharts
      {...dashboard}
      collapseAble={collapseAble}
      setCollapseAble={setCollapseAble}
    />
  )
}
const DashboardCharts = (props: Partial<Dashboard>) => {
  return (
    <>
      <Grid className={styles.chart_container}>
      <span className={classNames(styles.row, styles.firstChart)}>
          {bound(
            <Card className={styles.maxCard}>
              <CompateAllPairsChart
                collapseAble={props.collapseAble}
                setCollapseAble={props.setCollapseAble}
              />
            </Card>,
            <Card className={styles.maxCard}>
              <LoadingPlaceholder size={"sm"} color={"lightGrey"} />
            </Card>
          )}
        </span>
        <Card>{bound(<LoopPriceChart />, <Loading />)}</Card>
        <span className={styles.row}>
          <LiquidityChart />
        </span>
        <span className={styles.row}>
          {bound(
            <VolumeChart {...props} />,
            <LoadingPlaceholder size={"sm"} color={"lightGrey"} />
          )}
        </span>
        
      </Grid>
    </>
  )
}

export default DashboardCharts

/* helpers */
export const toDatasets = (data: ChartItem[], symbol?: string) =>
  data
    ?.filter(({ timestamp, value }) => !lte(value, "0"))
    .map(({ timestamp, value }) => {
      return { t: timestamp, y: lookup(value, symbol, { integer: true }) }
    })
