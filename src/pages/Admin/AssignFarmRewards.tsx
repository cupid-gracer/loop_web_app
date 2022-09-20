import Container from "../../components/Container"
import styles from "./AssignFarmReward.module.scss"
import classNames from "classnames"
import React, { useEffect, useState } from "react"
import Grid from "../../components/Grid"
import Card from "../../components/Card"
import useSelectSwapAsset from "../../forms/Exchange/useSelectSwapAsset"
import ContractButton from "../../components/AssignFarmContractButton"
import { TxResult } from "@terra-money/wallet-provider"
import { PostError } from "../../forms/FormContainer"
import useNewContractMsg from "../../terra/useNewContractMsg"
import useStakeReceipt from "../../forms/receipts/useStakeReceipt"
import Result from "../../forms/Result"
import { useFindTokenDetails } from "../../data/form/select"
import { lookupSymbol } from "../../libs/parse"
import LinkButton from "../../components/LinkButton"
import Page from "../../components/Page"
import {
  FarmContractTYpe,
  listOfStakeableTokensQueryFarm2,
  listOfStakeableTokensQueryFarm3,
} from "../../data/farming/FarmV2"
import { useRecoilValue } from "recoil"
import { getLpArray } from "./helpers"
import { useProtocol } from "../../data/contract/protocol"
import { tradingListStore } from "../../data/API/dashboard"
import { none } from "ramda"
import Button from "../../components/Button"
import { gt } from "../../libs/math"

export const AssignFarmRewardAddress  = {
  "Farm1": "terra1cr7ytvgcrrkymkshl25klgeqxfs48dq4rv8j26",
  "Farm2": "terra1swgnlreprmfjxf2trul495uh4yphpkqucls8fv"
}

export enum AssignFarmRewardType  {
  "Farm1"= "Farm1",
  "Farm2"= "Farm2"
}

