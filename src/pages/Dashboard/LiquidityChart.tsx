import { UST, UUSD } from "../../constants"
import Tooltip from "../../lang/Tooltip.json"
import { formatAssetAmount, lookupSymbol } from "../../libs/parse"
import { calcChange } from "../../statistics/useYesterday"
import Card from "../../components/Card"
import Summary from "../../components/Summary"
import ChartContainer from "../../containers/ChartContainer"
import { TooltipIcon } from "../../components/Tooltip"
import Price from "../../components/Price"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import { Loading, toDatasets } from "./DashboardCharts"
import { bound } from "../../components/Boundary"
import styles from './LiquidityChart.module.scss'
import { useRecoilValue } from "recoil"
import { statsStore } from "../../data/API/dashboard"
import { useEffect, useState } from "react"

const LiquidityChart = (props?: Partial<Dashboard>) => {
  // const { liquidityHistory } = props
  const { liquidity } = useRecoilValue(statsStore)

  const { list } = liquidity
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
              <TooltipIcon content={Tooltip.Chart.Liquidity}>
                Liquidity
              </TooltipIcon>
              { list && list.length > 0 ? (
                <Price
                  price={formatAssetAmount(
                    list && list.length > 0 ? list[list.length -1]?.value : "0",
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
          { bound (<ChartContainer
            change={
              list && list.length >= 2
                ? calcChange({
                    yesterday:
                    list[list.length - 2]?.value,
                    today: list[list.length - 1]?.value,
                  })
                : undefined
            }
            fmt={{ t: "EEE dd LLL, yy" }}
            symbol={lookupSymbol(UUSD)}
            datasets={list && list.length > 0 ? toDatasets(list, UST) : []}
          />,  <Loading />) 
          }
        </Summary>
      </Card>
}

export default LiquidityChart