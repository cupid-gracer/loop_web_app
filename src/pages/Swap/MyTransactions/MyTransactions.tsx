import SwapTable from "../TopSwap/SwapTable"
import {bound} from "../../../components/Boundary"
import styles from "./MyTransactions.module.scss"
import Card from "../../../components/Card"

const MyTransactions = ({pairAddress,updateTransactions}) => {
  return (
    <div className={styles.tradingTable}>
      <Card title={'My Transactions'} >
          { bound(<SwapTable showOnlyMyTransactions={true} pairAddress={pairAddress} updateTransactions={updateTransactions} />)}
          </Card>
    </div>
  )
}

export default MyTransactions