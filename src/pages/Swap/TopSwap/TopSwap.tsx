import SwapTable from "./SwapTable"
import {bound} from "../../../components/Boundary"
import styles from "./TopSwap.module.scss"
import Card from "../../../components/Card"

const TopSwap = ({pairAddress,updateTransactions}) => {
  return (
    <div className={styles.tradingTable}>
      <Card title={'Latest Transactions'} >
          { bound(<SwapTable showOnlyMyTransactions={false} pairAddress={pairAddress} updateTransactions={updateTransactions} />)}
          </Card>
    </div>
  )
}

export default TopSwap