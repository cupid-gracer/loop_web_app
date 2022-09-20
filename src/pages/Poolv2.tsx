import { useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
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
import YourLiquidity from '../components/Pool/YourLiquidity';
import PoolWithPoolList from "../containers/PoolWithPoolList"
import useClaimReceipt from "../forms/receipts/useClaimReceipt";
import { getPath, MenuKey } from "../routes"

export enum Type {
  "PROVIDE" = "provide",
  "WITHDRAW" = "withdraw"
}


const Poolv2 = () => {
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


  // const twentyHourTradeList = useRecoilValue(twentyHourNWeekUstTradeQuery)
  // const twentyHourTradeList = useTwentyHourNWeekUstTradeQuery().contents
  // const list = useFarmingList()

  // const { simulated: values } = useAPR()

  /*const getAsset: any | SimulatedAsset = (lpToken: string): SimulatedAsset => {
    const asset =
      values !== undefined &&
      values.find((val: { asset: { token: { contract_addr: string } } }) => {
        return val.asset.token.contract_addr === lpToken
      })

    return asset !== undefined
      ? asset
      : {
          asset: {
            token: {
              contract_addr: "",
            },
          },
          apr: "0",
          apy: "0",
          liqval: "0",
        }
  }*/

  /*const dataSource = list.map((item: DATASOURCE) => {
    const { lpToken, symbol, tokens } = item
    const { liqval } = getAsset(lpToken)
    let vol24hr = "0"
    let vol7d = "0"
    if (symbol.includes("UST")) {
      const token1 = tokens?.find((token) => token.native_token === undefined)
        ?.token?.contract_addr
      vol7d = token1 ? twentyHourTradeList?.[token1]?.aWeek ?? "0" : "0"
      vol24hr = token1 ? twentyHourTradeList?.[token1]?.twentyhours ?? "0" : "0"
    } else {
      const pairToken1 =
        tokens &&
        (tokens[0].native_token
          ? tokens[0].native_token.denom
          : tokens[0]?.token?.contract_addr)
      const pairToken2 =
        tokens &&
        (tokens[1].native_token
          ? tokens[1].native_token.denom
          : tokens[1]?.token?.contract_addr)

      const ifToken1WithUst = pairToken1
        ? twentyHourTradeList?.[pairToken1]
        : undefined
      const ifToken2WithUst = pairToken2
        ? twentyHourTradeList?.[pairToken2]
        : undefined
      if (ifToken1WithUst || ifToken2WithUst) {
        if (ifToken1WithUst && ifToken2WithUst) {
          vol24hr =
            ifToken1WithUst.twentyhours > ifToken2WithUst.twentyhours
              ? ifToken1WithUst.twentyhours
              : ifToken2WithUst.twentyhours
          vol7d =
            ifToken1WithUst.aWeek > ifToken2WithUst.aWeek
              ? ifToken1WithUst.aWeek
              : ifToken2WithUst.aWeek
        } else if (ifToken1WithUst) {
          vol24hr = ifToken1WithUst.twentyhours ?? "0"
          vol7d = ifToken1WithUst.aWeek ?? "0"
        } else if (ifToken2WithUst) {
          vol24hr = ifToken2WithUst.twentyhours ?? "0"
          vol7d = ifToken2WithUst.aWeek ?? "0"
        }
      }
    }
    return {
      ...item,
      symbol: symbol ?? "",
      volume24: vol24hr,
      fee24: multiple(div(vol24hr, 100), 0.3),
      volume7d: vol7d,
      fee1year: "0",
      liquidity: liqval ? div(liqval, 100000000) : "0",
    }
  })*/

  const [response, setResponse] = useState<TxResult | undefined>()
  const [addFarmResponse, setAddFarmResponse] = useState<TxResult | undefined>()
  const [farmResponse, setFarmResponse] = useState<TxResult | undefined>()
  const [error, setError] = useState<PostError>()

  const [pairLpToken,setPairlpToken]=useState('')
  const [pairAddr,setPairAddr]=useState('')
  const [firstToken,setFirstToken]=useState('')
  const [secondToken,setSecondToken]=useState('')
  const [isTokenSelected,setIsTokenSelected]=useState(false)
  const [isPercentageButtons,setIsPercentageButtons]=useState(false);
  const [isFirstTokenBalanceZero,setIsFirstTokenBalanceZero]=useState(false)

  const [isValueZero,setIsValueZero]=useState(true);
  const [isAutoFarm,setIsAutoFarm]=useState(false);


  const responseFun = (
    res: TxResult | undefined,
    errorRes?: PostError | undefined,
    type?: string
  ) => {
      if (res) {
        setResponse(res)
      }

    if (errorRes) {
      setError(errorRes)
    }
  }
  const responseFarmFun = (
      res: TxResult | undefined,
      errorRes?: PostError | undefined,
      type?: string
  ) => {
    if (res) {
      setFarmResponse(res)
    }

    if (errorRes) {
      setError(errorRes)
    }
  }

  const responseAddToFarmFun = (
      res: TxResult | undefined,
      errorRes?: PostError | undefined,
      type?: string
  ) => {
    if (res) {
      setAddFarmResponse(res)
    }

    if (errorRes) {
      setError(errorRes)
    }
  }

  const reset = (type:string='done') => {
    setResponse(undefined)
    setError(undefined)
    setFarmResponse(undefined)
    resetFunc?.(type)
  }
  const resetAddFarm = (type:string='done') => {
    setResponse(undefined)
    setError(undefined)
    setFarmResponse(undefined)
    if(type === 'done'){
      history.push({
        pathname: getPath(MenuKey.FARMV3)
      })
    }
  }

  const parseTx = usePoolReceipt(type)
  const parseClaimTx = useClaimReceipt()

  const history = useHistory()

  const resetFunc = (type:string) => {
    if(type=='done'){
    isAutoFarm ? history.push({
      pathname: getPath(MenuKey.FARMV3)
    })
    : ''
  }
  }

  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | Pool</title>
      </Helmet>
      <Page>
        {farmResponse || error ? (
          <Container sm>
            <Result
              response={farmResponse}
              error={error}
              parseTx={parseClaimTx}
              onFailure={reset}
              gov={false}
            />
          </Container>
        ) : addFarmResponse || error ? (
            <Container sm>
              <Result
                  response={addFarmResponse}
                  error={error}
                  parseTx={parseClaimTx}
                  onFailure={resetAddFarm}
                  gov={false}
              />
            </Container>
        ) : response || error ? (
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
          <Container>
            <div className={styles.poolBox}>
              <PoolWithPoolList version={2} setPairlpToken={setPairlpToken} setPairAddr={setPairAddr} setFirstToken={setFirstToken} setSecondToken={setSecondToken} isValueZero={isValueZero} setIsTokenSelected={setIsTokenSelected} isTokenSelected={isTokenSelected} isPercentageButtons={isPercentageButtons} isFirstTokenBalanceZero={isFirstTokenBalanceZero} >
              {type && (
                <PoolDynamicForm
                  responseFun={responseFun}
                  lpTokenProp={pairLpToken ? pairLpToken :lpToken}
                  pairProp={pairAddr ? pairAddr : pair}
                  token1Prop={firstToken ? firstToken : tokens ? tokens[0]?.contract_addr : ""}
                  token2Prop={secondToken ? secondToken :  tokens ? tokens[1]?.contract_addr : ""}
                  type={type}
                  tab={tab}
                  key={type}
                  version={2}
                  setIsValueZero={setIsValueZero}
                  setIsTokenSelected={setIsTokenSelected}
                  setIsPercentageButtons={setIsPercentageButtons}
                  setIsFirstTokenBalanceZero={setIsFirstTokenBalanceZero}
                  isAutoFarm={isAutoFarm}
                  setIsAutoFarm={setIsAutoFarm}
                  showCheckbox={true}
                />
              )}
              </PoolWithPoolList>
              <YourLiquidity responseFun={responseAddToFarmFun} />
              <TopTrading />
            </div>
          </Container>
        )}
      </Page>
    </Grid>
  )
}

export default Poolv2


