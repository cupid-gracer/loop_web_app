import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { isNil } from "ramda"
import { TxResult } from "@terra-money/wallet-provider"

import useNewContractMsg from "../../terra/useNewContractMsg"
import { aUST_TOKEN, COMMISSION, LOOP, MAX_SPREAD, SMALLEST, UUSD } from "../../constants"
import Tooltip from "../../lang/Tooltip.json"
import {
  div,
  gt, gte,
  isFinite,
  minus,
  multiple,
  number,
  plus, pow,
} from "../../libs/math"
import { useFetchTokens } from "../../hooks"
import {
  adjustAmount,
  decimal,
  isNative,
  lookup,
  lookupSymbol,
  toAmount,
} from "../../libs/parse"
import useForm from "../../libs/useForm"
import {
  renderBalance,
  step,
  toBase64,
  validate as v,
  validateSlippage,
} from "../../libs/formHelpers"
import useLocalStorage from "../../libs/useLocalStorage"
import calc from "../../helpers/calc"
import { BalanceKey, PriceKey } from "../../hooks/contractKeys"
import SWAP_ICON from '../../images/icons/swap_icon.png'
import FormGroup from "../../components/FormGroup"
import Count from "../../components/Count"
import { TooltipIcon } from "../../components/Tooltip"
import { EXCHANGE_TOKEN, Type } from "../../pages/Exchange"
import useLatest from "../useLatest"
import useSelectSwapAsset, { Config } from "./useSelectSwapAsset"
import useSwapReceipt from "../receipts/useSwapReceipt"
import useSwapSimulate from "../useSwapSimulate"
import CustomMsgFormContainer, { PostError } from "../CustomMsgFormContainer"
import useFee from "../../graphql/useFee"
import useTax from "../../graphql/useTax"
import SetManualSlippageTolerance from "../SetManualSlippageTolerance"
import PriceImpaceCount from "../../components/PriceImpactCount"
import { useFindTokenDetails } from "../../data/form/select"
import swapIcon from "../../../src/images/swaping.png"
import { useFindBalance } from "../../data/contract/normalize"
import { useTokenMethods } from "../../data/contract/info"
import styles from "../../components/PoolConfirmModal.module.scss"
import Button from "../../components/Button"
import { bound } from "../../components/Boundary"
import Modal from "../../components/Modal"
import UstAustHighPriceImpactModal, { HighPriceImpactModal } from "../../components/Static/UstAustHighPriceImpaceModal"
import { useProtocol } from "../../data/contract/protocol"
import { TitleHeader } from "../../types/Types";
import FormGroupV2 from "../../components/V2Dashboard/FormGroupV2"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import TooltipContainer from "../../components/Static/TooltipContainer"

enum Key {
  token1 = "token1",
  token2 = "token2",
  value1 = "value1",
  value2 = "value2",
  pair = "pair",
}

