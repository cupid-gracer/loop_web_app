import {useState} from "react"
import {TxResult} from "@terra-money/wallet-provider"

import {LOOP, UUSD} from "../../constants"
import {format, lookupSymbol} from "../../libs/parse"
import styles from "./Holdings.module.scss"
import Card from "../../components/Card"
import Dl from "../../components/Dl"
import Price from "../../components/Price"
import {gt} from "../../libs/math"
import {PostError} from "../../forms/FormContainer"
import Container from "../../components/Container"
import Result from "../../forms/Result"
import useStakeReceipt from "../../forms/receipts/useStakeReceipt"
import {Type} from "../Stake"
import {useFarmsList, useFarmsNewList} from "../Farm/useFarmBetaList"
import FarmStakeFarm2 from "../../components/FarmStakeFarm2"
import {FarmType} from "../FarmBeta"
import {bound} from "../../components/Boundary"
import useMyStake from "./useMyStake";
import ProgressLoading from "../../components/Static/ProgressLoading";
import FarmUserStakeV4 from "../../components/Farm/FarmUserStakeV4"

const StakeFarm2 = () => {
  const { dataSource, price } = useMyStake()

  const dataExists = !!dataSource.length
  const description = dataExists && (
      <Dl
          list={[
            {
              title: `${LOOP} Price`,
              content: <Price price={format(price)} symbol={lookupSymbol(UUSD)} />,
            },
          ]}
      />
  )
  /*const link = {
    to: "/claim/all",
    children: MESSAGE.FARMING.Claim_all_rewards,
    outline: false,
  }*/

  const dataList = useFarmsList(true)

  const [errorResponse, setErrorResponse] = useState<PostError | undefined>(
      undefined
  )
  const [farmResponse, setFarmResponse] = useState<TxResult | undefined>(
      undefined
  )
  const parseTx = useStakeReceipt(false,null)

  /* reset */
  const reset = () => {
    setFarmResponse(undefined)
    setResponseClaimAll(undefined)
    setVestedResponse(undefined)
    setErrorResponse(undefined)
  }
  const type = Type.UNSTAKE

  const [responseClaimAll, setResponseClaimAll] = useState<TxResult>()
  const [vesteResponse, setVestedResponse] = useState<TxResult | undefined>()

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
      if (type === "vested") {
        setVestedResponse(res)
      }
    }
  }

  return (
      <Card
          title={
              <b className={styles.poolToolTip}>Farm</b>
          }
          /*action={dataExists && <LinkButton {...link} />}*/
          description={bound(description)}
      >
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
        ) : (
            bound(dataList && dataList.length > 0 &&
                dataList
                    .filter((farm) => gt(farm.staked ?? "0", "0"))
                    .map((farm) => (
                        <FarmStakeFarm2
                            hidden={false}
                            key={farm.lpToken}
                            farmResponseFun={farmResponseFun}
                            dataSource={farm}
                            type={type}
                            pageName={FarmType.farm2}
                            farmContractType={farm.FarmContractType}
                        />
                    )), <ProgressLoading />)
        )}
      </Card>
  )
}

export default StakeFarm2


export const StakeFarmV3 = () => {
  const dataList = useFarmsNewList(true)
  const [errorResponse, setErrorResponse] = useState<PostError | undefined>(
      undefined
  )
  const [farmResponse, setFarmResponse] = useState<TxResult | undefined>(
      undefined
  )
  const parseTx = useStakeReceipt(false,null)

  /* reset */
  const reset = () => {
    setFarmResponse(undefined)
    setErrorResponse(undefined)
  }
  const type = Type.UNSTAKE

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
    }
  }

  return (
      <Card
          title={
              <b className={styles.poolToolTip}>Farm V3</b>
          }
      >
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
        ) : (
            bound(dataList && dataList.length > 0 &&
                dataList
                    .filter((farm) => gt(farm.staked ?? "0", "0"))
                    .map((farm) => (
                        <FarmUserStakeV4
                            hidden={false}
                            key={farm.lpToken}
                            farmResponseFun={farmResponseFun}
                            dataSource={farm}
                            type={type}
                            pageName={FarmType.farm2}
                            farmContractType={farm.FarmContractType}
                        />
                    )), <ProgressLoading />)
        )}
      </Card>
  )
}
