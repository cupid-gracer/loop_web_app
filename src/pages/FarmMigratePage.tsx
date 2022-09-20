import { useEffect, useState } from "react"
import Card from "../components/Card"
import Grid from "../components/Grid"
import Steps from "../components/Static/Steps"
import { FarmContractTYpe } from "../data/farming/FarmV2"
import { getPath, MenuKey } from "../routes"
import { FarmWizard } from "./Farm/FarmWizard"
import Header from "./Farm/FarmWizard/Header"
import styles from "./FarmMigratePage.module.scss"
import harvest_icon from '../images/farm_migrate/harvest.svg'
import transactions_icon from '../images/farm_migrate/transactions.svg'
import farm_icon from '../images/farm_migrate/farm.svg'
import classNames from "classnames";

const queryString = require('query-string')

export const FarmMigrate = (Props:{lpToken: string, farmType: FarmContractTYpe, symbol: string, ticker: string, className?: string, sm?: boolean}) => {
    const { sm = false } = Props
    return <>
    <FarmWizard className={classNames(styles.mainbtn, Props?.className)} {...Props} title={sm ? "Migrate" : "Migration wizard"} path={getPath(MenuKey.FARM_MIGRATE)} />
  </>
}

const FarmMigratePage = () => {
    const [lpToken, setLpToken]  = useState('')
    const [ticker, setTicker]  = useState('')
    const [farmType, setFarmType]  = useState<FarmContractTYpe>(FarmContractTYpe.Farm2)
    
    useEffect(()=>{
        const  query= queryString.parse(window.location.search);

        if (query.lp) {
            setLpToken(query.lp)
        }
        if (query.ticker) {
            setTicker(query.ticker)
        }
        if (query.ticker) {
            setFarmType(query.type)
        }
        if (query.ticker) {
            setFarmType(query.type)
        }
    },[window.location.search, queryString])


    return  <article className={styles.component}>
      <Card className={styles.container}>
          <Header current="1" heading={"Farming Upgrade"} />
          <div className={styles.content}>
              <Steps current={'1'} />
              <div className={styles.form}>
                    <h1 className={styles.heading}>Unfarm and claim rewards</h1>
                    <h2 className={styles.h2}>Let's get you migrated to the new V3 Farms!</h2>
                    <Grid className={styles.highlight}>
                        <Grid className={styles.row}>
                            <span className={styles.line}><img src={harvest_icon} alt='harvest' height="20" /><span> You’ll have a button to Harvest rewards</span></span>
                        </Grid>
                        <Grid className={styles.row}>
                        <span className={styles.line}><img src={transactions_icon} alt='transactions' height="20" /><span> Option to auto daily compound to maximise APY</span></span>
                        </Grid>
                        {/*<Grid className={styles.row}>*/}
                        {/*    <span className={styles.line}><img src={farm_icon} alt='transactions' height="23" /><span className={styles.text}> Current farming rewards will not be lost, even if you have not reached the min farm period</span></span>*/}
                        {/*</Grid>*/}
                    </Grid>
                    <div className={styles.smallContainer}>
                        <div className={styles.small}>
                        <p >Use our simple 1 click migration tool - easy </p>
                        <p>*there may be some extra tokens remaining in your wallet at the end</p>
                        <p>... or have more control of the migration - advanced</p>
                        </div>
                    </div>
                    <div className={styles.btns}>
                        <FarmWizard  lpToken={lpToken} className={styles.btn} farmType={farmType} ticker={ticker} title="Easy" path={getPath(MenuKey.FARM_QUICK_MIGRATE)} />
                        <FarmWizard  lpToken={lpToken} className={styles.btn} farmType={farmType} ticker={ticker} title="Advanced" path={getPath(MenuKey.FARM_WIZARD)} />
                    </div>
              </div>
          </div>
      </Card>
  </article>
}

export default FarmMigratePage