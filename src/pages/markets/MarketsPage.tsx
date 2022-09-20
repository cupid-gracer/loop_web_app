import { useState } from "react"
import { TxResult } from "@terra-money/wallet-provider"
import { useLocation } from "react-router-dom"
import { Helmet } from "react-helmet"
import classnames from "classnames";

import Tooltip from "../../lang/Tooltip.json"
import useHash from "../../libs/useHash"
import Page from "../../components/Page"
import ExchangeForm from "../../forms/Exchange/ExchangeForm"
import Grid from "../../components/Grid"
import Flex from "../../components/Flex"
import Container from "../../components/Container"
import Result from "../../forms/Result"
import { PostError } from "../../forms/CustomMsgFormContainer"
import useSwapReceipt from "../../forms/receipts/useSwapReceipt"
import { useFetchTokens } from "../../hooks"
import { LOOP } from "../../constants"
import styles from "./Exchange.module.scss"
import { useFindTokenDetails } from "../../data/form/select"
import {useTokenMethods} from "../../data/contract/info"
import {useProtocol} from "../../data/contract/protocol"
import CompateAllPairsChart from "../Dashboard/DashboardStatsCharts/CompareAllPairsChart.large"
import MarketsWidget from "./Markets"
import expand_open from "../../images/icons/expand_open.svg"
import expand_closed from "../../images/icons/expand_closed.svg"

export enum Type {
  "SWAP" = "Swap",
  "SELL" = "sell",
}

export interface EXCHANGE_TOKEN {
  token?: string
  symbol?: string
}

const Exchange = () => {
  const { getToken } = useProtocol()
  const { check8decOper } = useTokenMethods()

  const { hash: type } = useHash<Type>(Type.SWAP)
  const { state } = useLocation<{ token1?: string; token2?: string }>()

  const tab = {
    tabs: [Type.SWAP],
    tooltips: [Tooltip.Trade.General],
    current: type,
  }
  const { whitelist } = useProtocol()
  const { getTokenOrDenom } = useFetchTokens(
    undefined,
    state
  )

  /*if('xfi' in window){
    console.log("wallet detected");
  }*/

  // LOOP ust pair
  const { pair } = whitelist[getToken(LOOP)] ?? {}

  const [token1, setToken1] = useState<EXCHANGE_TOKEN | undefined>({
    token: pair ?? "",
    symbol: "UST",
  })
  const [token2, setToken2] = useState<EXCHANGE_TOKEN | undefined>({
    token: getToken(LOOP) ?? "",
    symbol: LOOP,
  })

  const setTokens = (token1: EXCHANGE_TOKEN, token2?: EXCHANGE_TOKEN) => {
    token1.token
      ? setToken1(check8decOper(token1.token) ? token2 : token1)
      : setToken1({
        token: pair ?? "",
        symbol: "UST",
      })
    token2?.token
      ? setToken2(check8decOper(token1.token) ? token1 : token2)
      : setToken2({
        token: getToken(LOOP) ?? "",
        symbol: LOOP,
      })
  }

  const [simulatedPrice, setSimulatedPrice] = useState<string>("0")
  const [response, setResponse] = useState<TxResult | undefined>(undefined)
  const [error, setError] = useState<PostError>()

  const responseFun = (
    response: TxResult | undefined,
    errorResponse?: PostError
  ) => (response ? setResponse(response) : setError(errorResponse))
  const setSimulatedPriceFunc = (price?: string) =>
    setSimulatedPrice(price ?? "0")

  /* reset */
  const reset = () => {
    setResponse(undefined)
    setError(undefined)
  }

  /* result */
  const parseTx = useSwapReceipt(type, simulatedPrice)
  const findTokenDetailFn = useFindTokenDetails()
  const token1Symbol = findTokenDetailFn(token1?.token)
  const token2Symbol = findTokenDetailFn(token2?.token)
  /*const title = {
    name: MenuKey.SWAP.toString(),
    className: undefined
  }*/

  const [headerOpen, setHeaderOpen] = useState(false)
  const HeaderForm = () => {
    return (
      <button
        type="button"
        style={{marginLeft: '5px'}}
        onClick={() => setHeaderOpen(!headerOpen)}
      >
        <img src={headerOpen ? expand_open : expand_closed} />
      </button>
    )
  }

  const [tokenName, setTokenName] = useState('')
  const tokenSelected = (name:string)=>{
    setTokenName(name)
    setHeaderOpen(true)
  }

  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | Markets</title>
      </Helmet>
      <Page lazy={false}>
        { (response || error) && (
          <Container sm>
            <Result
              response={response}
              error={error}
              parseTx={parseTx}
              onFailure={reset}
              resetIt={"SWAP AGAIN"}
              asset={token1Symbol?.tokenSymbol+'_'+token2Symbol?.tokenSymbol}
            />
          </Container>)
        }{
          <Container className={classnames(styles.swapBox, (response || error)  ? styles.swapBoxHide : '')}>
            
            <Grid className={styles.swapContainer}>
              <Flex className={styles.stateSwap}>
                  <ExchangeForm
                    showForm={headerOpen}
                    isNewDesign={true}
                    smScreen
                    type={type}
                    tab={tab}
                    key={type}
                    setTokens={setTokens}
                    responseFun={responseFun}
                    setSimulatedPriceFunc={setSimulatedPriceFunc}
                    poolTokenSelected={tokenName}
                    HeaderForm={HeaderForm}
                  />
              </Flex>
              <Flex className={styles.state}>
                <CompateAllPairsChart HeaderForm={HeaderForm} HeaderStatus={headerOpen} />
              </Flex>
            </Grid>
            <Grid className={styles.swapContainer}>
              <MarketsWidget tokenAction={tokenSelected} />
            </Grid>
          </Container>
        }
      </Page>
    </Grid>
  )
}

export default Exchange
