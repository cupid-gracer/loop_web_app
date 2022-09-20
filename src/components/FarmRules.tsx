import { useState } from "react"

import styles from "./FarmRules.module.scss"
import Grid from "./Grid"
import Card from "./Card"
import Button from "./Button"
import { TooltipIcon } from "./Tooltip"

const FarmRules = () => {

  const [show, setShow] = useState(false)
  const toggle = () => {
    setShow(!show)
  }

  return (
    <div>
      <Grid>
        <div className={styles.tooltip_container}>
          <Button className={styles.toggle_btn} onClick={()=> toggle()}>{ show && 'Hide'} How Farming Works  <TooltipIcon className={styles.tooltip} content={' How Farming Works'} /></Button>
         
        </div>
      </Grid>
      {
        show && <Card className={styles.rules_card}>
          <h2>How Farming Works</h2>
          <br />
          <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start'}}>
            <p>- Rewards Start Accumulating: immediately.</p>
            <p>- Harvest Button: harvest rewards when min farm period has been reached.</p>
            <p>- Rewards Distributed: every 6 Hours.</p>
            <p>- "Next Reward" Timer: estimated rewards building up to the next 6 Hour distribution.</p>
            <p>- Minimum Staking Period: 24hrs before rewards can be claimed, but you can withdraw any time, without claiming your rewards.</p>
            <p>- APY Value: Based on users who enable "Auto Daily Compounding".</p>
            <p>- Auto Compounding Farm Period: the minimum farm period before harvesting daily compounded farm rewards is 3 months. This min farm period will not reset when adding to your existing farm position.</p>
            <p>- Adding To Your Current Farm Position: 24hrs timer will reset if you add more to your current farm unless "Auto Compounding" is enabled</p>
            <p>- Audited: Both internally and by several reputable third parties.</p>
          </div>
        </Card>
      }
    </div>
  )
}

export default FarmRules
