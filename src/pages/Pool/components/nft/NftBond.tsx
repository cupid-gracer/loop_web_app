import styles from "./nftBond.module.scss"
import NFT_BADGE from "../../../../images/NFT_BADGE.svg"
import { decimal } from "../../../../libs/parse"
import Tooltip, { TooltipIcon } from "../../../../components/Tooltip"
import classNames from "classnames"

const NftBondCard = ({ apr }) => {
  // +{decimal(apr?.APR, 2)}% APR 
  return (
    <Tooltip content={"Coming Soon"} alignTextToLeft={true} >
      <div className={styles.component}>
        <span className={styles.apySection}>
          <span className={styles.textDesign}>Mint NFT</span>
          <span className={classNames(styles.apr,styles.textDesign)}>Coming Soon</span>
        </span>
        <span>
          <img src={NFT_BADGE} alt={NFT_BADGE} style={{ paddingLeft: "4px",paddingTop:'4px' }} />
        </span>
      </div>
    </Tooltip>
  )
}

export default NftBondCard
