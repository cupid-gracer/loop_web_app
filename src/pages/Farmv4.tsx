import {useState} from "react"
import {Helmet} from "react-helmet"
import {TxResult} from "@terra-money/wallet-provider"

import Grid from "../components/Grid"
import Result from "../forms/Result"
import Container from "../components/Container"
import useClaimReceipt from "../forms/receipts/useClaimReceipt"
import {PostError} from "../forms/FormContainer"
import useFarmStakeReceipt from "../forms/receipts/useFarmStakeReceipt"
import {Type} from "./Stake"
import Page from "../components/Page"
import Farm4Page from "./Farm/Farm4Page"
import {getPath, MenuKey} from "../routes"
import {useHistory} from "react-router-dom";

const Farmv4 = () => {
  const [farmResponse, setFarmResponse] = useState<TxResult | undefined>(
      undefined
  )
  const [unstakeResponse, setUnstakeResponse] = useState<TxResult | undefined>(
      undefined
  )
  const [compoundingResponse, setCompoundingResponse] = useState<TxResult | undefined>(
      undefined
  )

  const [errorResponse, setErrorResponse] = useState<PostError | undefined>(
    undefined
  )

  const farmResponseFun = (
    res: TxResult | undefined,
    error: PostError | undefined,
    type: string = "farm_stake"
  ) => {
    if (error) {
      setErrorResponse(error)
    }
    if (res) {
      if (type === "farm_stake") {
        setFarmResponse(res)
      }
      if (type === "farm_unstake") {
        setUnstakeResponse(res)
      }
      if (type === "vested") {
        setVestedResponse(res)
      }
      if(type === 'compounding'){
        setCompoundingResponse(res)
      }
    }
  }
  const type = Type.UNSTAKE

  /* result */
  const parseTx = useFarmStakeReceipt(type, false)
  const history = useHistory()

  /* reset */
  const reset = (type: string = 'done') => {
    setFarmResponse(undefined)
    setResponseClaimAll(undefined)
    setVestedResponse(undefined)
    setErrorResponse(undefined)
    setCompoundingResponse(undefined)
    setUnstakeResponse(undefined)
  }

  const resetUnstake = (types: string = 'done') => {
    setFarmResponse(undefined)
    setResponseClaimAll(undefined)
    setVestedResponse(undefined)
    setErrorResponse(undefined)
    setCompoundingResponse(undefined)
    setUnstakeResponse(undefined)
    if(types === 'done'){
      history.push({
        pathname: getPath(MenuKey.POOL_V2)
      })
    }
  }

  const [responseClaimAll, setResponseClaimAll] = useState<TxResult>()
  const [vesteResponse, setVestedResponse] = useState<TxResult | undefined>()

  /* result */
  const parseClaimTx = useClaimReceipt()

  return (
    <Container>
      <Grid>
        <Helmet>
          <title>Loop Markets | {MenuKey.FARMV3}</title>
        </Helmet>
        <Page title={""}>
          {farmResponse || errorResponse ? (
            <Container sm>
              <Result
                response={farmResponse}
                parseTx={parseTx}
                onFailure={reset}
                gov={false}
                error={errorResponse}
              />
            </Container>
          ) : unstakeResponse || errorResponse ? (
              <Container sm>
                <Result
                    response={unstakeResponse}
                    parseTx={parseTx}
                    onFailure={resetUnstake}
                    gov={false}
                    error={errorResponse}
                />
              </Container>
          ) : compoundingResponse || errorResponse ? (
              <Container sm>
                <Result
                    response={compoundingResponse}
                    parseTx={parseTx}
                    onFailure={reset}
                    gov={false}
                    error={errorResponse}
                />
              </Container>
          )  : vesteResponse || errorResponse ? (
            <Container sm>
              <Result
                response={vesteResponse}
                parseTx={parseTx}
                error={errorResponse}
                onFailure={reset}
              />
            </Container>
          ) : responseClaimAll || errorResponse ? (
            <Container sm>
              <Result
                response={responseClaimAll}
                parseTx={parseClaimTx}
                onFailure={reset}
                gov={false}
                error={errorResponse}
              />
            </Container>
          ) : <Container>
              <Farm4Page farmResponseFun={farmResponseFun}/>
            </Container> }
        </Page>
      </Grid>
    </Container>
  )
}

export default Farmv4
