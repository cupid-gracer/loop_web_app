import {div, gt} from "../../libs/math"
import {commas, decimal} from "../../libs/parse"
import {UST} from "../../constants"
import styles from "../../components/FarmStake.module.scss"
import classnames from "classnames"
import {useLOOPPrice} from "../../data/contract/normalize";

const CalculateTVL = ({ tvl, expanded }: {
  tvl: string,
    expanded?: boolean
  // user_rewards:  DistributableTokensByPool[] | undefined
}) => {
    const { contents: loopPrice} = useLOOPPrice()
    const price = decimal(loopPrice, 6)
    const totalLoop = div(tvl, price)
  // const price = useCalculateUserPrice(user_rewards)
  // const calPrice = price.flat() && price.flat().length > 0 ? price.flat().reduce((a, b) => plus(a, b)) : "0"
  return (
    <div className={classnames(styles.price, styles.white)}>
      <span>{ commas(decimal(tvl,2))}</span> <span className={styles.whiteSm}>{ UST }</span>
        { expanded && (gt(totalLoop, '0') && <p className={styles.sm}>{commas(decimal(totalLoop, 2))} LOOP</p>) }
    </div>
  )
}

export default CalculateTVL
