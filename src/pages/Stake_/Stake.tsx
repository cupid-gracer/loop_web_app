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
import ImgStakeLoop from '../../images/stake/stake-loop.svg'
import Card from "../../components/Card"
import StakeInfo from './components/StakeInfo'
import MyStakedLoop from './components/MyStakedLoop'

const Stake = () => {
  return (
  <>
    <Grid className={styles.summary}>
      <Summary title="Total Staked" value="107.400" icon={ImgStakeLoop}/>
      <Summary title="Average APR" value="124.45" subValue="%"/>
      <Summary title="Avaluable to Stake" value="82,400.67" icon={ImgStakeLoop}/>
      <Summary title="Total Staked Value" value="$82,400.67" style={{marginRight:"0"}}/>
    </Grid>
    <Grid className={styles.stakeInfo} >
      <StakeInfo/>
    </Grid>
    <Grid className={styles.myStakedLoop}>
      <MyStakedLoop/>
    </Grid>
</>
  )
}

export default Stake
