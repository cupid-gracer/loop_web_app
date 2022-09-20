import {commas, decimal} from "../../libs/parse"
import {CardPlaceholder, StakingAPIKeys} from "../LoopStake"
import {useLOOPPrice} from "../../data/contract/normalize"
import Summary from "../../components/Summary"
import styles from "../LoopStake.module.scss"
import iconLogo2 from "../../images/icons/totalProfit.svg"
import {TooltipIcon} from "../../components/Tooltip"

import Card from "../../components/Card"
import {bound} from "../../components/Boundary"

const StakeCards = ({stakingList}:{stakingList: any}) => {

  const { contents: loopPrice } = useLOOPPrice();
  
  const cards = [
    <Summary
        labelClassName={styles.label}
        icon={iconLogo2}
        title={
          <TooltipIcon
              className={styles.tooltipNew}
              content="12 Month APR"
          >
            12 Month APR
          </TooltipIcon>
        }
    >
      <span className={styles.count}>{commas(decimal(stakingList[StakingAPIKeys["12MON"]]?.stakingApr,2))}</span>
      <span className={styles.price}>%</span>
    </Summary>,
    <Summary
        labelClassName={styles.label}
        icon={iconLogo2}
        title={
          <TooltipIcon
              className={styles.tooltipNew}
              content="18 Month APR"
          >
            18 Month APR
          </TooltipIcon>
        }
    >
      <span className={styles.count}>{commas(decimal(stakingList[StakingAPIKeys["18MON"]]?.stakingApr,2))}</span>
      <span className={styles.price}>%</span>
    </Summary>,
    <Summary
        labelClassName={styles.label}
        icon={iconLogo2}
        title={
          <TooltipIcon
              className={styles.tooltipNew}
              content="3 Month APR"
          >
            3 Month APR
          </TooltipIcon>
        }
    >
      <span className={styles.count}>{commas(decimal(stakingList[StakingAPIKeys["3MON"]]?.stakingApr,2))}</span>
      <span className={styles.price}>%</span>
    </Summary>,
    <Summary
        labelClassName={styles.label}
        icon={iconLogo2}
        title={
          <TooltipIcon
              className={styles.tooltipNew}
              content="Current LOOP Price"
          >
            LOOP Price
          </TooltipIcon>
        }
    >
      <span className={styles.count}>{decimal(loopPrice, 3)}</span>
      <span className={styles.price}>UST</span>
    </Summary>
  ]

  return <>
    {
      bound(cards.map((content) => {
      return <Card className={styles.card}>
        {bound(content, <CardPlaceholder/>)}
      </Card>
      }), CardPlaceholder)
    }
  </>
}

export default StakeCards
