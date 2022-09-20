import {useEffect, useState} from "react"
import {
    FarmContractTYpe,
    useFindDevTokensByLpFarm2,
    useFindStakedByUserFarmQueryFarm2
} from "../../../data/farming/FarmV2"
import useNewContractMsg from "../../../terra/useNewContractMsg"
import {div, gt, lt, minus, multiple, number, plus, pow} from "../../../libs/math"
import {MIN_FEE, SMALLEST, UST, UUSD} from "../../../constants"
import {toBase64} from "../../../libs/formHelpers"
import {FactoryType, useContractsList, useFarms, useFindBalance} from "../../../data/contract/normalize"
import {CONTRACT} from "../../../hooks/useTradeAssets"
import {useProtocol} from "../../../data/contract/protocol"
import Page from "../../../components/Page"
import usePoolDynamic from "../../../forms/Pool/usePoolDynamic"
import {useTokenMethods} from "../../../data/contract/info"
import {usePoolPairPool, usePoolPairPoolList} from "../../../data/contract/migrate"
import {useContractsV2List} from "../../../data/contract/factoryV2"
import {insertIf} from "../../../libs/utils"
import {commas, decimal, isNative, lookupAmount, lookupSymbol} from "../../../libs/parse"
import {useFindTokenDetails} from "../../../data/form/select"
import FormContainer from "../../../forms/FormContainer"
import {Container} from "semantic-ui-react"
import styles from './FarmQuickMigrate.module.scss'
import {lte} from "ramda"
import icon from '../../../images/icons/24-pool-black.svg'
import Steps from "../../../components/Static/Steps"
import Header from "../FarmWizard/Header"
import {getICon2, getPath, MenuKey} from "../../../routes"
import classNames from "classnames"
import plus_icon from '../../../images/icons/+.svg'
import {useHistory} from "react-router-dom";

const queryString = require('query-string')

const useUnformStep1 = ({lpToken, farmType}:{farmType: FarmContractTYpe, lpToken: string}) => {

    const findStakedByUserFarmFn = useFindStakedByUserFarmQueryFarm2(farmType)
    const findStaked  = findStakedByUserFarmFn(lpToken) ?? "0"
    const user_staked = findStaked
    const { contracts } = useProtocol()
    const newContractMsg = useNewContractMsg()
    const contract:any = contracts[farmType] ?? ""
    const FindDevTokensByLpFarm2 = useFindDevTokensByLpFarm2(farmType)
    const devTokenFarm2 = FindDevTokensByLpFarm2?.(lpToken ?? "")
    
    return {
        msgs: lte(user_staked, "0") ? [] : [
            newContractMsg(devTokenFarm2 ?? '', {
              send: {
                contract: contract,
                amount: user_staked,
                msg: "eyJ1bnN0YWtlX2FuZF9jbGFpbSI6e319", //{unstake_and_claim:{}}
              },
            })
          ],
        value: user_staked,
        contents: []
    }
}

const useWithdrawStep2 = ({lpToken, farmType}:{farmType: FarmContractTYpe, lpToken: string}) => {

    const { value, msgs } = useUnformStep1({farmType, lpToken})
    const [time, setTime]  = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setTime(true), 2000);
    return () => {
      clearTimeout(timeout);
    }
  }, [])
    const { contents: findPair } = useContractsList()
    const pair = findPair?.find((list: CONTRACT) => list.lp === lpToken)?.pair ?? ''
    const token1 = lpToken
    
    const maxLiquidity = value
    const amount = maxLiquidity
    
    const { check8decOper } = useTokenMethods()
    const getPool = usePoolDynamic(123)
    const { contents: poolResult} = usePoolPairPool(pair ?? "")

    const pool = token1
      ? getPool({
        amount: check8decOper(lpToken) ? multiple(amount, 100) : amount,
        token: lpToken,
        token2: UST,
        pairPoolResult: poolResult,
        type: 'withdraw',
      })
      : undefined

    const newContractMsg = useNewContractMsg()
    
    const data = (lpToken && pair) ? [
          newContractMsg(lpToken, {
            send: {
              amount: amount,
              contract: pair ?? "",
              msg: toBase64({ withdraw_liquidity: {} }),
            },
          }),
        ] : []
    
    return {
        msgs: lte(amount, "0") ? [...msgs] : [...msgs,...data],
        value: pool?.fromLP,
        contents: [pool?.fromLP.text],
        balance: maxLiquidity
    }
}

