import { useState, useEffect } from "react"
import { Table, Button } from "semantic-ui-react"

import Grid from "../../../../components/Grid"
import Card from "../../../../components/Card"
import { TooltipIcon } from "../../../../components/Tooltip"
import styles from "./vote.module.scss"


const DelegateVoteWeight = () => {
    const [expand, setExpand] = useState(false)
    return <>
        <Card className={styles.card} >
            <Grid className={styles.panelHeader}>
                <TooltipIcon content={'Hello'} className={styles.panelTitle}>
                    <p>Delegate Vote Weight</p>
                </TooltipIcon>
            </Grid>
            <div className={styles.panelBody}>

                <div>You Are Currentely Delegate To</div>
                <div>
                    <span>0xd533a949740bb3306d119cc777fa900ba034cd52</span>
                    <Button>Clear</Button>
                </div>
                <div>
                    <Button>Delegate To Address</Button>
                    <Button>Delegate To Loop</Button>
                    <Button>Sell Your Vote Weight</Button>
                </div>
            </div>
        </Card>
    </>
}

export default DelegateVoteWeight