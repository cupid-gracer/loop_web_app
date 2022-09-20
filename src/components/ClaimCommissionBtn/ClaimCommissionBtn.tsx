import { Fee, Msg } from "@terra-money/terra.js"
import { TxResult, useWallet } from "@terra-money/wallet-provider"
import React, { useState } from "react"
import { useRecoilValue } from "recoil"
import { factory2Pairs } from "../../data/API/dashboard"
import { PostError } from "../../forms/FormContainer"
import useClaimReceipt from "../../forms/receipts/useClaimReceipt"
import Result from "../../forms/Result"
import useFee from "../../graphql/useFee"
import useLCDClient from "../../graphql/useLCDClient"
import useAddress from "../../hooks/useAddress"
import useNewContractMsg from "../../terra/useNewContractMsg"
import styles from "./ClaimCommissionBtn.module.scss"

const ClaimCommissionBtn = ({ btnNumber }) => {
  const [response, setResponse] = useState<TxResult | undefined>()
  const [errorResponse, setErrorResponse] = useState<PostError | undefined>(
    undefined
  )

  const allPairs=useRecoilValue(factory2Pairs)
  const startIndex = btnNumber * 5
  const endIndex = startIndex - 5
  const messageArray: any = []
  const newContractMsg = useNewContractMsg()
  const fee = useFee()
  const { post } = useWallet()
  const address = useAddress()
  const { terra } = useLCDClient()
  const rows = allPairs.slice(endIndex, startIndex)

  const handleClaim = async () => {
    try {
      const { gasPrice } = fee

      const txOptions: {
        msgs: Msg[]
        gasPrices: string
        purgeQueue: boolean
        memo: string | undefined
        fee?: Fee
      } = {
        msgs: messageArray,
        memo: undefined,
        purgeQueue: true,
        gasPrices: `${gasPrice}uusd`,
      }

      const signMsg = await terra.tx.create([{ address: address }], txOptions)

      txOptions.fee = signMsg.auth_info.fee

      const response = await post(txOptions)
      setResponse(response)
    } catch (error) {
        setErrorResponse(error)
    }
  }

  const reset = () => {
    setResponse(undefined)
    setErrorResponse(undefined)
  }

  const parseClaimTx = useClaimReceipt()

  return (
    <>
      {response || errorResponse ? (
        <Result
          response={response}
          parseTx={parseClaimTx}
          error={errorResponse}
          onFailure={reset}
        />
      ) : (
        <span className={styles.wrapper}>
        {allPairs.slice(endIndex, startIndex).map((item, index) => {
          if (index == rows.length - 1) {
            return (
              <>
                <div>
                  {messageArray.push(
                    newContractMsg(item?.contractAddr ?? "", {
                      withdraw_extra_commission_fee: {},
                    })
                  )}
                  <span className={styles.ticker}>{item?.symbol}</span>
                </div>
                <button className={styles.btn} onClick={handleClaim}>
                  Claim
                </button>
              </>
            )
          } else {
            return (
              <>
                <div>
                  {messageArray.push(
                    newContractMsg(item?.contractAddr ?? "", {
                      withdraw_extra_commission_fee: {},
                    })
                  )}
                  <span className={styles.ticker}>{item?.symbol}</span>
                </div>
              </>
            )
          }
        })}
      </span>
      )}
    </>
  )
}

export default ClaimCommissionBtn
