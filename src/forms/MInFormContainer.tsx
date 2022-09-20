import { useEffect, useState } from "react"
import { ReactNode, HTMLAttributes, FormEvent } from "react"
import { Msg,Fee} from "@terra-money/terra.js"
import {
  CreateTxFailed,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  UserDenied,
  useWallet,
} from "@terra-money/wallet-provider"
import classNames from "classnames";

import MESSAGE from "../lang/MESSAGE.json"
import {SMALLEST, UUSD} from "../constants"
import {gt, multiple, sum} from "../libs/math"
import useHash from "../libs/useHash"
import useTax from "../graphql/useTax"
import useFee from "../graphql/useFee"

import Container from "../components/Container"
import Tab from "../components/Tab"
import Card from "../components/Card"
import Confirm from "../components/Confirm"
import FormFeedback from "../components/FormFeedback"
import Button from "../components/Button"
import Result from "./Result"
import useAddress from "../hooks/useAddress"
import { CustomActions } from "./LoopStakeForm"
import styles from "./FormContainer.module.scss"
import {useFindBalance} from "../data/contract/normalize";
import {useLCDClient} from "../graphql/useLCDClient";

interface Props {
  data: Msg[]
  memo?: string
  gasAdjust?: number

  /** Form information */
  contents?: Content[]
  /** uusd amount for tax calculation */
  pretax?: string
  /** Exclude tax from the contract */
  deduct?: boolean
  /** Form feedback */
  messages?: ReactNode[]

  /** Submit disabled */
  disabled?: boolean
  /** Submit label */
  label?: string

  /** Render tab */
  tab?: Tab
  /** Form event */
  attrs?: HTMLAttributes<HTMLFormElement>

  /** Parser for results */
  parseTx?: ResultParser
  /** Gov tx */
  gov?: boolean

  children?: ReactNode
  partial?: boolean
  farmResponseFun?: (
    res: TxResult | undefined,
    err?: PostError | undefined
  ) => void
  customActions?: (data: CustomActions) => ReactNode
  afterSubmitChilds?: ReactNode
  extResponse?: TxResult
  className?: string
  verifyUstBalance?: boolean
  tabLabels?: { [index: string]: string }
  postSubmitFn?: () => void
  formSubmited?: boolean
  resetFunc?: (type?: string) => void
}
export type PostError =
  | UserDenied
  | CreateTxFailed
  | TxFailed
  | TxUnspecifiedError

export const MiniFormContainer = ({
  data: msgs,
  className,
  gasAdjust = 1,
  memo,
  customActions,
  extResponse,
  farmResponseFun,
                                    postSubmitFn,
  tabLabels,
                                    resetFunc,
                                verifyUstBalance = true,
                                formSubmited = false,
  ...props
}: Props) => {
  const { contents, messages, label, tab, children } = props
  const {
    attrs,
    pretax,
    deduct,
    parseTx = () => [],
    gov,
    afterSubmitChilds,
  } = props

  /* context */
  const { hash } = useHash()
  // const { agreementState } = useSettings()

  const findBalanceFn = useFindBalance()
  const uusd = multiple(findBalanceFn(UUSD) ?? "0", SMALLEST)
  const address = useAddress()

  /* tax */
  const fee = useFee(msgs?.length, gasAdjust)
  const { post } = useWallet()
  const { terra } = useLCDClient()

  const { calcTax, loading: loadingTax } = useTax()
  const tax = pretax ? calcTax(pretax) : "0"
  const uusdAmount = !deduct
    ? sum([pretax ?? "0", tax, fee.amount])
    : fee.amount

  const invalid =
    address  && (!gt(uusd, uusdAmount) && verifyUstBalance)
      ? ["Not enough UST to pay the transaction fee. Add some UST to your wallet and try again."]
      : undefined

  /* confirm */
  /*const [confirming, setConfirming] = useState(false)
  const confirm = () => (hasAgreed ? submit() : setConfirming(true))
  const cancel = () => setConfirming(false)*/

  /* submit */
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<TxResult | undefined>()
  const [error, setError] = useState<PostError>()

  const disabled =
    loadingTax || props.disabled || invalid || submitted || !msgs?.length

  const submit = async () => {
    setSubmitted(true)

    try {
      const { gasPrice } = fee

      const txOptions: { msgs: Msg[]; gasPrices: string; purgeQueue: boolean; memo: string | undefined, fee?: Fee } = {
        msgs,
        memo,
        gasPrices: `${gasPrice}uusd`,
        // fee: new Fee(gas, { uusd: plus(amount, !deduct ? tax : undefined) }),
        purgeQueue: true,
      }

      const signMsg = await terra.tx.create(
          [{ address: address }],
          txOptions
      )

      txOptions.fee = signMsg.auth_info.fee

      const response = await post(txOptions)
      postSubmitFn?.()
      !farmResponseFun && setResponse(response)
      farmResponseFun?.(response, undefined)
    } catch (error) {
      farmResponseFun?.(undefined, error)
      !farmResponseFun && setError(error)
    }
  }

  const [externalResponse, setExternalResponse] = useState<TxResult>()

  useEffect(() => {
    extResponse && setExternalResponse(extResponse)
  }, [extResponse])

  /* reset */
  const reset = (type: string = 'done') => {
    console.log("i am done")
    resetFunc?.(type)
    setSubmitted(false)
    setResponse(undefined)
    setError(undefined)
    setExternalResponse(undefined)
  }

  /* event */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    !disabled && submit()
  }

  useEffect(()=>{
    if(formSubmited && !submitted){
      submit()
    }
  },[formSubmited])

  /* render */
  const render = (children: ReactNode | ((button: ReactNode) => ReactNode)) => {
    const next = address
      ? {
          onClick: handleSubmit,
          children: label ?? hash ?? "Submit",
          loading: submitted,
          disabled,
        }
      : {
          onClick: undefined,
          children: MESSAGE.Form.Button.ConnectWallet,
        }

   /* const txFee = (
      <Count symbol={UST} dp={6}>
        {plus(tax, fee.amount)}
      </Count>
    )*/

    const form = (
      <>
        {children}

        {contents && contents.length > 0 && (
          <Confirm
            list={[
              ...contents
            ]}
          />
        )}

        {(invalid ?? messages)?.map((message, index) => (
          <FormFeedback key={index}>{message}</FormFeedback>
        ))}

        {customActions ? (
          customActions(next)
        ) : (
          <Button {...next} type="button" size="lg" submit />
        )}
        {afterSubmitChilds && afterSubmitChilds}
      </>
    )

    return tab ? (
      <Tab {...tab} tabLabels={tabLabels}>
        {form}
      </Tab>
    ) : (
      <Card lg className={classNames(styles.card, styles.cardMini)} mainSectionClass={styles.cardMini}>
        {form}
      </Card>
    )
  }
  return (
    <Container sm className={className}>
      {/* {response || error ? (
        <Result
          response={response}
          error={error}
          parseTx={parseTx}
          onFailure={reset}
          gov={gov}
        />
      ) : externalResponse || error ? (
        <Result
          response={externalResponse}
          error={error}
          parseTx={parseTx}
          onFailure={reset}
        />
      ) : ( */}
        <form
          {...attrs}
          onSubmit={handleSubmit}
          className={tab?.current === "Airdrop" ? styles.airdropBox : ""}
        >
          {
            // !confirming ? (
            //   render(children)
            // ) : (
            //   <Caution goBack={cancel} onAgree={submit} />
            // )
            render(children)
          }
        </form>
      {/* )} */}
    </Container>
  )
}

export default MiniFormContainer
