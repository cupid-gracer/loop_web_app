import {useEffect, useRef, useState} from "react"
import {TxResult} from "@terra-money/wallet-provider"

import useNewContractMsg from "../../terra/useNewContractMsg"
import {MIN_FEE, SMALLEST, UST, UUSD} from "../../constants"
import {div, gt, max,minus, multiple, plus, pow} from "../../libs/math"
import {
  commas,
  decimal,
  isNative,
  lookupAmount,
  lookupSymbol,
} from "../../libs/parse"
import useForm from "../../libs/useForm"
import {placeholder, renderBalance, step, toBase64, validate as v, validateSlippage,} from "../../libs/formHelpers"
import {AssetBalanceKey, BalanceKey, PriceKey} from "../../hooks/contractKeys"

import FormGroup from "../../components/FormGroup"
import {Type} from "../../pages/PoolDynamic"
import {PostError} from "../FormContainer"
import plus_icon from '../../images/icons/+.svg'
import {useFindBalance} from "../../data/contract/normalize";
import {useTokenMethods} from "../../data/contract/info"
import {useFindTokenDetails} from "../../data/form/select";
import usePoolDynamic from "../Pool/usePoolDynamic";
import getLpName from "../../libs/getLpName";
import useSelectSwapAsset from "../Exchange/useSelectSwapAsset";
import BN from "bignumber.js";
import usePoolShare from "../usePoolShare";
import {TooltipIcon} from "../../components/Tooltip";
import Tooltip from "../../lang/Tooltip.json";
import {insertIf} from "../../libs/utils"
import usePoolReceipt from "../receipts/usePoolReceipt"
import useFee from "../../graphql/useFee";
import useTax from "../../graphql/useTax";
import useLocalStorage from "../../libs/useLocalStorage";
import SetManualSlippageTolerance from "../SetManualSlippageTolerance"
import Grid from "../../components/Grid"
import CustomMsgFormContainer from "../CustomMsgFormContainer"
import styles from './FarmWizardStep3Form.module.scss'
import {usePoolPairPoolList} from "../../data/contract/migrate";
import {useProtocol} from "../../data/contract/protocol";
import { useFarmMigrate } from "../../pages/Farm/FarmWizard/useFarmMigrate"
import icon from '../../images/icons/24-pool-black.svg'
import {useHistory} from "react-router-dom";
import {getPath, MenuKey} from "../../routes";
import classnames from "classnames";

enum Key {
  token1 = "token1",
  token2 = "token2",
  value = "value",
  pair = "pair",
  lp = "lp"
}

interface Props {
  type: Type
  lpToken: string
  pairProp: string
  tokens: string[] | undefined
  farmResponseFun?: (
    res: TxResult | undefined,
    err?: PostError | undefined
  ) => void
}

