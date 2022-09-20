import { Helmet } from "react-helmet"
import { useEffect, useState } from "react"

import useDashboard, { StatsNetwork } from "../statistics/useDashboard"
import Page from "../components/Page"
import Grid from "../components/Grid"
import DashboardHeader from "./Dashboard/DashboardHeader"
import TopTrading from "./Dashboard/TopTrading"
import styles from "./Gov/GovHomeHeader.module.scss"
import Container from "../components/Container"
import { DashboardWrappper } from "./Dashboard/DashboardCharts"
import DashboardExchange from "../components/V2Dashboard/DashboardExchange"
import CompateAllPairsChart from "./Dashboard/DashboardStatsCharts/CompareAllPairsChart"
import MobileDashboard from "./Dashboard/MobileDashboard"

const Dashboard = () => {
  const [collapseAble, setCollapseAble] = useState(true)
  


  return (
    <Container>
      <Grid>
        <Helmet>
          <title>Loop Markets | Dashboard</title>
        </Helmet>
        {window.innerWidth < 768 ? 
        (<>
          <Page>
          <Container>
          <MobileDashboard/>
          </Container>
          </Page>

        </>)
        :
        (
          <Page>
          <Container>
            <Grid>
              <div className={styles.sm}>
                <DashboardHeader collapseAble={collapseAble} />
              </div>

              <div className={styles.lg}>
                <DashboardWrappper
                  collapseAble={collapseAble}
                  setCollapseAble={setCollapseAble}
                />
              </div>
            </Grid>
            <Grid>
              <TopTrading />
            </Grid>
            <Grid>{/* <Article /> */}</Grid>
          </Container>
        </Page>
        )

        }
      </Grid>
    </Container>
  )
}

export default Dashboard
