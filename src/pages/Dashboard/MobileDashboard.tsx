import Tooltip from "../../lang/Tooltip.json"
import Grid from "../../components/Grid"
import Card from "../../components/Card"
import Summary from "../../components/Summary"
import { TooltipIcon } from "../../components/Tooltip"
import loop_price_icon from "../../images/icons/dashboard/loop_price.svg"
import fees_icon from "../../images/icons/dashboard/fees.svg"
import transactions_icon from "../../images/icons/dashboard/transactions.svg"
import { bound } from "../../components/Boundary"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import FARMING_APR_ICON from "../../images/Pig.svg"
import TVL_ICON from "../../images/icons/Safe_Lock.svg"
import BRICKS_ICON from "../../images/Bricks.png"
import CLOCK_ICON from "../../images//Clock.svg"
import FarmingAPR from "./Header/FarmingAPR"
import Transactions from "./Header/Transactions"
import Volume from "./Header/Volume"
import CirMarketCap from "./Header/CirMarketCap"
import { CirculatingSupply } from "./Header/CirMarketCap"
import ProgressLoading from "../../components/Static/ProgressLoading"
import { useRecoilValue } from "recoil"
import { cardsStore, statsStore } from "../../data/API/dashboard"
import FarmingRunway from "./Header/FarmingRunway"
import classNames from "classnames/bind"
import LoopPriceChart from "./DashboardStatsCharts/LoopPriceChart"
import VolumeChart from "./VolumeChart"
import useDashboard, { StatsNetwork } from "../../statistics/useDashboard"
import TopTrading from "./TopTrading"
import styles from "./MobileDasboard.module.scss"
import TotalValueLocked from "./Header/TotalValueLocked"

export const Loading = () => {
  return (
    <div className={styles.loading}>
      <ProgressLoading />
    </div>
  )
}

const MobileDashboard = () => {
  const { dashboard } = useDashboard(StatsNetwork.TERRA)
  const { liquidity } = useRecoilValue(statsStore)
  const { total } = liquidity

  const cardsData = useRecoilValue(cardsStore)

  return (
    <>
        <Grid className={classNames(styles.CzcardGrid,styles.styling)}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={TVL_ICON}
              title={
                <TooltipIcon content={"Total Value Locked"}>
                  Total Value Locked{" "}
                </TooltipIcon>
              }
            >
              {bound(
                <TotalValueLocked amount={total ?? "0"} />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>
      <Grid className={styles.chart_container}>
        <Card>{bound(<LoopPriceChart />, <Loading />)}</Card>
        <span className={styles.row}>
          {bound(
            <VolumeChart {...dashboard} />,
            <LoadingPlaceholder size={"sm"} color={"lightGrey"} />
          )}
        </span>
      </Grid>
      <Grid>
        <TopTrading />
      </Grid>
      <Grid>
        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={FARMING_APR_ICON}
              title={
                <TooltipIcon content={"Farming APY"}>Farming APY</TooltipIcon>
              }
            >
              {bound(
                <FarmingAPR amount={cardsData?.maxFarmingApr ?? "0"} />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>

        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={transactions_icon}
              title={
                <TooltipIcon content={Tooltip.Dashboard.Transactions}>
                  Transactions
                </TooltipIcon>
              }
            >
              {bound(
                <Transactions
                  transactions={cardsData?.last24Hourstransactions}
                />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>

        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={fees_icon}
              title={
                <TooltipIcon content={Tooltip.Dashboard.TotalValueLocked}>
                  Volume
                </TooltipIcon>
              }
            >
              {bound(
                <Volume
                  day7={cardsData?.volume7Days}
                  hour24={cardsData?.volume24Hour}
                  total={cardsData?.totalVolume}
                />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>

        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={CLOCK_ICON}
              title={
                <TooltipIcon content={"Current Month Loop Cir Market Cap"}>
                  Cir. Market Cap
                </TooltipIcon>
              }
            >
              {bound(
                <CirMarketCap amount={cardsData?.circulatingMarketCap} />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>

        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={loop_price_icon}
              title={
                <TooltipIcon content={"Current Month Loop Circulating Supply"}>
                  Circulating Supply
                </TooltipIcon>
              }
            >
              {bound(
                <CirculatingSupply
                  amount={cardsData?.circulatingSupply ?? "0"}
                />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>

        <Grid className={styles.CzcardGrid}>
          <Card className={styles.card} mainSectionClass={styles.card_main}>
            <Summary
              labelClassName={styles.label}
              icon={BRICKS_ICON}
              title={
                <TooltipIcon content={"Days Passed Since Farming"}>
                  Farming Runway
                </TooltipIcon>
              }
            >
              {bound(
                <FarmingRunway />,
                <LoadingPlaceholder
                  size={"sm"}
                  className={styles.loading}
                  color={"lightGrey"}
                />
              )}
            </Summary>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default MobileDashboard