const FarmWizardStep3Form = ({
  type,
  lpToken,
  farmResponseFun,
                               tokens,
                               pairProp,
}: Props) => {

  const lpTokenProp = lpToken
  const priceKey = PriceKey.PAIR
  const balanceKey = {
    [Type.PROVIDE]: BalanceKey.TOKEN,
    [Type.WITHDRAW]: BalanceKey.LPSTAKABLE,
  }[type]

  const findBalanceFn = useFindBalance()
  const { whitelist } = useProtocol()
  const { check8decOper } = useTokenMethods()

  const [totalTax, setTotalTax] = useState("0")
  const [estimatedValue, setEstimatedValue] = useState("0")
  const [addVal1, setAddVal1] = useState("0")
  const [addVal2, setAddVal2] = useState("0")

  // usePolling()
  const [time, setTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 3000)
    return () => {
      clearInterval(interval);
    };
  }, [])
  
  /* form:validate */
  const validate = ({ value, token1, token2, pair, lp }: Values<Key>) => {
    const token1Detail = findTokenDetailFn(token1)
    // const token2Detail = findTokenDetailFn(token2)
    const symbol1 = token1Detail ? token1Detail.tokenName : ""
   
    return {
      [Key.value]: {
        [Type.PROVIDE]: v.amount(value, {
          symbol: symbol1 ?? undefined,
          min: undefined,
          max: isNative(token1)
              ? multiple(plus(findBalanceFn(token1), addVal1), SMALLEST)
              : plus(findBalanceFn(token1), addVal1),
        }),
        [Type.WITHDRAW]: v.amount(value, {
          symbol: undefined,
          min: "0",
          max: div(plus(findBalanceFn(token1), addVal1), SMALLEST),
        }, '', '6'),
      }[type],
      [Key.token1]: v.required(token1),
      [Key.token2]: type === Type.WITHDRAW ? "" : v.required(token2),
      [Key.pair]: v.required(pair),
      [Key.lp]: type === Type.WITHDRAW ? v.required(lp) : ""
    }
  }

  const findTokenDetailFn = useFindTokenDetails()

  /* form:hook */
  const initial = {
    [Key.value]: "",
    [Key.token1]: tokens ?  tokens[0] : '',
    [Key.token2]: tokens ?  tokens[1] : '',
    [Key.pair]: pairProp ?? "",
    [Key.lp]: lpToken ?? lpTokenProp ?? ""
  }

  const form = useForm<Key>(initial, validate)
  const { values, setValue, setValues, getFields, attrs, invalid, reset } = form
  const { value, token1, token2, pair, lp } = values

  const [agree, setAgree] = useState(false)
  const [shouldClose, setShouldClose] = useState(false)

  useEffect(() => {
    pairProp && reset();
  }, [pairProp, lpToken, tokens])

  
  const token1Detail =
      type === Type.PROVIDE
          ? findTokenDetailFn(tokens?.[0] ?? token1)
          : findTokenDetailFn(token1, 'lp')
  const token2Detail = findTokenDetailFn(tokens?.[1] ?? token2)
  const symbol1 = token1Detail ? lookupSymbol(token1Detail.tokenSymbol) : ""
  const symbol2 = token2Detail ? lookupSymbol(token2Detail.tokenSymbol) : ""
  const amount = multiple(value, pow('10', token1Detail?.decimals ?? 6))
  
  /* form:focus input on select asset */
  const valueRef = useRef<HTMLInputElement>()
  const onSelect = (name: Key) => (token: string, pair: string | undefined) => {
    const pairs =
        name === Key.token2 && type === Type.PROVIDE
            ? { pair: pair ?? "" }
            : { pair: pair, lp: token ?? "" }
    const next: Partial<Record<Key, Partial<Values<Key>>>> = {
      [Key.token1]: { token2: name === Key.token1 ? "" : token2, ...pairs },
      [Key.token2]: { token1: token1, ...pairs },
    }
    const resetValue = type === Type.PROVIDE ? { [Key.value]: "0" } : {}
    setValues({ ...values, ...next[name], [name]: token, ...resetValue })
    setShouldClose(name === Key.token1)
  }

  const { contents: poolPairPoolList} = usePoolPairPoolList()
  const poolResult: any = poolPairPoolList?.[pair ?? pairProp ?? ""]

  const maxLiquidity = findBalanceFn?.(token1) ?? "0"
  const getPool = usePoolDynamic(time)

  /* render:form */
  const config = {
    token: token1,
    onSelect: onSelect(Key.token1),
    symbol: symbol1,
    priceKey,
    balanceKey,
    formatTokenName: undefined,
    formatPairToken: type === Type.WITHDRAW ? true : undefined,
    showAsPairs: type === Type.WITHDRAW ? true : undefined,
    balanceType: {
      [Type.WITHDRAW]: AssetBalanceKey.LP,
      [Type.PROVIDE]: AssetBalanceKey.BALANCE,
    }[type],
    showQuickTokens: false,
    vertical: true,
    newFactory: true,
    showBalance: false,
    disabled: true,
    tokenIndex: 1
  }

  /* render:form */
  const config2 = {
    token: token2,
    symbol: symbol2,
    otherToken: config.token,
    onSelect: onSelect(Key.token2),
    priceKey,
    balanceKey,
    formatTokenName: type === Type.WITHDRAW ? getLpName : undefined,
    skip: type === Type.WITHDRAW ? undefined : ['terra15a9dr3a2a2lj5fclrw35xxg9yuxg0d908wpf2y','terra14tl83xcwqjy0ken9peu4pjjuu755lrry2uy25r','terra1aa7upykmmqqc63l924l5qfap8mrmx5rfdm0v55'],
    newFactory: true,
    showQuickTokens: false,
    showBalance: false,
    disabled: true,
    tokenIndex: 2
  }

  const select = useSelectSwapAsset({ ...config })
  const select2 = useSelectSwapAsset({
    ...config2,
    shouldClose,
  })

  const perTokenPoolValue = token1
      ? getPool({
        amount: SMALLEST.toString(),
        token: type === Type.WITHDRAW ? lp : token1,
        token2: token2 ?? UST,
        pairPoolResult: poolResult,
        type,
      })
      : undefined

  const pool = token1
      ? getPool({
        amount: check8decOper(type === Type.WITHDRAW ? lp : token1) ? multiple(amount, 100) : amount,
        token:
            type === Type.WITHDRAW
                ? lp
                : token1,
        token2: token2 ?? UST,
        pairPoolResult: poolResult,
        type,
      })
      : undefined

  const toLP = pool?.toLP

  const fromLP = pool?.fromLP
  const estimated = div(pool?.toLP.estimated, SMALLEST)

  const uusd = {
    [Type.PROVIDE]: pool?.toLP.estimated ?? "0",
    [Type.WITHDRAW]: fromLP?.uusd.amount,
  }[type]

  const firstTokenMaxValue = {
    [Type.WITHDRAW]: div(maxLiquidity, SMALLEST),
    [Type.PROVIDE]: isNative(token1)
        ? lookupAmount(plus(findBalanceFn(token1), addVal1), 0)
        : lookupAmount(plus(findBalanceFn(token1), addVal1), token1Detail?.decimals)
  }[type]


  const total = firstTokenMaxValue ?? "0" //get lp token balance

  const lpAfterTx = {
    [Type.PROVIDE]: plus(total, toLP?.value),
    [Type.WITHDRAW]: max([minus(maxLiquidity, amount), "0"]),
  }[type]

  /* share of pool */
  const modifyTotal = {
    [Type.PROVIDE]: (total: string) => plus(total, toLP?.value),
    [Type.WITHDRAW]: (totalSuppl: string) =>
        new BN(totalSuppl).minus(div(amount, SMALLEST)).toString(),
  }[type]

  const getPoolShare = usePoolShare(modifyTotal)
  const poolShareData = {
    amount: div(lpAfterTx, SMALLEST),
    token: token1,
    total: div(poolResult?.total_share ?? "0", SMALLEST),
  }

  const poolShare = getPoolShare(poolShareData)

  const { lessThanMinimum } = poolShare

  const delisted = whitelist[token1]?.["status"] === "DELISTED"
  
  useEffect(() => {
    const secondTokenMax = token2
    ? isNative(token2)
        ? lookupAmount(plus(findBalanceFn(token2), addVal2), 0)
        : lookupAmount(plus(findBalanceFn(token2), addVal2), token2Detail?.decimals)
    : "0"

    if (gt(div(toLP?.estimated ?? "0", SMALLEST), secondTokenMax)) {

      const adjustedValue = minus(
          div(secondTokenMax, div(perTokenPoolValue?.toLP.estimated, SMALLEST)),
          [token1, token2].includes(UUSD) ? MIN_FEE : "0"
      )
      
      const calculatedVal = decimal(
          gt(adjustedValue, 0) ? adjustedValue : "0",
          4
      )
      
      const valid =
          !gt(adjustedValue, firstTokenMaxValue) &&
          type === Type.PROVIDE &&
          token2
      
      valid &&
      setValue(
          Key.value,
          isNative(token1) ? decimal(calculatedVal, 3) : calculatedVal
      )
    }
    
    setEstimatedValue(shouldClose ? "0" : div(toLP?.estimated, SMALLEST) ?? "0")
  }, [toLP?.estimated, token1, token2, addVal2, firstTokenMaxValue])

  
  const { messages: msgs, transactions } = useFarmMigrate()
  const oldData = transactions?.['2']
  const fpool1 = div(oldData.asset.token === token1 ? oldData.asset.amount :  (oldData.uusd.token === token1 ? oldData.uusd.amount : "0"), pow('10', token1Detail?.decimals ?? 6))
  const fpool2 =  div(oldData.asset.token === token2 ? oldData.asset.amount :  (oldData.uusd.token === token2 ? oldData.uusd.amount : "0"), pow('10', token2Detail?.decimals ?? 6))

  const bal1txt = gt(fpool1, "0") ? `${commas(fpool1)} ${lookupSymbol(token1Detail?.tokenSymbol)}` : ""
  const bal2txt = gt(fpool2, "0") ? `${commas(fpool2)} ${lookupSymbol(token2Detail?.tokenSymbol)}` : ""
  const dustText = `${ bal1txt ? bal1txt+ " + " : "" } ${bal2txt}`

  // useEffect(()=>{
    // setAddVal1(decimal(oldData.asset.token === token1 ? oldData.asset.amount :  (oldData.uusd.token === token1 ? oldData.uusd.amount : "0"), 6))
    // setAddVal2(decimal(oldData.asset.token === token2 ? oldData.asset.amount :  (oldData.uusd.token === token2 ? oldData.uusd.amount : "0"),6))
  // },[transactions, msgs, token1, token2, amount])

  useEffect(()=>{
    const deductTax = [UST,'UUSD'].includes(symbol1.toUpperCase())
    const num = minus(
      findBalanceFn(token1),
        deductTax ? totalTax : "0"
    )
    const maxInput = gt(num, 0)
        ? isNative(token1)
            ? decimal(num, 5)
            : num
        : "0"
    const maxValue = deductTax
        ? gt(maxInput, "100")
            ? minus(maxInput, 10)
            : minus(maxInput, 0.5)
        : maxInput
  
    setValue(
        Key.value,
        isNative(token1) ? decimal(div(plus(maxValue, addVal1), SMALLEST), 3) : decimal(div(plus(maxValue, addVal1), SMALLEST), token1Detail?.decimals ?? 6)
    )
  },[token1, token2, addVal1])

  const fields = {
    ...getFields({
      [Key.value]: {
        label: {
          [Type.PROVIDE]: (
              <TooltipIcon content={Tooltip.Pool.InputAsset}>Asset 1</TooltipIcon>
          ),
          [Type.WITHDRAW]: (
              <TooltipIcon content={Tooltip.Pool.LP}>LP</TooltipIcon>
          ),
        }[type],
        input: {
          type: "number",
          step: step(symbol1),
          placeholder: placeholder(symbol1),
          autoFocus: true,
          ref: valueRef,
          setValue: form.setValue,
          name: Key.value,
          decimal: type === Type.PROVIDE ? 4 : 6,
        },
        className: styles.input,
        unit: delisted ? symbol1 : select.button,
        max: {
          [Type.PROVIDE]: undefined,
          [Type.WITHDRAW]: gt(maxLiquidity?.toString(), 0)
              ? () => {
                const num = div(maxLiquidity, SMALLEST)
                setValue(Key.value, gt(num, 0) ? num : "0")
              }
              : undefined,
        }[type],
        maxValue: {
          [Type.PROVIDE]: gt(findBalanceFn(token1) ?? "0", "0")
              ? () => {
                // if token 1 is UST deduct fee+tax first
                const deductTax = symbol1.toUpperCase() === 'UST'

                const num = minus(
                  findBalanceFn(token1),
                    deductTax ? totalTax : "0"
                )
                const maxInput = gt(num, 0)
                    ? isNative(token1)
                        ? decimal(num, 5)
                        : num
                    : "0"
                const maxValue = deductTax
                    ? gt(maxInput, "100")
                        ? minus(maxInput, 10)
                        : minus(maxInput, 0.5)
                    : maxInput
                    
                return decimal(div(plus(maxValue, addVal1),pow('10', token1Detail?.decimals ?? "6")), token1Detail?.decimals ?? 6)
              }
              : undefined,
          [Type.WITHDRAW]: gt(maxLiquidity, 0)
              ? () => {
                const num = div(maxLiquidity, SMALLEST)
                return gt(num, 0) ? num  : "0"
              }
              : undefined,
        }[type],
        assets: select.assets,
        help: {
          [Type.PROVIDE]: renderBalance(
              token1
                  ? isNative(token1)
                      ? lookupAmount(plus(findBalanceFn(token1), addVal1), 0)
                      : lookupAmount(plus(findBalanceFn(token1), addVal1), token1Detail?.decimals)
                  : ""
          ),
          [Type.WITHDRAW]: renderBalance(
              token1
                  ? maxLiquidity
                  : "0",
              symbol1
          ),
          [Type.WITHDRAW]: renderBalance(token1 ? maxLiquidity : "0", symbol1),
        }[type],
        focused: type === Type.WITHDRAW && select.isOpen,
      },
    }),

    estimated: {
      [Type.PROVIDE]: {
        label: "Asset 2",
        value: shouldClose ? "-" : div(div(toLP?.estimated, check8decOper(token2) ? "100" : "1"), SMALLEST) ?? "",
        unit: select2.button,
        assets: select2.assets,
        help: renderBalance(
            token2
                ? isNative(token2)
                    ? lookupAmount(plus(findBalanceFn(token2), addVal2), 0)
                    : lookupAmount(plus(findBalanceFn(token2), addVal2), token2Detail?.decimals)
                : ""
        ),
        className: styles.input,
        focused: select2.isOpen,
        disabledMax: true,
        max: undefined,
        maxValue:  token2  && token2.length > 0 ? () => "0" : undefined
      },
      [Type.WITHDRAW]: {
        label: (
            <TooltipIcon content={Tooltip.Pool.Output}>Receive</TooltipIcon>
        ),
        value: fromLP?.text ?? "-",
      },
    }[type],
  }

  /* confirm */
  const prefix = lessThanMinimum ? "<" : ""
  // const contents = !gt(
  //     type === Type.WITHDRAW
  //         ? toLP?.estimated ?? "0"
  //         : div(toLP?.estimated, SMALLEST) ?? "0",
  //     0
  // )
  //     ? undefined
  //     : [
  //       {
  //         title: (
  //             <TooltipIcon
  //                 content={
  //                   type == Type.PROVIDE
  //                       ? `${symbol1 ? symbol1 : ""}-${symbol2 ? symbol2 : ""} Price`
  //                       : "Price"
  //                 }
  //             >
  //               {type === Type.PROVIDE
  //                   ? `${symbol1 ? symbol1 : ""}-${symbol2 ? symbol2 : ""} Price`
  //                   : "Price"}
  //             </TooltipIcon>
  //         ),
  //         content: (
  //             <Count format={format} symbol={""}>
  //               {toLP?.estimatedSingle ?? "0"}
  //             </Count>
  //         ),
  //       },
  //       ...insertIf(type === Type.PROVIDE, {
  //         title: (
  //             <TooltipIcon content={Tooltip.Pool.LPfromTx}>
  //               LP from Tx
  //             </TooltipIcon>
  //         ),
  //         content: <Count symbol={LP}>{toLP?.value}</Count>,
  //       }),
  //       ...insertIf(pageName != '/farm-wizard' && (type === Type.WITHDRAW || gt(lpAfterTx, 0)), {
  //         title: "LP after Tx",
  //         content: <Count symbol={LP}>{lpAfterTx}</Count>,
  //       }),
  //       {
  //         title: (
  //             <TooltipIcon content={Tooltip.Pool.PoolShare}>
  //               Pool Share after Tx
  //             </TooltipIcon>
  //         ),
  //         content: (
  //             <Count format={(value) => `${prefix}${percent(value)}`}>
  //               {lessThanMinimum ? minimum : ratio}
  //             </Count>
  //         ),
  //       },
  //     ]

  const tokenNative = isNative(token1)
      ? { native_token: { denom: token1 } }
      : { token: { contract_addr: token1 } }

  const token2Native = isNative(token2)
      ? { native_token: { denom: token2 } }
      : { token: { contract_addr: token2 } }

  const provide_liquidityForContract = {
    assets: [
      { amount: check8decOper(type === Type.WITHDRAW ? lp : token1) ? multiple(amount, 100) : amount, info: { ...tokenNative } },
      {
        amount: multiple(check8decOper(token2) ? div(estimated, 100) : estimated ?? "", SMALLEST),
        info: { ...token2Native },
      },
    ],
  }

  const insertToken1Coins: any = isNative(token1) && {
    amount: amount,
    denom: token1 ?? UUSD,
  }

  const insertToken2Coins: any = isNative(token2) && {
    amount: multiple(estimated ?? "0", SMALLEST),
    denom: token2 ?? UUSD,
  }

  const { contracts } = useProtocol()
  
  /* submit */
  const newContractMsg = useNewContractMsg()
  const data = !estimated
      ? []
      : {
        [Type.PROVIDE]: [
          ...insertIf(
              !isNative(token1),
              newContractMsg(token1, {
                increase_allowance: { amount: check8decOper(type === Type.WITHDRAW ? lp : token1) ? multiple(amount, 100) : amount, spender: pair },
              })
          ),
          ...insertIf(
              !isNative(token2) && estimated,
              newContractMsg(token2, {
                increase_allowance: {
                  amount: multiple(check8decOper(token2) ? div(estimated, 100) : estimated ?? "0", SMALLEST),
                  spender: pair,
                },
              })
          ),
          newContractMsg(
              pair,
              {
                provide_liquidity: provide_liquidityForContract,
              },
              isNative(token1) && insertToken1Coins,
              isNative(token2) && insertToken2Coins
          )
        ],
        [Type.WITHDRAW]: [
          newContractMsg(lp, {
            send: {
              amount,
              contract: pair ?? "",
              msg: toBase64({ withdraw_liquidity: {} }),
            },
          }),
        ],
      }[type]

  /* result */
  const parseTx = usePoolReceipt(type)
  const msgInfo = {
    max: token1
        ? isNative(token1)
            ? multiple(plus(findBalanceFn(token1), addVal1), SMALLEST)
            : plus(findBalanceFn(token1), addVal1)
        : "0",
    value: value,
    symbol: token1,
  }

  const disabled =
      invalid ||
      /* (limitMsgs && limitMsgs.some((limit) => limit)) ||*/
      (type === Type.WITHDRAW && !gt(toLP?.estimated ?? "0", 0))

  const tax = { pretax: uusd, deduct: type === Type.WITHDRAW }

  /* tax */
  const fee = useFee(data?.length)
  const { calcTax } = useTax()
  const calculateTax = tax.pretax ? calcTax(tax.pretax) : "0"

  useEffect(() => {
    setTotalTax(plus(div(calculateTax, SMALLEST), div(fee.amount, SMALLEST)))
  }, [calculateTax])
  
  const container = {
    attrs,
    contents: [],
    hideContent: true,
    disabled,
    data: [...msgs, ...data, newContractMsg(lpToken, {
      increase_allowance: {
        amount:  decimal(toLP?.value, 0),
        spender: contracts["loop_farm_staking_v4"] ?? "",
      },
    }),
    newContractMsg(lpToken, {
      send: {
        contract: contracts["loop_farm_staking_v4"] ?? "",
        amount:  decimal(toLP?.value, 0),
        msg: "eyJzdGFrZSI6e319", //{stake:{}}
      }
    }),
    ...insertIf(agree,  newContractMsg(contracts["loop_farm_staking_v4"], {
      opt_for_auto_compound: {
        pool_address: lpToken ?? "",
        opt_in: true,
      }
    })
    )
  ],
    parseTx,
    msgInfo,
    ...tax,
  }
  const slippageState = useLocalStorage("slippage", "5")
  const [slippageValue] = slippageState
  const slippageError = validateSlippage(slippageValue)

  const slippageContent = (
      <SetManualSlippageTolerance state={slippageState} error={slippageError} />
  )

  const name = {
    [Type.PROVIDE]: undefined,
    [Type.WITHDRAW]:  {
      name: "Withdraw Liquidity",
      className: '',
    },
  }[type]

 /* const [response, setResponse] = useState<TxResult | undefined>(undefined)
  const [error, setError] = useState<PostError>()

  const responseFun = (
      response: TxResult | undefined,
      errorResponse?: PostError
  ) => (response ? setResponse(response) : setError(errorResponse))*/

  const history = useHistory()
  const resetFunc = (type: string = 'done') => {
    if(type === 'done') {
      history.push({
        pathname: getPath(MenuKey.FARMV3)
      })
    }else{
      history.push({
        pathname: getPath(MenuKey.FARM_MIGRATE),
        search: window.location.search
      })
    }
  }
  const maxOnly = false
  const multiLines = false
  const addedAmountPercent = (percent: string) => {
    let inputValue = decimal(multiple(fields[Key.value]?.maxValue?.(), percent ?? "0"), fields[Key.value]?.unit?.token === 'uusd' ? 3 : (fields[Key.value]?.input.decimal ? fields[Key.value]?.input.decimal : 4))
    gt(inputValue, "0") && setValue(
        Key.value,
        inputValue
    )
  }

  return (
      <Grid className={styles.grid}>
        <CustomMsgFormContainer
              {...container}
              {...tax}
              tab={undefined}
              title={name}
              slippage={slippageContent}
              responseFun={farmResponseFun}
              mainSectionClass={styles.mainSection}
              // customActions={()=><Button onClick={stepForward} className={styles.submit} disabled={disabled} type="button" size="lg"  children='Pool' />}
              label={<div className={styles.btn}><img src={icon} alt='' height="22" /> MIGRATE NOW</div>}
              resetFunc={resetFunc}
        >
          <div className={styles.headerStep3}>
            <TooltipIcon className={styles.title} content={Tooltip.Pool.Provide}>Liquidity</TooltipIcon>
            <div className={classnames(styles.slippagePax, multiLines ? styles.slippageFormMultiMax : '')}>
              {!maxOnly && (<><span
                  onClick={() => {
                    addedAmountPercent("0.25")
                  }}
              >
            25%
          </span>
                <span
                    onClick={() => {
                      addedAmountPercent("0.50")
                    }}
                >
            50%
            </span>
                <span
                    onClick={() => {
                      addedAmountPercent("0.75")
                    }}
                >
            75%
            </span>
                <span
                    onClick={() => {
                      addedAmountPercent("1")
                    }}
                >
            MAX
            </span>
              </>)}

            </div>
          </div>
            <div className={styles.NewpoolLiquidityLeft}>
              <div className={styles.NewpoolLiquidityLSET}>
                <FormGroup vertical={true} {...fields[Key.value]} />
              </div>
              <div className={styles.NewpoolLiquidityCenter}>
                <button type={'button'} />
              </div>
              <div className={styles.NewpoolLiquidityLSET}>
                <FormGroup vertical={true} {...fields["estimated"]} />
              </div>
            </div>
          <div className={styles.plus}>
            <img src={plus_icon} height={'10px'} />
          </div>
          <div className={styles.leftOver}>
            <h2>leftover tokens that will be added to your wallet</h2>
            <div className={styles.contents}>
              <h1>{dustText}</h1>
            </div>
          </div>
            <div className={styles.checkbox}>
              <label className={styles.fancy_checkbox}><input checked={agree} onChange={()=> setAgree(!agree)} type="checkbox"/><span></span>

                <h3 className={styles.details}>Enable auto daily compounding. Min farming period 3 months.
                  Can withdraw at any time, but all rewards are forfeited.</h3>
              </label>
                     {/* <input*/}
                     {/*     type={"checkbox"}*/}
                     {/*     checked={agree}*/}
                     {/*     id={"agree"}*/}
                     {/*     onChange={(e) => setAgree(!agree)}*/}
                     {/* />{" "}*/}
                     {/* <label className={styles.label} htmlFor={"agree"}>*/}
                     {/* <span>Enable auto daily compounding. Min farming period 3 months.<br /></span>*/}
                     {/*<span>Can withdraw at any time, but all rewards are forfeited.</span>*/}
                     {/* </label>*/}
                    </div>
                

          </CustomMsgFormContainer>

      </Grid>
  )
}

export default FarmWizardStep3Form
