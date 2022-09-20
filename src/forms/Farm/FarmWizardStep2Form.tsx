import useNewContractMsg from "../../terra/useNewContractMsg"
import {LOOP, SMALLEST, UST} from "../../constants"
import {div, lte, multiple, plus} from "../../libs/math"
import {lookupSymbol, toAmount} from "../../libs/parse"
import useForm from "../../libs/useForm"
import {placeholder, renderBalance, step, toBase64, validate as v,} from "../../libs/formHelpers"

import FormGroup from "../../components/FormGroup"
import {Type} from "../../pages/PoolDynamic"
import {PostError} from "../FormContainer"
import {useEffect, useState} from "react"
import styles from "../../pages/LoopStake.module.scss"
import {TxResult} from "@terra-money/wallet-provider"
import {useFindBalance} from "../../data/contract/normalize"
import MiniFormContainer from "../MInFormContainer";
import {useRecoilValue} from "recoil";
import {depositedQuery, useTokenMethods} from "../../data/contract/info"
import {useProtocol} from "../../data/contract/protocol";
import usePoolReceipt from "../receipts/usePoolReceipt";
import useSelectSwapAsset from "../Exchange/useSelectSwapAsset";
import {AssetBalanceKey, BalanceKey, PriceKey} from "../../hooks/contractKeys";
import {TooltipIcon} from "../../components/Tooltip";
import Tooltip from "../../lang/Tooltip.json";
import usePoolDynamic from "../Pool/usePoolDynamic";
import {usePoolPairPool} from "../../data/contract/migrate";
import {useFindTokenDetails} from "../../data/form/select";
import { useFarmMigrate } from "../../pages/Farm/FarmWizard/useFarmMigrate"
import { useFindStakedByUserFarmQueryFarm2, FarmContractTYpe, useFindDevTokensByLpFarm2} from '../../data/farming/FarmV2'
import { insertIf } from "../../libs/utils"
import { getICon2 } from "../../routes"
import icon from '../../images/icons/24-pool-black.svg'

enum Key {
  token1 = "token1",
  value = "value",
  pair = "pair",
  lp = "lp",
}

interface Props {
  type: Type
  lpToken: string
  pairProp: string
  farmType: FarmContractTYpe,
  farmResponseFun?: (
    res: TxResult | undefined,
    err?: PostError | undefined
  ) => void
}