const ExchangeForm = ({
  type,
  tab,
  title,
  smScreen,
  setTokens,
  responseFun,
  setSimulatedPriceFunc,
  showForm=true,
  poolTokenSelected,
  formUpdated,
  onChangePair,
  isNewDesign = false,
  makeCollapseable=false,
  showResult=true,
  HeaderForm
}: {
  HeaderForm?:any
  poolTokenSelected?:any
  showForm?:boolean
  type: Type
  tab: Tab
  title?: TitleHeader
  smScreen?: boolean
  isNewDesign?: boolean
  makeCollapseable?: boolean
  showResult?: boolean
  formUpdated?: (status: boolean) => void
  setTokens?: (token1: EXCHANGE_TOKEN, token2?: EXCHANGE_TOKEN) => void
  responseFun?: (
    res: TxResult | undefined,
    errorRes?: PostError | undefined
  ) => void
  setSimulatedPriceFunc?: (res?: string) => void,
  onChangePair?: Function | null
}) => {
  const priceKey = PriceKey.PAIR
  const balanceKey = BalanceKey.TOKEN

  /* context */
  const { state } = useLocation<{ token: string }>()
  const { toToken } = useProtocol()
  const { getSymbol } = useTokenMethods()
  const [totalTax, setTotalTax] = useState("0")

  // usePolling()
  let reverse = false

  const { ifNative, getTokenSymbol } = useFetchTokens(undefined, state)

  const findBalanceFn = useFindBalance()
  const { check8decOper, check8decTokens } = useTokenMethods()

  /* form:slippage */
  const slippageState = useLocalStorage("slippage", "5")
  const [slippageValue] = slippageState
  const slippageError = validateSlippage(slippageValue)
  const slippage =
    isFinite(slippageValue) && !slippageError
      ? div(slippageValue, 100)
      : MAX_SPREAD

  const findTokenDetailFn = useFindTokenDetails()

  /* form:validate */
  const validate = ({ value1, value2, token1, token2, pair }: Values<Key>) => {
    const max1 = findBalanceFn(token1)
    const token1Del = findTokenDetailFn(token1)

    return {
      [Key.value1]: v.amount(isNative(token1) ? value1 : multiple(value1, pow('10', token1Del?.decimals ?? "6") ?? SMALLEST), {
        symbol: '',
        min: "0.1",
        max: token1
          ? isNative(token1)
            ? multiple(max1, pow('10', token1Del?.decimals ?? SMALLEST))
            : max1
          : undefined,
      },
        undefined, token1Del?.decimals?.toString() ?? SMALLEST.toString()),
      [Key.value2]: v.required(value2),
      [Key.token1]: v.required(token1),
      [Key.token2]: v.required(token2),
      [Key.pair]: v.required(pair),
    }
  }

  const { whitelist, getToken } = useProtocol()
  // LOOP-UST pair
  const { pair: loopUstPair } = whitelist[getToken(LOOP)] ?? {}

  /* form:hook */
  const initial = {
    [Key.value1]: "",
    [Key.value2]: "",
    [Key.token1]: "uusd",
    [Key.token2]: getToken(LOOP) ?? "",
    [Key.pair]: loopUstPair ?? "",
  }

  const form = useForm<Key>(initial, validate)
  const { values, setValues, getFields, attrs, invalid, setValue } = form

  const { value1, value2, token1, token2, pair } = values
  const amount1 = toAmount(value1)
  const amount2 = toAmount(value2)
  const token1Detail = findTokenDetailFn(token1)
  const token2Detail = findTokenDetailFn(token2)
  const symbol1 = token1Detail ? lookupSymbol(token1Detail.tokenSymbol) : ""
  const symbol2 = token2Detail ? lookupSymbol(token2Detail.tokenSymbol) : ""
  const uusd = { [Type.SWAP]: amount1, [Type.SELL]: amount2 }[type]
  const bothAreWh = check8decTokens(
    token1,
    token2
  )
  /* form:focus input on select asset */
  const valueRef = useRef<HTMLInputElement>()
  const value2Ref = useRef<HTMLInputElement>()
  const onSelect = (name: Key) => (token: string, pair: string | undefined) => {
    
    if (onChangePair && pair) onChangePair(pair)
    const next: Partial<Record<Key, Partial<Values<Key>>>> = {
      [Key.token1]: {
        token2: name === Key.token1 ? "" : token2,
        pair: name === Key.token1 ? undefined : pair ?? "",
      },
      [Key.token2]: {
        token1: token1,
        pair: name === Key.token1 ? undefined : pair ?? "",
      },
    }
    setValues({ ...values, ...next[name], [name]: token })
    setShouldClose(name === Key.token1)
  }

  const onClick = (name: Key) => (token: string, pair: string | undefined) => {
    
    if (onChangePair && pair) onChangePair(pair)
    const next: Partial<Record<Key, Partial<Values<Key>>>> = {
      [Key.token1]: {
        token2: name === Key.token1 ? "" : token2,
        pair: name === Key.token1 ? undefined : pair ?? "",
      },
      [Key.token2]: {
        token1: token1,
        pair: name === Key.token1 ? undefined : pair ?? "",
      },
    }
    setValues({ ...values, ...next[name], [name]: token })
    setShouldClose(name === Key.token1)
  }

  /* simulation */
  reverse = form.changed === Key.value2

  const simulationParams = !reverse
    ? { amount: gt(amount1, 0) ? amount1 : "0", token: token1 }
    : { amount: gt(amount2, 0) ? amount2 : "0", token: token2 }

  const simulation = useSwapSimulate({
    ...simulationParams,
    pair,
    reverse: false,
    type,
  })

  const {
    simulated,
    loading: simulating,
    error,
    load: refetchSimulation,
  } = simulation

  //single price simulation
  const perSimulationParams = !reverse
    ? { amount: SMALLEST.toString(), token: token1 }
    : { amount: SMALLEST.toString(), token: token2 }

  const perSimulation = useSwapSimulate({
    ...perSimulationParams,
    pair,
    reverse: false,
    type,
  })

  const { simulated: perSimulated, load: refetchPerSimulation } = perSimulation

  const priceImpact = usePriceImpact(perSimulated, simulated, value1, value2)

  const [time, setTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 5000)
    return () => {
      clearInterval(interval);
    };
  }, [])

  useEffect(() => {
    refetchSimulation()
    refetchPerSimulation()
  }, [amount1, amount2, value1, value2, time])

  /* on simulate */
  useEffect(() => {
    const key = reverse ? Key.value1 : Key.value2
    const symbol = reverse ? symbol1 : symbol2
    const next = simulated
      ? lookup(
        key === Key.value2
          ? isNative(token2)
            ? simulated?.amount ?? "0"
            : simulated.amount
          : isNative(token1)
            ? simulated.amount ?? "0"
            : simulated.amount,
        symbol
      )
      : error && ""
    // const next = simulated ? lookup(simulated.amount, symbol) : error && ""
    // Safe to use as deps

    const value = adjustAmount(
      bothAreWh,
      !check8decTokens(token1),
      next
    )

    !isNil(next) &&
      setValues((values) => ({
        ...values,
        [key]: decimal(value, reverse ? token1Detail?.decimals ?? 6 : token2Detail?.decimals ?? 6),
      }))

    setSimulatedPriceFunc?.(value ?? "0")
  }, [simulated, reverse])

  /* latest price */
  const { isClosed } = useLatest()

  /* render:form */
  const config1: Config = {
    token: token1,
    symbol: symbol1,
    onSelect: onSelect(Key.token1),
    useUST: false,
    dim: (token) => isClosed(getSymbol(token)),
    smScreen,
    tokenIndex: 1,
    // type: SelectType.SWAP
  }

  const config2: Config = {
    token: token2,
    symbol: symbol2,
    otherToken: config1.token,
    onSelect: onSelect(Key.token2),
    useUST: true,
    dim: (token) => isClosed(getSymbol(token)),
    smScreen,
    tokenIndex: 2,
    // type: SelectType.SWAP
  }

  const [shouldClose, setShouldClose] = useState(false)

  let select1 = useSelectSwapAsset({ priceKey, balanceKey, ...config1 })
  let select2 = useSelectSwapAsset({
    priceKey,
    balanceKey,
    ...config2,
    shouldClose,
  })

  useEffect(() => {
    token1 &&
      token2 &&
      pair &&
      setTokens?.(
        { token: token1, symbol: token1Detail?.tokenSymbol },
        { token: token2, symbol: token2Detail?.tokenSymbol }
      )
  }, [token1, token2])

  let fields = getFields({
    [Key.value1]: {
      label: "From",
      input: {
        type: "number",
        step: step(symbol1, token1Detail?.decimals ?? 6),
        placeholder: "0",
        autoFocus: false,
        ref: valueRef,
        setValue: form.setValue,
        name: Key.value1,
        decimal: token1Detail?.decimals ?? 6,
      },
      zIndex: 40,
      unit: select1.button,
      max:
        gt(findBalanceFn(token1) ?? "", "0")
          ? () => {
            const bal = token1
              ? isNative(token1)
                ? findBalanceFn(token1)
                : div(findBalanceFn(token1), pow("10", token1Detail?.decimals ?? 6))
              : ""

            setValue(Key.value1, symbol1.toUpperCase() === 'UST' ? decimal(minus(gte(bal, "5") ? bal : "0", gte(bal, "5") ? "5" : "0"), token1Detail?.decimals ?? 6) : decimal(bal, token1Detail?.decimals ?? 6))
          }
          : undefined,
      maxValue:
        gt(findBalanceFn(token1) ?? "", "0")
          ? () => {
            const bal = token1
              ? isNative(token1)
                ? findBalanceFn(token1)
                : div(findBalanceFn(token1), pow("10", token1Detail?.decimals ?? 6))
              : ""

            return Key.value1, symbol1.toUpperCase() === 'UST' ? decimal(bal ?? "0", token1Detail?.decimals ?? 6) : decimal(bal, token1Detail?.decimals ?? 6)
          }
          : undefined,
      assets: select1.assets,
      help: renderBalance(
        token1
          ? isNative(token1)
            ? findBalanceFn(token1)
            : div(findBalanceFn(token1), pow("10", token1Detail?.decimals ?? 6))
          : ""
      ),
      focused: select1.isOpen,
      showBalance: false
    },

    [Key.value2]: {
      label: "To",
      input: {
        type: "number",
        step: step(symbol2, token2Detail?.decimals ?? 6),
        placeholder: "0",
        ref: value2Ref,
        value: shouldClose ? "" : div(amount2, SMALLEST) ?? "",
        readOnly: false,
        decimal: token2Detail?.decimals ?? 6,
      },
      zIndex: 30,
      unit: select2.button,
      assets: select2.assets,
      max: undefined,
      help: renderBalance(
        shouldClose
          ? "0"
          : isNative(token2)
            ? findBalanceFn(token2)
            : div(findBalanceFn(token2), pow("10", token2Detail?.decimals ?? 6)),
      ),
      focused: select2.isOpen,
      showBalance: true
    },
  })

  /* confirm */
  const belief = {
    [Type.SWAP]: decimal(simulated?.price, 18),
    [Type.SELL]: decimal(div(1, simulated?.price), 18),
  }[type]

  const minimumReceived = simulated
    ? calc.minimumReceived({
      offer_amount: amount1,
      belief_price: belief,
      max_spread: String(slippage),
      commission: String(COMMISSION),
    })
    : "0"

  useEffect(() => {
    formUpdated?.([value1, token1, token2].some((item) => !item) ? false : true)
  }, [value1, token1, token2])

 
  const contents = [value1, token1, token2].some((item) => !item)
    ? undefined
    : [
      {
        title: (
          <TooltipIcon content={Tooltip.Trade.Price}>
            Expected Price
          </TooltipIcon>
        ),
        content: (
          bound((!isNaN(number(div(value1 ?? "0", value2 ?? 0))) && isFinite(div(value1 ?? "0", value2 ?? 0))) && <>{decimal(div(value1 ?? "0", value2 ?? 0), 6)}{' '}{symbol1 ?? ''}</>, <LoadingPlaceholder size={"sm"} className={styles.loading} color={"lightGrey"} />)
        ),
      },
      {
        title: (
          <TooltipIcon content={"The percentage change of the current price after you place this trade"}>Price Impact</TooltipIcon>
        ),
        content: <PriceImpaceCount price={priceImpact} />,
      },
      {
        title: (
          <TooltipIcon content={Tooltip.Trade.MinimumReceived}>
            Minimum Received
          </TooltipIcon>
        ),
        content: (
          <Count symbol={symbol2}>
            {adjustAmount(
              bothAreWh,
              !check8decOper(token1),
              minimumReceived
            )}
          </Count>
        ),
      },
    ]

  /* submit */
  const newContractMsg = useNewContractMsg()

  const swaps = {
    belief_price: belief,
    max_spread: String(slippage),
  }

  const forNonNative = newContractMsg(token1, {
    send: {
      amount: check8decOper(token1)
        ? multiple(amount1, 100)
        : amount1,
      contract: pair,
      msg: toBase64({ swap: { ...swaps } }),
    },
  })

  const [sendAmount, setSendAmount] = useState("0")

  useEffect(() => {
    setSendAmount(
      gt(plus(div(amount1, SMALLEST), 2), findBalanceFn(token1))
        ? // && ifTokenNative?.denom === UUSD // note: wallet change it by self
        // ? minus(div(amount1, SMALLEST), 2) // note: wallet change it by self
        amount1
        : amount1
    )
  }, [token1, amount1])

  const asset = toToken({ token: token1, amount: amount1 })

  const toNative: any = (token: string) => {
    return isNative(token)
      ? {
        amount: sendAmount,
        info: {
          native_token: {
            denom: token,
          },
        },
      }
      : asset
  }

  const insertCoins: any = {
    amount: sendAmount,
    denom: isNative(token1) ? token1 : UUSD,
  }

  const swapContract = isNative(token1)
    ? newContractMsg(
      pair,
      { swap: { offer_asset: toNative(token1), ...swaps } },
      insertCoins
    )
    : forNonNative

  const data = {
    [Type.SWAP]: [swapContract],
    [Type.SELL]: [
      newContractMsg(token1, {
        send: { amount: amount1, contract: pair, msg: toBase64({ swaps }) },
      }),
    ],
  }[type]

  const messages = !simulating
    ? error
      ? ["Simulation failed"]
      : undefined
    : undefined
  const disabled = invalid || simulating || !!messages?.length || !pair

  /* result */
  const parseTx = useSwapReceipt(type, simulated?.price)
  const msgInfo = {
    max: token1
      ? ifNative(token1)
        ? multiple(findBalanceFn(token1), SMALLEST)
        : findBalanceFn(token1)
      : "0",
    value: value1,
    symbol: getTokenSymbol(token1),
  }

  const container = {
    label: (
      <>
        <span>{title}</span>
      </>
    ),
    // tab,
    attrs,
    contents,
    data,
    disabled,
    messages,
    parseTx,
    msgInfo,
  }
  const tax = { pretax: uusd, deduct: type === Type.SELL }

  /* tax */
  const fee = useFee(data?.length)
  const { calcTax } = useTax()
  const calculateTax = tax.pretax ? calcTax(tax.pretax) : "0"

  useEffect(() => {
    setTotalTax(plus(div(calculateTax, SMALLEST), div(fee.amount, SMALLEST)))
  }, [calculateTax])

  const slippageContent = (
    <SetManualSlippageTolerance state={slippageState} error={slippageError} />
  )

  const swapData = () => {
    if (token1 && token2) {
      const next: Partial<Record<Key, Partial<Values<Key>>>> = {
        [Key.token2]: { token1: token2, token2: token1, value1: "" },
      }
      setValues({ ...values, ...next[Key.token2], value1: "" })
    }
  }
  const responseFunc = (
    response: TxResult | undefined,
    errorResponse?: PostError
  ) => {
    setValue(Key.value1, "")
    token1 &&
      token2 &&
      pair &&
      setTokens?.(
        { token: token1, symbol: token1Detail?.tokenSymbol },
        { token: token2, symbol: token2Detail?.tokenSymbol }
      )
    responseFun?.(response, errorResponse)
  }

  const [isAnchorModalOpen, setAnchorModalOpen] = useState(false)
  const toggleConfirmModal = () => setAnchorModalOpen(!isAnchorModalOpen)

  const name = {
    name: "SWAP",
  }

  //console.log(poolTokenSelected)
  return (
    <CustomMsgFormContainer
      {...container}
      {...tax}
      showForm={showForm}
      HeaderForm={HeaderForm}
      title={name}
      label={'SWAP'}
      slippage={slippageContent}
      responseFun={responseFunc}
      showResult={showResult}
      icon={SWAP_ICON}
      makeCollapseable={makeCollapseable}
      afterSubmitChilds={gt(priceImpact, "10") && (
        bound(<Button size={'lg'} className={styles.swapSubmit} type={'button'} onClick={toggleConfirmModal}>SWAP</Button>, "")
      )}
      showSubmitBtn={!(gt(priceImpact, "10"))}
    >
      {
        !makeCollapseable && (
          <>
           {isNewDesign ? <FormGroupV2 {...fields[Key.value1]} /> : <FormGroup {...fields[Key.value1]} />}
      <span className={'swapIconContainer'}>
        <img
          src={swapIcon}
          className="swapIcon"
          alt={"reverse"}
          onClick={simulating ? () => { } : swapData}
        />
      </span>
      <span style={{ marginTop: '40px' }}>
        {isNewDesign ? <FormGroupV2 {...fields[Key.value2]} /> : <FormGroup {...fields[Key.value2]} />}
      </span>
          </>
        )
      }
     
      <Modal isOpen={isAnchorModalOpen} onClose={toggleConfirmModal} title={''}>
        {['uusd', aUST_TOKEN].includes(token1) && ['uusd', aUST_TOKEN].includes(token2) ?<UstAustHighPriceImpactModal />: <HighPriceImpactModal toggleConfirmModal={toggleConfirmModal} />}
      </Modal>
    </CustomMsgFormContainer>
  )
}

export default ExchangeForm

export const usePriceImpact = (perSimulated, simulated, value1, value2) => {

  const [calPrice, setCalPrice] = useState('0')
  const [calPerPrice, setCalPerPrice] = useState('0')

  useEffect(() => {
    setCalPrice(
      simulated?.price && !isNaN(number(simulated?.price))
        ? simulated?.price
        : "0")
    setCalPerPrice(
      perSimulated?.price && !isNaN(number(perSimulated?.price))
        ? perSimulated?.price
        : "0")
  },
    [perSimulated, simulated, value1, value2])

  const total = multiple(minus(1, div(calPerPrice, calPrice)), 100)
  return total && !isNaN(number(total)) ? decimal(total, 2) : "0"
}