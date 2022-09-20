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

import wheelActive from "../images/stake/wheel-active.svg"
import wheelUnActive from "../images/stake/wheel-unactive.svg"
import thumbUpActive from "../images/stake/thumb-up-active.svg"
import thumbUpUnActive from "../images/stake/thumb-up-unactive.svg"
import bookActive from "../images/stake/book-active.svg"
import bookUnActive from "../images/stake/book-unactive.svg"

const Learn = () => {
  return (
  <>
  Learn
  </>
  )
}

export default Learn