const FarmWizardStep2Form = ({
  farmType,
  type,
  lpToken,
  farmResponseFun,
                               pairProp,
}: Props) => {
  const priceKey = PriceKey.PAIR
  const balanceKey = {
    [Type.PROVIDE]: BalanceKey.TOKEN,
    [Type.WITHDRAW]: BalanceKey.LPSTAKABLE,
  }[type]

  /* context */
  const { getToken, contracts } = useProtocol()
  const { getSymbol } = useTokenMethods()
  const findTokenDetailFn = useFindTokenDetails()
  // const findBalanceFn = useFindBalance()
  const { check8decOper } = useTokenMethods()
  const findStakedByUserFarmFn = useFindStakedByUserFarmQueryFarm2(farmType)

  const findStaked  = findStakedByUserFarmFn(lpToken) ?? "0"
  
  const deposited:any =  depositedQuery

  const user_staked  = useRecoilValue<string | undefined>(deposited)
  const findBalance = useFindBalance()

  /* form:validate */
  const validate = ({ value, token1, lp, pair }: Values<Key>) => {
    const symbol = getSymbol('')
    return {
      [Key.token1]: v.required(token1),
      [Key.pair]: v.required(pair),
      [Key.lp]: v.required(lp),
      [Key.value]: type === Type.WITHDRAW ? v.required(div(user_staked, SMALLEST)) : v.amount(value, { symbol, max: findBalance(getToken(LOOP)) })
    }
  }
  
  /* form:hook */
  const initial = {
    [Key.token1]: lpToken ?? "",
    [Key.pair]:  pairProp ?? "",
    [Key.lp]: lpToken ?? "",
    [Key.value]: type === Type.WITHDRAW ? div(user_staked, SMALLEST) : "9",
  }
  
  const form = useForm<Key>(initial, validate)
  const { values, setValue, getFields, attrs, invalid, setValues } = form
  const { token1, value, pair, lp } = values
  
  const token1Detail = findTokenDetailFn(token1 ?? lp ?? lpToken, "lp")
  const symbol = token1Detail ? lookupSymbol(token1Detail.tokenSymbol) : ""
  const amount = toAmount(value)

  const { messages: msgs,step: currentStep, transactions,   store } = useFarmMigrate()
  
  const maxLiquidity = findStaked ?? "0"
  
  const onSelect = (name: Key) => (token: string, pair: string | undefined) => {
    const pairs = { pair: pair, lp: token ?? "" }
    const next: Partial<Record<Key, Partial<Values<Key>>>> = {
      [Key.token1]: { token1: token1, ...pairs },
    }
    setValues({ ...values, ...next[name], [name]: token })
  }

  const config = {
    token: token1 ?? lp ?? lpToken,
    onSelect: onSelect(Key.token1),
    symbol: symbol,
    priceKey,
    balanceKey,
    disabled: true,
    formatTokenName: undefined,
    formatPairToken: true,
    showAsPairs: true,
    balanceType: AssetBalanceKey.LP,
    showQuickTokens: false,
    tokenIndex: 1
  }

  const select = useSelectSwapAsset({ ...config })

  const getPool = usePoolDynamic(123)
  const { contents: poolResult} = usePoolPairPool(pair ?? "")

  const pool = token1
      ? getPool({
        amount: check8decOper(lp ?? lpToken) ? multiple(amount, 100) : amount,
        token: lp ?? lpToken,
        token2: UST,
        pairPoolResult: poolResult,
        type,
      })
      : undefined

  const fromLP = pool?.fromLP

  const fields = {
    ...getFields({
      [Key.value]: {
        label: "Withdraw liquidity",
        input: {
          type: "number",
          step: step(symbol),
          placeholder: placeholder(symbol),
          autoFocus: true,
          disabled: true,
          setValue: setValue,
          name: Key.value,
        },
        hideInput: true,
        help: renderBalance(token1 ? div(maxLiquidity, SMALLEST) : "0", symbol),
        smScreen: true,
        unit: select.button,
        assets: select.assets,
        maxOnly: true,
        // max: () => {
        //   setValue(Key.value, div(maxLiquidity, SMALLEST))
        // },
        max: undefined,
        maxValue: undefined
        // maxValue: () => div(maxLiquidity, SMALLEST)
      },
    }),
    estimated: {
      label: (
          <TooltipIcon content={Tooltip.Pool.Output}>Receive</TooltipIcon>
      ),
      value: fromLP?.text ?? "-",
    }
  }

  useEffect(()=>{
    lpToken && setValues({...values, [Key.token1]: lpToken, [Key.lp]: lpToken, [Key.value]: div(maxLiquidity ?? "0", SMALLEST), [Key.pair]: pairProp ?? "" })
  },[lp, lpToken, maxLiquidity, pairProp])

  const contents = undefined
  const FindDevTokensByLpFarm2 = useFindDevTokensByLpFarm2(farmType)
  const devTokenFarm2 = FindDevTokensByLpFarm2?.(lpToken ?? "")
  
  /* submit */
  const newContractMsg = useNewContractMsg()
  const data = {
    [Type.WITHDRAW]: [
      ...insertIf(user_staked, 
        newContractMsg(devTokenFarm2 ?? '', {
          send: {
            contract: contracts[farmType] ?? "",
            amount: findStaked,
            msg: "eyJ1bnN0YWtlX2FuZF9jbGFpbSI6e319", //{unstake_and_claim:{}}
          },
        })),
      ...insertIf(((lp ?? lpToken) && pair), 
      newContractMsg(lp ?? lpToken, {
        send: {
          amount,
          contract: pair ?? "",
          msg: toBase64({ withdraw_liquidity: {} }),
        }
      }))
    ]
  }[type as Type]

  const messages = undefined
  const disabled = invalid || lte(maxLiquidity ?? "0", "0")

  /* result */
  const parseTx = usePoolReceipt(type)

  const container = {
    attrs,
    contents,
    messages,
    disabled,
    data,
    parseTx,
  }

  const [response, setResponse] = useState<TxResult | undefined>()

  const stepForward = () =>{
    !(disabled) && store.step(plus(currentStep, '1').toString())
    !(disabled) && store.messages([...msgs, ...data])
    !(disabled) && store.transactions({...transactions, '2': pool?.fromLP})
  }
  
  return (
    <MiniFormContainer
      farmResponseFun={farmResponseFun}
      {...container}
      extResponse={response}
      className={styles.mimiContainer}
      customActions={()=><></>}
        label={'WITHDRAW LP AND TX PROFIT'}
    >
      <section>
        <div className={styles.multiLinesForm}>
          <div className={styles.full_submit_input}>
            {/* <FormGroup {...fields[Key.value]} vertical={true} multiLines={true} /> */}
            <div className={styles.token}>
              <div>
                      <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol?.split("-")[0]?.trim().toUpperCase())}
                                    alt=" "
                                />
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol?.split("-")[1]?.trim().toUpperCase())}
                                    alt=" "
                                />
              </div>
              <div className={styles.token}>
                <h2 className={styles.title}>{symbol}</h2>
                <p className={styles.balance}>Balance: {div(maxLiquidity ?? "0", SMALLEST)} LP</p>
              </div>
            </div>
            <FormGroup {...fields["estimated"]} className={styles.input} vertical={true} />
          </div>
          <div className={styles.full_submit}>
            <button className={styles.button} type='button' onClick={stepForward} disabled={disabled} ><img src={icon} alt='' height="25" /> NEXT</button>
          </div>
        </div>
      </section>
    </MiniFormContainer>
  )
}

export default FarmWizardStep2Form
