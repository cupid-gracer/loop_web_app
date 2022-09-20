import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Helmet } from "react-helmet"
import { TxResult } from "@terra-money/wallet-provider"

import Tooltip from "../lang/Tooltip.json"
import useHash from "../libs/useHash"
import Page from "../components/Page"
import PoolDynamicForm from "../forms/PoolDynamicForm"
import { useFetchTokens } from "../hooks"
import Grid from "../components/Grid"
import { PostError } from "../forms/CustomMsgFormContainer"
import Result from "../forms/Result"
import Container from "../components/Container"
import usePoolReceipt from "../forms/receipts/usePoolReceipt"
import styles from "./LoopStakeNew.module.scss"
import TopTrading from "./Dashboard/TopTrading"
import PoolWithPoolList from "../containers/PoolWithPoolList"

import wheelActive from "../images/stake/wheel-active.svg"
import wheelUnActive from "../images/stake/wheel-unactive.svg"
import thumbUpActive from "../images/stake/thumb-up-active.svg"
import thumbUpUnActive from "../images/stake/thumb-up-unactive.svg"
import bookActive from "../images/stake/book-active.svg"
import bookUnActive from "../images/stake/book-unactive.svg"

import Stake from './Stake_/Stake'
import Vote from './Stake_/Vote'
import Learn from './Stake_/Learn'

const LoopStakeNew = () => {

  const [activeNumber, setActiveNumber] = useState(1)

  const switchs = [
    {
      id: 1,
      imgActive: wheelActive,
      imgUnActive: wheelUnActive,
      text: 'Stake',
      page:<Stake/>
    },
    {
      id: 2,
      imgActive: thumbUpActive,
      imgUnActive: thumbUpUnActive,
      text: 'Vote',
      page:<Vote/>

    },
    {
      id: 3,
      imgActive: bookActive,
      imgUnActive: bookUnActive,
      text: 'Learn',
      page:<Learn/>

    }
  ];


  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | Stake</title>
      </Helmet>
      <Page>
        <div className={styles.stakePage}>
          <ul className={styles.switchPages}>
            {
              switchs.map((item, index) => {
                return (
                  <li key={index} className={`${styles.switchBtn}  ${activeNumber == item.id ? styles.active : ""}`} onClick={() => setActiveNumber(item.id)}>
                    <img src={activeNumber == item.id ?item.imgActive:item.imgUnActive} />
                    <span>{item.text}</span>
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div>
          {
            switchs.map((item, index)=>{
              if(activeNumber == item.id) return <div key={index}>
               {item.page}
              </div>
            })
          }
        </div>
      </Page>
    </Grid>
  )
}

export default LoopStakeNew
