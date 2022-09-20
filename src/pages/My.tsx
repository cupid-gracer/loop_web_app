import { Helmet } from "react-helmet"

import Page from "../components/Page"
import ConnectionRequired from "../containers/ConnectionRequired"
import useAddress from "../hooks/useAddress"
import Grid from "../components/Grid"
import Container from "../components/Container"
import styles from "./Page.module.scss"
import MyHoldingList from "./My/List/MyHoldingList"
import MyPoolList from "./My/List/MyPoolList"
import MyFarmUserStakeList, {
  MyFarmV3UserStakeList,
} from "./My/List/MyFarmUserStakeList"
import MyStakeList from "./My/List/MyStakeList"
import PortFolioAllAssets from "../components/PortfolioAllAssets/PortFolioAllAssets"
import PortFolioChart from "../components/PortfolioChart/PortFolioChart"
import { bound } from "../components/Boundary"
import chartStyles from "../components/PortfolioChart/PortFolioChart.module.scss"
import PortfolioAllAssetsLoading from "../components/Static/My/PortfolioAllAssetsLoading"
import PortfolioChartLoading from "../components/Static/My/PortfolioChartLoading"
import classNames from "classnames"
import Loop_icon from "../images/coins/loop_icon.svg"
import AUST from "../images/coins/aUST.png"
import ULUNA_icon from "../images/coins/luna.png"
import Ant_icon from "../images/coins/ant_icon.png"
import ATOM_icon from "../images/coins/ATOM.svg"
import { useRecoilValue } from "recoil"
import { cardsStore } from "../data/API/dashboard"
import { Link } from "react-router-dom"
import ExtLink from "../components/ExtLink"

const My = () => {
  const address = useAddress()
  const cardsData = useRecoilValue(cardsStore)
  // useTotalStakedByUser()
  // useAPRY()

  return (
    <>
      <Container>
        <div className={styles.bannerWrapper}>
          <Link to="/pool-v3">
            <span className={styles.dflex}>
              <h1 className={styles.heading}>
                Start Earning upto{" "}
                <span className={styles.highestApy}>
                  +{cardsData?.maxFarmingApr}%
                </span>{" "}
                APY with your Cryptocurrencies
              </h1>
              <span className={styles.marginLeft}>
                <img
                  src={Loop_icon}
                  alt={"Loop_icon"}
                  className={styles.icons}
                />
                <img src={AUST} alt={"AUST"} className={styles.icons} />
                <img
                  src={ULUNA_icon}
                  alt={"ULUNA_icon"}
                  className={styles.icons}
                />
                <img src={Ant_icon} alt={"Ant_icon"} className={styles.icons} />
                <img
                  src={ATOM_icon}
                  alt={"ATOM_icon"}
                  className={styles.icons}
                />
              </span>
            </span>
          </Link>
          <span className={styles.dflex}>
            <h1 className={styles.heading}>Learn more about DeFi</h1>
            <a href="https://learn.loop.markets/" target={"blank"}>
              <span className={styles.loopLearn}>
                <img
                  src={Loop_icon}
                  alt={"Loop_icon"}
                  className={styles.smallIcon}
                />
                Loop Learn
              </span>
            </a>
          </span>
        </div>
      </Container>
      <Grid>
        <Helmet>
          <title>Loop Markets | My Portfolio</title>
        </Helmet>
        <>
          {!address ? (
            <ConnectionRequired />
          ) : (
            <>
              <Container>
                <Grid>
                  <Grid className={styles.grid}>
                    {bound(
                      <PortFolioAllAssets />,
                      <div
                        className={classNames(
                          chartStyles.pieChart,
                          chartStyles.pieChartLoad
                        )}
                      >
                        <div className={chartStyles.wrapper}>
                          <PortfolioAllAssetsLoading />
                        </div>
                      </div>
                    )}
                  </Grid>
                  <Grid className={styles.grid}>
                    {bound(
                      <PortFolioChart />,
                      <div
                        className={classNames(
                          chartStyles.pieChart,
                          chartStyles.pieChartLoad
                        )}
                      >
                        <div className={chartStyles.wrapper}>
                          <PortfolioChartLoading />
                        </div>
                      </div>
                    )}
                  </Grid>
                </Grid>
                <Grid>
                  {/* <Card
        title={"Holdings"}
        headerClass={styles.header}
        description={<></>}
      >
         <TablePlaceholder />
          </Card> */}
                </Grid>
                <Grid>
                  <MyHoldingList />
                </Grid>
                <Grid>
                  <MyPoolList />
                </Grid>
                <Grid>
                  <MyPoolList version={2} />
                </Grid>
                <Grid>
                  <MyFarmUserStakeList />
                </Grid>
                <Grid>
                  <MyFarmV3UserStakeList />
                </Grid>
                <Grid>
                  <MyStakeList />
                </Grid>

                {/*<Grid>
            <HistoryList />
          </Grid>*/}
              </Container>
            </>
          )}
        </>
      </Grid>
    </>
  )
}

export default My