const AssignFarmRewards = () => {

  const [active, setActive] = useState<AssignFarmRewardType>(AssignFarmRewardType.Farm1)
  const [list, setList] = useState<any>([])
  const [startVal, setStartVal] = useState(0)
  const [endVal, setEndVal] = useState(5)

  const tradingData = useRecoilValue(tradingListStore)

  useEffect(()=>{
    (tradingData && tradingData.length >0) &&   setList(tradingData.filter((item)=> {
        
      return item.isInPool && (item.farmingAddress === AssignFarmRewardAddress[active])
    })
    .map((item)=>({ ...item, amount: "" })).slice(startVal ?? 0, endVal ?? 5))
  },[tradingData, active,startVal, endVal])


  const [response, setResponse] = useState<TxResult>()
  const [error, setError] = useState<PostError>()

  const setResponseFunc = (
    res: TxResult | undefined,
    err: PostError | undefined
  ) => {
    if (res) {
      setResponse(res)
    }
    if (err) {
      setError(err)
    }
  }

   const newContractMsg = useNewContractMsg()
  //  const { contracts } = useProtocol()
  // const data = [
  //   newContractMsg(contracts[farmingAddress] ?? "", {
  //     update_reward: {
  //       pool: lpToken,
  //       rewards: [
  //         [
  //           { info: { token: { contract_addr: token } }, amount: amount },
  //           ustPair,
  //         ],
  //       ],
  //     },
  //   }),
  // ]

  /* result */
  const parseTx = useStakeReceipt(false, null)

  const reset = () => {
    setResponse(undefined)
    setError(undefined)
  }
  const goGoAdminLink = {
    to: "/admin",
    children: "Go Back",
    outline: false,
  }


  const setTokenAmount = (value, index) => {
    let items = [...list]
    items[index].amount = value
    setList(items)
  }

  //const newContractMsg = useNewContractMsg()

  const itemData: any = list.filter((item)=> item.amount).map((item) => {

    return newContractMsg(AssignFarmRewardAddress[active],{

      update_reward: {
        pool: item.lpToken, //lpToekn address
        rewards: [
          [
            {
              info: {
                token: {
                  contract_addr: "terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4",
                },
              },
              amount: item.amount,
            },
            "terra106a00unep7pvwvcck4wylt4fffjhgkf9a0u6eu",
          ],
        ],
      },
    })
  })

  return (
    <Page title={" "} action={<LinkButton {...goGoAdminLink} />}>
      <Container sm>
        {response || error ? (
          <Result
            response={response}
            error={error}
            parseTx={parseTx}
            onFailure={reset}
          />
        ) : (
          <label title={"Farm Rewards"}>
            {/* <Grid > */}
            {/* <Grid className={styles.row}>{select.button}</Grid>
              <Grid className={styles.row}>{select.assets}</Grid> */}
            <section>
              <button
                className={active===AssignFarmRewardType.Farm1 ? styles.farmSelectionActive : styles.farmSelection}
                onClick={() => setActive(AssignFarmRewardType.Farm1)  }
              >
                Farm 1{" "}
              </button>
              <button
                className={active===AssignFarmRewardType.Farm2 ? styles.farmSelectionActive : styles.farmSelection}
                onClick={() => setActive(AssignFarmRewardType.Farm2)}
              >
                Farm 2{" "}
              </button>
            </section>

            {/* <form>
              <label>
                First number:
                <input type="text" name="name" />
              </label>
              <label>
                Second number:
                <input type="text" name="name" />
              </label>
            </form> */}

            <section>
              <button
                className={startVal === 0 ? styles.farmArrSelectionActive :styles.farmArrSelection}
                onClick={() => {
                  setStartVal(0)
                  setEndVal(5)
                }}
              >
                Open 1-5{" "}
              </button>
              <button
                className={startVal === 5 ? styles.farmArrSelectionActive :styles.farmArrSelection}
                onClick={() =>  {
                  setStartVal(5)
                  setEndVal(10)
                }}
              >
                Open 6-10{" "}
              </button>
              <button
                className={startVal === 10 ? styles.farmArrSelectionActive :styles.farmArrSelection}
                onClick={() =>  {
                  setStartVal(10)
                  setEndVal(15)
                }}
              >
                Open 11-15{" "}
              </button>
              <button
                className={startVal === 15 ? styles.farmArrSelectionActive :styles.farmArrSelection}
                onClick={() =>  {
                  setStartVal(15)
                  setEndVal(20)
                }}
              >
                Open 16-20{" "}
              </button>
              <button
                className={startVal === 20 ? styles.farmArrSelectionActive :styles.farmArrSelection}
                onClick={() =>  {
                  setStartVal(20)
                  setEndVal(25)
                }}
              >
                Open 21-25{" "}
              </button>
            </section>
            <p>
              {list.map((item, index) => {
                return (
                  <>
                      <Card className={styles.card}>
                        <label>Ticker: </label>
                        <label className={styles.cardTokenSymbol}>
                          {item.symbol}
                        </label>
                        <Grid className={styles.row}>
                          <div className={styles.inputContainer}>
                            <div className={classNames(styles.tokenGroup)}>
                              <label className={styles.label}>
                                Lp Token Addr
                              </label>
                              <input
                                type="text"
                                className={styles.input_token}
                                placeholder={`Enter Token addr`}
                                name="reward"
                                disabled={true}
                                value={item.lpToken}
                              />
                              <div className={styles.error_container}>
                               
                              </div>
                            </div>
                          </div>
                        </Grid>
                        <Grid className={styles.row}>
                          <div className={styles.inputContainer}>
                            <div className={classNames(styles.tokenGroup)}>
                              <label className={styles.label}>Amount</label>
                              <input
                                type="number"
                                className={styles.input_token}
                                placeholder={`Enter amount`}
                                name="reward"
                                onChange={(e) =>
                                  setTokenAmount(
                                    e.target.value,
                                    index
                                  )
                                }
                                value={item.amount}
                              />
                              <div className={styles.error_container}>
                                {(item.amount.length <= 0 || !item.amount) && (
                                  <p className={styles.error}>Required</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Grid>
                        {/* <Grid className={styles.row}>
                        <div className={styles.inputContainer}>
                          <div className={classNames(styles.tokenGroup)}>
                            <label className={styles.label}>
                              UST pair Addr
                            </label>
                            <input
                              type="text"
                              className={styles.input_token}
                              placeholder={`Enter UST pair addr`}
                              name="reward"
                              disabled={true}
                              onChange={(e) => setUstPair(e.target.value)}
                              value={ustPair}
                            />
                            <div className={styles.error_container}>
                              {(ustPair.length <= 0 || !ustPair) && (
                                <p className={styles.error}>Required</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Grid> */}
                      </Card>
                    
                  </>
                )
              })}
            </p>
            <Grid>
              <ContractButton
                data={itemData}
                setResponse={setResponseFunc}
                disabled={false}
                label={"Submit"}
                activeFarm={active}
              />
            </Grid>
            {/* <p>
              {showRewardCards(0,4).map((item, index) => {
                
                return (
                  <>                   
                      {item.isInPool && (
                        <Card className={styles.card}>
                          <label>Ticker: </label>
                          <label className={styles.cardTokenSymbol}>
                            {item.symbol}
                          </label>
                          <Grid className={styles.row}>
                            <div className={styles.inputContainer}>
                              <div className={classNames(styles.tokenGroup)}>
                                <label className={styles.label}>
                                  Lp Token Addr
                                </label>
                                <input
                                  type="text"
                                  className={styles.input_token}
                                  placeholder={`Enter Token addr`}
                                  name="reward"
                                  disabled={true}
                                  onChange={(e) => setToken(e.target.value)}
                                  value={item.lpToken}
                                />
                                <div className={styles.error_container}>
                                  {(token.length <= 0 || !token) && (
                                    <p className={styles.error}>Required</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Grid>
                          <Grid className={styles.row}>
                            <div className={styles.inputContainer}>
                              <div className={classNames(styles.tokenGroup)}>
                                <label className={styles.label}>Amount</label>
                                <input
                                  type="number"
                                  className={styles.input_token}
                                  placeholder={`Enter amount`}
                                  name= "reward"
                                  onChange={(e) => setTokenAmount(e.target.value, index, item.symbol)}
                                  value={item.amountToken}
                                />
                                <div className={styles.error_container}>
                                  {(amount.length <= 0 || !amount) && (
                                    <p className={styles.error}>Required</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Grid>
                        </Card>
                      )}
                    </>
                )
              })}
            </p>
              <Grid>
              <ContractButton
                data={data}
                setResponse={setResponseFunc}
                disabled={disabled}
                label={"Submit"}
              />
              </Grid> */}
            {/* </Grid> */}
          </label>
        )}
      </Container>
    </Page>
  )
}

export default AssignFarmRewards
