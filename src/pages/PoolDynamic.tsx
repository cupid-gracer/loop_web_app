import { useState } from "react"
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
import styles from "./Exchange.module.scss"
import TopTrading from "./Dashboard/TopTrading"
import PoolWithPoolList from "../containers/PoolWithPoolList"

export enum Type {
  "PROVIDE" = "provide",
  "WITHDRAW" = "withdraw"
}

const PoolDynamic = () => {
  const { hash: type } = useHash<Type>(Type.PROVIDE)
  const tab = {
    tabs: [Type.PROVIDE, Type.WITHDRAW],
    tooltips: [Tooltip.Pool.Provide, Tooltip.Pool.Withdraw],
    current: type,
  }
  const { state } = useLocation<{ pair?: string; lpToken?: string }>()
  const pair = state?.pair
  const lpToken = state?.lpToken
  const { getTokensFromPair } = useFetchTokens()
  const tokens = pair && getTokensFromPair(pair)



  const [response, setResponse] = useState<TxResult | undefined>()
  const [error, setError] = useState<PostError>()

  const responseFun = (
    res: TxResult | undefined,
    errorRes?: PostError | undefined
  ) => {
    if (res) {
      setResponse(res)
    }
    if (errorRes) {
      setError(errorRes)
    }
  }
  const reset = () => {
    setResponse(undefined)
    setError(undefined)
  }
  const parseTx = usePoolReceipt(type)

  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | Pool</title>
      </Helmet>
      <Page>
        {response || error ? (
          <Container sm>
            <Result
              response={response}
              error={error}
              parseTx={parseTx}
              onFailure={reset}
              gov={false}
            />
          </Container>
        ) : (
          <div className={styles.poolBox}>
            <PoolWithPoolList version={1}>
            {type && (
              <PoolDynamicForm
                responseFun={responseFun}
                lpTokenProp={lpToken}
                pairProp={pair}
                token1Prop={tokens ? tokens[0]?.contract_addr : ""}
                token2Prop={tokens ? tokens[1]?.contract_addr : ""}
                type={type}
                tab={tab}
                key={type}
                version={1}
                showCheckbox={false}
              />
            )}
            </PoolWithPoolList>
            {false && (
                <></>
             
            )}
            
            <TopTrading />
          </div>
        )}
      </Page>
    </Grid>
  )
}

export default PoolDynamic