const useProvideStep3 = ({lpToken: lp, ticker, farmType}:{farmType: FarmContractTYpe, ticker: string, lpToken: string}) => {

    const { value, msgs, balance, contents } = useWithdrawStep2({farmType, lpToken: lp})
    
    const factoryPairs = useFarms(FactoryType.fac2)
    const { check8decOper } = useTokenMethods()
    const{ contents: findLpTokens } = useContractsV2List()
    const [tokens, setTokens] = useState<string[]|undefined>(undefined)
    const [pair, setPair] = useState<string>('')
    const [lpToken, setLpToken] = useState<string>('')
    const [reverse, setReverse] = useState(false)
    const [token1, setToken1] = useState('')
    const [token2, setToken2] = useState('')
    const [amount, setAmount] = useState<string>('0')
    const [addVal1, setAddVal1] = useState<string>('0')
    const [addVal2, setAddVal2] = useState<string>('0')
    const [time, setTime]  = useState(false)

    const getTokenBalanceFn = useFindBalance()

    useEffect(()=>{
        const tokenList = findLpTokens?.filter((item) => item.lp === lpToken) ?? []
        lpToken && setTokens(tokenList.map((item)=> item.contract_addr))
    },[lpToken,findLpTokens])

    useEffect(()=>{
        if(ticker){
            const row = factoryPairs?.find((item) => {
                const symbol = item.symbol.toLowerCase().replace(/\s/g, '').split('-')
                const tick = ticker.toLowerCase().replace(/\s/g, '')
                const found = tick.includes(symbol?.[0] ?? '') && tick.includes(symbol?.[1] ?? '')
                return found ?? false
            })
            if(row){
                setLpToken(row.lpToken)
                setPair(row.contract_addr)
            }
        }
    },[ticker, factoryPairs])

    const findTokenDetailFn = useFindTokenDetails()

    useEffect(()=>{
      setToken1(tokens ?  tokens[0] : '')
      setToken2(tokens ?  tokens[1] : '')
    },[tokens])

    const token1Detail = findTokenDetailFn(tokens?.[0] ?? token1)
    const token2Detail = findTokenDetailFn(tokens?.[1] ?? token2)
    const oldData = value

  useEffect(() => {
    const timeout = setTimeout(() => setTime(true), 2000);
    return () => {
      clearTimeout(timeout);
    }
  }, [])
  
    useEffect(()=>{
        setAmount(multiple(addVal1, SMALLEST))
      },[token1, token2, value?.value, addVal1, time])

    const { contents: poolPairPoolList} = usePoolPairPoolList()
    const poolResult: any = poolPairPoolList?.[pair ?? ""]
    const getPool = usePoolDynamic(value?.value)

    const perTokenPoolValue = token1
      ? getPool({
        amount: SMALLEST.toString(),
        token:  token1,
        token2: token2 ?? UST,
        pairPoolResult: poolResult,
        type: 'provide',
      })
      : undefined
   
    const pool = token1
      ? getPool({
        amount: decimal(addVal1, 0),
        token:token1,
        token2: token2 ?? UST,
        pairPoolResult: poolResult,
        type: 'provide',
      })
      : undefined


      // in reverse
      const perTokenPoolValueReverse = token2
      ? getPool({
        amount: SMALLEST.toString(),
        token:token2,
        token2: token1 ?? UST,
        pairPoolResult: poolResult,
        type: 'provide',
      })
      : undefined

    const poolReverse = token1
        ? getPool({
            amount: decimal(addVal2, 0),
            token:token2,
            token2: token1 ?? UST,
            pairPoolResult: poolResult,
            type: 'provide',
        })
        : undefined

  const toLP = pool?.toLP
  const estimated = div(pool?.toLP.estimated, SMALLEST)
  
  useEffect(()=>{
    if(oldData){
    setAddVal1(decimal(oldData?.asset.token === token1 ? oldData?.asset.amount :  (oldData?.uusd.token === token1 ? oldData?.uusd.amount : "0"),6))
    setAddVal2(decimal(oldData?.asset.token === token2 ? oldData?.asset.amount :  (oldData?.uusd.token === token2 ? oldData?.uusd.amount : "0"),6))
    }
  },[amount, token1, token2, oldData, time, toLP?.estimated])

  useEffect(() => {
    const secondTokenMax = token2
    ? isNative(token2)
        ? lookupAmount(addVal2, 0)
        : lookupAmount(addVal2, token2Detail?.decimals)
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
          !gt(adjustedValue, addVal2) && token2

      valid &&
      setAmount(multiple(isNative(token1) ? decimal(calculatedVal, 3) : calculatedVal, SMALLEST))
    }
  }, [toLP, token1, token2, addVal2, perTokenPoolValue, time])
  
    const tokenNative = isNative(token1)
    ? { native_token: { denom: token1 } }
    : { token: { contract_addr: token1 } }

    const token2Native = isNative(token2)
        ? { native_token: { denom: token2 } }
        : { token: { contract_addr: token2 } }

    const forStakeVal = decimal(div(amount, pow('10', token1Detail?.decimals ?? 6)), 0)

    const provide_liquidityForContract = {
    assets: [
        { amount: forStakeVal, info: { ...tokenNative } },
        {
        amount: multiple(estimated ?? "", pow('10', token2Detail?.decimals ?? 6)),
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

  const perPoolVal = perTokenPoolValue?.fromLP.asset.token === token1 ? perTokenPoolValue?.fromLP.asset.amount : perTokenPoolValue?.fromLP.uusd.amount

  const perPool = div(perPoolVal,  pow('10', token1Detail?.decimals ?? '6'))
  const reverPoolVal = perTokenPoolValueReverse?.fromLP.asset.token === token2 ? perTokenPoolValueReverse?.fromLP.asset.amount : perTokenPoolValueReverse?.fromLP.uusd.amount

  const reverPool = div(reverPoolVal,  pow('10', token2Detail?.decimals ?? '6'))
  const lpBeforeTx1 = div('1', reverse ? reverPool : perPool)
  const lpBeforeTx2 = multiple(multiple(lpBeforeTx1, reverse ? div(addVal2, pow('10', token2Detail?.decimals ?? 6)) : div(addVal1, pow('10', token1Detail?.decimals ?? 6))), pow('10', token1Detail?.decimals ?? '6'))

  const onePercent = div(lpBeforeTx2, '100')

    const fpool1 = reverse ? addVal2 : addVal1
    const fpool2 =  reverse ? poolReverse?.toLP.estimated : multiple(estimated,SMALLEST)

    const calToken1 = reverse ? token2 : token1
    const calToken2 = reverse ? token1 : token2
    const calToken1Detail  = reverse ? token2Detail : token1Detail
    const calToken2Detail  = reverse ? token1Detail : token2Detail
    const tpool1 =  decimal(value?.asset.token === calToken1 ? value?.asset.amount : value?.uusd.amount, number(pow('10', calToken1Detail?.decimals ?? 6)))
    const tpool2 =  value?.asset.token === calToken2 ? value?.asset.amount : value?.uusd.amount

    const dust1 = decimal(minus(tpool1, fpool1),6)
    const dust2 = decimal(div( minus(tpool2, fpool2), pow('10', calToken2Detail?.decimals ?? 6)),  6)
    // const bal1 = div(getTokenBalanceFn?.(reverse ? token2 : token1), pow('10', calToken1Detail?.decimals ?? 6))
    // const bal2 = div(getTokenBalanceFn?.(reverse ? token1 : token2), pow('10', calToken2Detail?.decimals ?? 6))
    const balance1 = dust1
    const balance2 = dust2

    const bal1txt = gt(balance1, "0") ? `${commas(balance1)} ${lookupSymbol(token1Detail?.tokenSymbol)}` : ""
    const bal2txt = gt(balance2, "0") ? `${commas(balance2)} ${lookupSymbol(token2Detail?.tokenSymbol)}` : ""
    const dustText = `${ bal1txt ? bal1txt+ " + " : "" } ${bal2txt}`

  const { contracts } = useProtocol()
  const newContractMsg = useNewContractMsg()
      
    const data = [
        // in case of reverse
        ...insertIf(
          reverse && !isNative(token2),
            newContractMsg(token2, {
              increase_allowance: { amount: decimal(addVal2, 0), spender: pair },
            })
      ),
        ...insertIf(
            !isNative(token1) && !reverse,
            newContractMsg(token1, {
              increase_allowance: { amount: decimal(addVal1, 0), spender: pair },
            })
        ),
        // in case of reverse
        ...insertIf(
          (!isNative(token1) && poolReverse?.toLP?.estimated) && reverse,
            newContractMsg(token1, {
              increase_allowance: {
                amount: poolReverse?.toLP?.estimated ?? "0",
                spender: pair,
              },
            })
      ),
        ...insertIf(
            (!isNative(token2) && estimated) && !reverse,
            newContractMsg(token2, {
              increase_allowance: {
                amount: multiple(estimated ?? "0", pow('10', token2Detail?.decimals ?? 6)),
                spender: pair,
              },
            })
        ),
        // in case of reverse
        ...insertIf(
          reverse,
          newContractMsg(
            pair,
            {
              provide_liquidity: {
                assets: [
                    { amount: poolReverse?.toLP?.estimated ?? "0", info: isNative(token1)
                      ? { native_token: { denom: token1 } }
                      : { token: { contract_addr: token1 } } 
                    },
                    {
                    amount: decimal(addVal2, 0) ?? "0",
                    info: isNative(token2)
                    ? { native_token: { denom: token2 } }
                    : { token: { contract_addr: token2 } },
                    },
                ]}
            },
            isNative(token1) && isNative(token1) && {
              amount: poolReverse?.toLP?.estimated ?? "0",
              denom: token1 ?? UUSD,
            },
            isNative(token2) && isNative(token2) && {
              amount: decimal(addVal2, 0),
              denom: token2 ?? UUSD,
            }
        ),
      ),
       ...insertIf(!reverse,  newContractMsg(
        pair,
        {
          provide_liquidity: provide_liquidityForContract,
        },
        isNative(token1) && insertToken1Coins,
        isNative(token2) && insertToken2Coins
        )),
        // in case of reverse
        ...insertIf(reverse,
          newContractMsg(lpToken, {
          increase_allowance: {
            amount:  decimal(minus(lpBeforeTx2, onePercent), 0),
            spender: contracts["loop_farm_staking_v4"] ?? "",
          },
        })),
        ...insertIf(!reverse,
          newContractMsg(lpToken, {
          increase_allowance: {
            amount:  decimal(minus(lpBeforeTx2, onePercent), 0),
            spender: contracts["loop_farm_staking_v4"] ?? "",
          },
        })),
        // in case of reverse
        ...insertIf(reverse, 
          newContractMsg(lpToken, {
            send: {
              contract: contracts["loop_farm_staking_v4"] ?? "",
              amount:  decimal(minus(lpBeforeTx2, onePercent), 0),
              msg: "eyJzdGFrZSI6e319", //{stake:{}}
            }
          })),
          ...insertIf(!reverse, 
            newContractMsg(lpToken, {
              send: {
                contract: contracts["loop_farm_staking_v4"] ?? "",
                amount:  decimal(minus(lpBeforeTx2, onePercent), 0),
                msg: "eyJzdGFrZSI6e319", //{stake:{}}
              }
            })),
      ]

      useEffect(()=>{
        if(gt(toLP?.estimated, addVal2)){
          setReverse(true)
        }
      },[toLP?.estimated, oldData, token1, token2, amount])

    const estimatedFlag = reverse ? poolReverse?.toLP?.estimated : estimated

    const check = [
      lte(check8decOper(token1) ? multiple(amount, 100) : amount, "0"),
      lte(decimal(toLP?.value, 0), "0"),
      lte(multiple(check8decOper(token1) ? div(estimatedFlag, 100) : estimatedFlag ?? "0", SMALLEST), "0"),
      lte(multiple(check8decOper(token2) ? div(estimatedFlag, 100) : estimatedFlag ?? "", SMALLEST), "0")
    ].some(Boolean)

    return {
        msgs: check ? [...msgs] : [...msgs,...data],
        value: pool?.fromLP,
        lpToken: lpToken,
        contents: [...contents],
        balance: balance ?? '0',
        dustText,
    }
}

export const useFarmSearchQuery = () => {
    const [farmType, setFarmType]  = useState<FarmContractTYpe>(FarmContractTYpe.Farm2)
    const [lpToken, setLp]  = useState('')
    const [ticker, setTicker]  = useState('')

    useEffect(()=>{
        const  query= queryString.parse(window.location.search);

        if (query.lp) {
            setLp(query.lp)
        }
        if (query.ticker) {
            setTicker(query.ticker)
        }
        if (query.ticker) {
            setFarmType(query.type)
        }
    },[window.location.search, queryString])

    return {
        lpToken,
        ticker,
        farmType
    }
}
export function FarmQuickMigrate() {
    const [farmType, setFarmType]  = useState<FarmContractTYpe>(FarmContractTYpe.Farm2)
    const [lpToken, setLp]  = useState('')
    const [ticker, setTicker]  = useState('')
    const [time, setTime]  = useState(false)

    useEffect(() => {
      const timeout = setTimeout(() => setTime(true), 3000);
      return () => {
        clearTimeout(timeout);
      }
    }, [])

    useEffect(()=>{
        const  query= queryString.parse(window.location.search);

        if (query.lp) {
            setLp(query.lp)
        }
        if (query.ticker) {
            setTicker(query.ticker)
        }
        if (query.ticker) {
            setFarmType(query.type)
        }
    },[window.location.search, queryString])

    const step = useProvideStep3({farmType, ticker, lpToken})
    const { contracts } = useProtocol()
    const newContractMsg = useNewContractMsg()

    const transactions = [...step.msgs,
      newContractMsg(contracts["loop_farm_staking_v4"], {
      opt_for_auto_compound: {
        pool_address: step.lpToken ?? "",
        opt_in: true,
      }
    })
    ]

    const parseTx = undefined
    const container = {
      contents: undefined,
      messages: undefined,
      disabled: time === false || lt(transactions?.length, "7"),
      data: transactions,
      parseTx,
      label: <div className={styles.btn}><img src={icon} alt='' height="25" /> { time ? 'MIGRATE TO NEW FARM!' : 'Loading...' }</div>,
  }
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

    return (
    <Page className={styles.page}>
      <article className={styles.container}>
      <Container sm>
          <FormContainer  {...container} onReset={resetFunc} afterSubmitChilds={<div className={styles.notes}><p>Please make sure the values above are correct. Your new farm position is at the top,</p><p>and the remaining tokens that will be added to your wallet is below.</p></div>} >
        <Header current="2" />
        <Steps maxSteps={'2'} current="2" />
        <h1 className={classNames(styles.title, styles.heading)}>New Position Summary</h1>
        <div className={styles.token}>
              <div>
              <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(ticker?.split("-")[0]?.trim().toUpperCase())}
                                    alt=" "
                                />
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(ticker?.split("-")[1]?.trim().toUpperCase())}
                                    alt=" "
                                />
              </div>
              <div className={styles.token}>
                <h2 className={styles.heading}>{ticker}</h2>
                <p className={styles.balance}>Balance: {div(step?.balance ?? "0", SMALLEST)} LP</p>
              </div>
            </div>
            <div className={styles.contents}>
              {
                step?.contents?.map((item)=>(<h1>{item}</h1>))
              }
            </div>
          <div className={styles.plus}>
            <img src={plus_icon} height={'10px'} />
          </div>
            <div className={styles.leftOver}>
                <h2>leftover tokens that will be added to your wallet</h2>
                <div className={styles.contents}>
                   <h1>{step?.dustText}</h1>
                </div>
            </div>
              { (time && lt(transactions?.length, "7")) && <p className={styles.danger}>Oops, something went wrong! Please refresh page and try again</p> }
                    {/* <div >
                      <h2>tx fee from pool v1 collected</h2>
                      <p>&</p>
                      <h2> $7,500 LUNA + $7,500 LOOP </h2>
                      <h2>Added to pool v3 and farming v3</h2>
                      <h2>Estimated APR: $15,000/year</h2>
                      <h2>231 LUNA + 3,231 LOOP added to wallet balance</h2>
                    </div> */}
      </FormContainer>
      </Container>
      </article>
        <div style={{display: 'none'}}>
        {
          JSON.stringify(transactions, null, 2)   
        }
        </div>
    </Page>
  )
}