import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Helmet } from "react-helmet"
import { TxResult } from "@terra-money/wallet-provider"

import Tooltip from "../../lang/Tooltip.json"
import useHash from "../../libs/useHash"
import Page from "../../components/Page"
import { useFetchTokens } from "../../hooks"
import Grid from "../../components/Grid"
import { PostError } from "../../forms/CustomMsgFormContainer"
import Result from "../../forms/Result"
import Container from "../../components/Container"
import usePoolReceipt from "../../forms/receipts/usePoolReceipt"
import styles from "./Stake.module.scss"
import { TooltipIcon } from "../../components/Tooltip"

import wheelActive from "../images/stake/wheel-active.svg"
import wheelUnActive from "../images/stake/wheel-unactive.svg"
import thumbUpActive from "../images/stake/thumb-up-active.svg"
import thumbUpUnActive from "../images/stake/thumb-up-unactive.svg"
import bookActive from "../images/stake/book-active.svg"
import bookUnActive from "../images/stake/book-unactive.svg"

import Summary from './components/Summary'
import SummaryVote from './components/SummaryVote'
import IconLoopShadow from '../../images/stake/loop-shadow.svg'
import USTFlag from '../../images/stake/ust-flag.svg'
import Card from "../../components/Card"
import FarmPannels from './components/vote/FarmPannels'
import DelegateVoteWeight from './components/vote/DelegateVoteWeight'

const Vote = () => {
  return (
    <>
      <div className={styles.summaryBoard}>
        <div className={styles.summaryCol}>
          <SummaryVote icon1={IconLoopShadow} value1={"1"} icon2={USTFlag} value2={"1.2321"} />
        </div>
        <div className={styles.summaryCol}>
          <div className={styles.summaryRow}>
            <Summary title="LOOP Power From Staking" value="82,400.67 "  />
            <Summary title="LOOP Power From NFTs" value="123,699"  style={{marginRight:"0"}} />
          </div>
          <div className={styles.summaryRow}>
            <Summary title="Your LOOP Power" value="123,699" subValue="/1.23m" icon={IconLoopShadow}/>
            <Summary title="Percentage of LOOP Power" value="0.2312" subValue="%" style={{marginRight:"0"}} />
          </div>
        </div>
      </div>
      <Grid className={styles.stakeInfo}>
        <FarmPannels />
      </Grid>
      <Grid className={styles.myStakedLoop}>
        <DelegateVoteWeight />
      </Grid>
    </>
  )
}

export default Vote
