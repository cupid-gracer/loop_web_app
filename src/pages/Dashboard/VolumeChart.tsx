import { UST, UUSD } from "../../constants"
import Tooltip from "../../lang/Tooltip.json"
import { formatAssetAmount, lookupSymbol } from "../../libs/parse"
import Card from "../../components/Card"
import Summary from "../../components/Summary"
import ChartContainer from "../../containers/ChartContainer"
import { TooltipIcon } from "../../components/Tooltip"
import Price from "../../components/Price"
import { gt } from "../../libs/math"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import { toDatasets } from "./DashboardCharts"
import { bound } from "../../components/Boundary"
import ProgressLoading from "../../components/Static/ProgressLoading"
import styles from './VolumeChart.module.scss'
import { statsStore } from "../../data/API/dashboard"
import { useRecoilValue } from "recoil"
import { useEffect, useState } from "react"

const VolumeChart = (props?: Partial<Dashboard>) => {
  // const { latest24h, tradingVolumeHistory } = props
  const { volume } = useRecoilValue(statsStore)
  const { list, total } = volume

  const [currentTime, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <Card className={styles.container}>
  <Summary
    title={
      <>
        <TooltipIcon content={Tooltip.Chart.Volume}>Volume</TooltipIcon>
        {gt(total ?? "0", "0") ? (
          <Price
            price={formatAssetAmount(
              total,
              lookupSymbol(UUSD)
            )}
            symbol={lookupSymbol(UUSD)}
          />
        ) : (
          <LoadingPlaceholder size={"sm"} color={"lightGrey"} />
        )}
      </>
    }
    className={styles.summary}
  >
    { bound(<ChartContainer
      fmt={{ t: "EEE dd LLL, yy" }}
      datasets={
        list && list.length > 0 ? toDatasets(list, UST) : []
      }
      symbol={lookupSymbol(UUSD)}
      bar
    /> ,  <ProgressLoading />) }
  </Summary>
</Card>
}

export default VolumeChart