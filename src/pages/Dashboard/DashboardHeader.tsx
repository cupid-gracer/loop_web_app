import Tooltip from "../../lang/Tooltip.json"
import Grid from "../../components/Grid"
import Card from "../../components/Card"
import Summary from "../../components/Summary"
import { TooltipIcon } from "../../components/Tooltip"
import styles from "./DashboardHeader.module.scss"
import loop_price_icon from "../../images/icons/dashboard/loop_price.svg"
import fees_icon from "../../images/icons/dashboard/fees.svg"
import transactions_icon from "../../images/icons/dashboard/transactions.svg"
import { bound } from "../../components/Boundary"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import DashboardExchange from "../../components/V2Dashboard/DashboardExchange"
import FARMING_APR_ICON from "../../images/Pig.svg"
import STAKING_APR_ICON from "../../images/icons/staking.svg"
import BRICKS_ICON from "../../images/Bricks.png"
import Safe_Lock_ICON from "../../images/icons/Safe_Lock.svg"
import CLOCK_ICON from "../../images//Clock.svg"
import FarmingAPR from "./Header/FarmingAPR"
import StakingAPR from "./Header/StakingAPR"
import Transactions from "./Header/Transactions"
import Volume from "./Header/Volume"
import TransactionsFee from "./Header/TransactonsFee"
import CirMarketCap from "./Header/CirMarketCap"
import { CirculatingSupply } from "./Header/CirMarketCap"
import ProgressLoading from "../../components/Static/ProgressLoading"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import { cardsStore } from "../../data/API/dashboard"
import FarmingRunway from "./Header/FarmingRunway"
import classNames from "classnames/bind"

// interface Props extends Partial<Dashboard> {
//   network: StatsNetwork
// }
export enum Type {
  "SWAP" = "Swap",
  "SELL" = "sell",
}

const DashboardHeader = ({ collapseAble }: { collapseAble?: boolean }) => {
  const [changed, setChanged] = useState<Boolean>(false)

  const formUpdated = (status: boolean) => setChanged(status)
  const cardsData = useRecoilValue(cardsStore)

  return (
    <>
    {collapseAble ? 
      (
        <div style={{ marginBottom: "10px" }}>
          <DashboardExchange
            formUpdated={formUpdated}
            collapseAble={collapseAble}
          />
      </div>
      )
      :
      (
        <div style={{ marginBottom: "10px" }}>
        {bound(
          <DashboardExchange
            formUpdated={formUpdated}
            collapseAble={collapseAble}
          /> ,
          <Card title="swap">
            <div className={styles.blankSwapContainer}>
              <ProgressLoading />
            </div>
          </Card> 
        )}
      </div>
      )

    }
      
      <span className={classNames(collapseAble ? styles.enableCollapse : styles.disableCollapse)} >
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
      </span>
      <Grid className={styles.CzcardGrid}>
        <Card className={styles.card} mainSectionClass={styles.card_main}>
          <Summary
            labelClassName={styles.label}
            icon={STAKING_APR_ICON}
            title={
              <TooltipIcon content={"Staking APR"}>Staking APR</TooltipIcon>
            }
          >
            {bound(
              <StakingAPR max_apr={cardsData?.maxStakingApr} />,
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
            icon={fees_icon}
            title={
              <TooltipIcon content={Tooltip.Dashboard.Fee}>
                Trading Fees
              </TooltipIcon>
            }
          >
            {bound(
              <TransactionsFee fee={cardsData?.tradingFee} />,
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

      {!changed && (
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
      )}
      {/* {collapseAble && (
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
      )} */}

       {
       collapseAble && 
       <Grid className={styles.CzcardGrid}>
       <Card className={styles.card}>
         <Summary
           labelClassName={styles.label}
           icon={Safe_Lock_ICON}
           title={
             <TooltipIcon content={"To Be Done"}>
               Protocol Owned Liquidity
             </TooltipIcon>
           }
         >
           <span className={styles.aprRange}>TBD</span>
         </Summary>
       </Card>
     </Grid>
     }

      {/* <Grid>
        <Card className={styles.card}>
          <Summary
            labelClassName={styles.label}
            icon={community_pool_icon}
            title={
              <TooltipIcon content={Tooltip.Dashboard.CommunityPoolBalance}>
                Community Pool Balance
              </TooltipIcon>
            }
          >
            <Count symbol={LOOP} integer className={styles.count} priceClass={styles.price}>
              {communityBalance}
            </Count>
          </Summary>
        </Card>
      </Grid> */}
    </>
  )
}

export default DashboardHeader
