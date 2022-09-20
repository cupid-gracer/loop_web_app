import { useEffect, useState } from "react"
import classNames from "classnames/bind"
import { useQuery } from "@apollo/client"
import {
  startOfMinute,
  subDays,
  subHours,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns"

import { adjustAmount, commas, decimal, formatAsset, isNative } from "../../../libs/parse"
import {
  ASSETPRICE,
  ASSETPRICEAT,
  ASSETPRICEHISTORY,
} from "../../../statistics/gqldocs"
import useStatsClient from "../../../statistics/useStatsClient"
import { calcChange } from "../../../statistics/useYesterday"
import styles from "./CompareAllPairsChart.large.module.scss"
import { EXCHANGE_TOKEN } from "../../../pages/Exchange"
import { useRecoilValue } from "recoil"
import { menuCollapsed } from "../../../data/app"
import { useTokenMethods } from "../../../data/contract/info"
import MultiLineChartContainer from "../../../containers/MultiLineChartContainer"
import ComputeAllPairsChartFirstDropdown from "../../../components/ComputeAllPairsChartFirstDropdown"
import ComputeAllPairsChartSecondDropdown from "../../../components/ComputeAllPairChartSecondDropdown"
import DOWN_ARROW from "../../../images/down_arrow_polygon.svg"
import Icon from "../../../components/Icon"
import expand_open from "../../../images/icons/expand_open.svg"
import expand_closed from "../../../images/icons/expand_closed.svg"
import { tradingListStore } from "../../../data/API/dashboard"
import { fetchTokenData } from "../../markets/Api"
import { multiple } from "../../../libs/math"
import { SMALLEST, UST } from "../../../constants"

const cx = classNames.bind(styles)

interface Item {
  timestamp: number
  price: number
}

interface Data {
  price: string
  priceAt: string
  history: Item[]
}

interface Response {
  asset: { prices: Data }
}
interface Props {
  token1: EXCHANGE_TOKEN
  token2?: EXCHANGE_TOKEN
}
interface History {
  timestamp: number
  price: string
}

const CompateAllPairsChart = ({ HeaderForm, HeaderStatus }) => {
  const [tokens, setTokens] = useState<any>([])
  const [secondtokens, setSecondTokens] = useState<any>([])
  const [tokenDetail,setTokenDetail]=useState<any>([])

  const default1=tokenDetail.find((item)=>item.token=='terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4')
  const default2=tokenDetail.find((item)=>item.token=='terra1jx4lmmke2srcvpjeereetc9hgegp4g5j0p9r2q')



  const [lpToken, setLpToken] = useState<any>(
    "terra1f0nj4lnggvc7r8l3ay5jx7q2dya4gzllez0jw2"
  )
  const [secondlpToken, setSecondLpToken] = useState<any>(
    "terra1j6l2m2e2q92zkd9v48cs2l4n74rxn2plphul96"
  )

  const [token1Liquidity, setToken1Liquidity] = useState("")
  const [token2Liquidity, setToken2Liquidity] = useState("")


  const [token1MarketCap, setToken1MarketCap] = useState<any>('')
  const [token2MarketCap, setToken2MarketCap] = useState<any>('')

  useEffect(()=>{
    setToken1MarketCap(default1?.market_cap);
    setToken1Supply(default1?.circulating_supply);
    setToken2MarketCap(default2?.market_cap);
    setToken2Supply(default2?.circulating_supply);
  },[default1, default2])

  const [token1Supply, setToken1Supply] =  useState<any>(default1?.circulating_supply )
  const [token2Supply, setToken2Supply] = useState<any>(default2?.circulating_supply )

  const [token1Apy, setToken1Apy] = useState("")
  const [token2Apy, setToken2Apy] = useState("")

  const [heading1,setHeading1]=useState('')
  const [heading2,setHeading2]=useState('')


  const tradingData = useRecoilValue(tradingListStore)
  const currentItem1 = tradingData.find((item) => item.lpToken == lpToken)
  const currentItem2 = tradingData.find((item) => item.lpToken == secondlpToken)



  useEffect(()=>{
    async function fetchData() {
      const tokensDetail=await fetchTokenData()
      setTokenDetail(tokensDetail)
    }
 
    fetchData()
  },[])


  useEffect(()=>{
    
    if(!isNative(tokens[0]?.token) && isNative(tokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==tokens[0].token)
        setToken1MarketCap(currentItem?.market_cap)
        setToken1Supply(currentItem?.circulating_supply)
        setHeading1(currentItem1?.symbol.split('_')[0])

    }
    if(!isNative(tokens[0]?.token) && !isNative(tokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==tokens[1].token)
        setToken1MarketCap(currentItem?.market_cap)
        setToken1Supply(currentItem?.circulating_supply)
        setHeading1(currentItem1?.symbol.split('_')[1])


    }
    if(isNative(tokens[0]?.token) && !isNative(tokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==tokens[1].token)
        setToken1MarketCap(currentItem?.market_cap)
        setToken1Supply(currentItem?.circulating_supply)
        setHeading1(currentItem1?.symbol.split('_')[1])


    }

  },[tokens])

  useEffect(()=>{
   
    if(!isNative(secondtokens[0]?.token) && isNative(secondtokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==secondtokens[0].token)
        setToken2MarketCap(currentItem?.market_cap)
        setToken2Supply(currentItem?.circulating_supply)
        setHeading2(currentItem2?.symbol.split('_')[0])

    }
    if(!isNative(secondtokens[0]?.token) && !isNative(secondtokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==secondtokens[1].token)
        setToken2MarketCap(currentItem?.market_cap)
        setToken2Supply(currentItem?.circulating_supply)
        setHeading2(currentItem2?.symbol.split('_')[1])

    }
    if(isNative(secondtokens[0]?.token) && !isNative(secondtokens[1]?.token)){
      const currentItem=tokenDetail.find((item)=>item.token==secondtokens[1].token)
        setToken2MarketCap(currentItem?.market_cap)
        setToken2Supply(currentItem?.circulating_supply)
        setHeading2(currentItem2?.symbol.split('_')[1])

    }

  },[secondtokens])
  

  useEffect(() => {
    setToken1Liquidity(currentItem1?.totalLocked)
    setToken2Liquidity(currentItem2?.totalLocked)
    setToken1Apy(currentItem1?.APY)
    setToken2Apy(currentItem2?.APY)
  }, [tokens, secondtokens])

  const token1 = {
    token: tokens[0]?.token,
    symbol: tokens[0]?.tokenSymbol,
  }
  const token2 = {
    token: tokens[1]?.token,
    symbol: tokens[1]?.tokenSymbol,
  }

  const token3 = {
    token: secondtokens[0]?.token,
    symbol: secondtokens[0]?.tokenSymbol,
  }
  const token4 = {
    token: secondtokens[1]?.token,
    symbol: secondtokens[1]?.tokenSymbol,
  }

  const now = startOfMinute(new Date())
  // const yesterday = subDays(now, 1).getTime()

  const ranges = [
    {
      label: "1h",
      interval: 1, // 1 minute
      from: subHours(now, 1).getTime(),
      fmt: "dd LLL, yy",
    },
    {
      label: "12h",
      interval: 60 / 12, // 5 minutes
      from: subHours(now, 12).getTime(),
      fmt: "dd LLL, yy",
    },
    {
      label: "1d",
      interval: 60 / 4, // 15 minutes
      from: subDays(now, 1).getTime(),
      fmt: "EEE, dd LLL, HH:mm aa",
    },
    {
      label: "1w",
      interval: 60, // 1 hour
      from: subWeeks(now, 1).getTime(),
      fmt: "EEE, dd LLL, HH:mm aa",
    },
    {
      label: "1M",
      interval: 60 * 24, // 1 day
      from: subMonths(now, 1).getTime(),
      fmt: "dd LLL, yy",
    },
    {
      label: "3M",
      interval: 60 * 24 * 3, // 3 day
      from: subMonths(now, 3).getTime(),
      fmt: "dd LLL, yy",
    },
    {
      label: "1y",
      interval: 60 * 24 * 7, // 1 week
      from: subYears(now, 1).getTime(),
      fmt: "dd LLL, yy",
    },
    {
      label: "all",
      interval: 60 * 24 * 7, // All
      from: subYears(now, 1).getTime(),
      fmt: "dd LLL, yy",
    },
  ]

  /* request */
  const [range, setRange] = useState(ranges[3])
  // const [data, setDate] = useState<Data>()
  // const params = { token: token1.token, ...range, to: now.getTime(), yesterday }
  const historyParams = {
    token: token1.token,
    ...range,
    to: now.getTime(),
    second_token: token2?.token,
  }
  const priceParams = { token: token1.token, second_token: token2?.token }
  const priceAtParams = {
    token: token1.token,
    second_token: token2?.token ?? "",
    timestamp: subDays(now, 1).getTime(),
  }
  const [historyData, setHistoryDate] = useState<History[]>([])
  const [historyData2, setHistoryDate2] = useState<History[]>([])
  const [priceData, serPriceData] = useState<string>()
  const [priceData2, serPriceData2] = useState<string>()
  const [priceAtData, serPriceAtData] = useState<string>()
  const [priceAtData2, serPriceAtData2] = useState<string>()
  const client = useStatsClient()
  const menuCollapsedState = useRecoilValue(menuCollapsed)
  // get history
  const { refetch: refetchHistory } = useQuery<{ getHistory: History[] }>(
    ASSETPRICEHISTORY,
    {
      client,
      variables: historyParams,
      skip: !token1.token || !token2?.token,
      onCompleted: (data) => {
        data && setHistoryDate(data.getHistory)
      },
    }
  )

  // get price
  const { refetch: refetchPrice } = useQuery<{ getPrice: string }>(ASSETPRICE, {
    client,
    variables: priceParams,
    skip: !token1.token || !token2?.token,
    onCompleted: (data) => {
      data && serPriceData(data.getPrice)
    },
  })

  // get priceAt
  const { refetch: refetchPriceAt } = useQuery<{ getPriceAt: string }>(
    ASSETPRICEAT,
    {
      client,
      variables: priceAtParams,
      skip: !token1.token || !token2?.token,
      onCompleted: (data) => {
        data && serPriceAtData(data.getPriceAt)
      },
    }
  )

  // useEffect(() => {
  //   !historyData && refetchHistory()
  //   !priceData && refetchPrice()
  //   !priceAtData && refetchPriceAt()
  // }, [token1, token2, menuCollapsedState])

  /* render */
  const change = calcChange({
    today: priceData ?? "0",
    yesterday: priceAtData ?? "0",
  })

  const { check8decOper, check8decTokens } = useTokenMethods()
  const bothAreWh = check8decTokens(token1.token, token2?.token)

  //for secondPair

  const change2 = calcChange({
    today: priceData2 ?? "0",
    yesterday: priceAtData2 ?? "0",
  })

  const historyParams2 = {
    token: token3.token,
    ...range,
    to: now.getTime(),
    second_token: token4?.token,
  }
  const priceParams2 = { token: token3.token, second_token: token4?.token }
  const priceAtParams2 = {
    token: token3.token,
    second_token: token4?.token ?? "",
    timestamp: subDays(now, 1).getTime(),
  }

  const { refetch: refetchHistory2 } = useQuery<{ getHistory: History[] }>(
    ASSETPRICEHISTORY,
    {
      client,
      variables: historyParams2,
      skip: !token3.token || !token2?.token,
      onCompleted: (data) => {
        data && setHistoryDate2(data.getHistory)
      },
    }
  )

  // get price
  const { refetch: refetchPrice2 } = useQuery<{ getPrice: string }>(
    ASSETPRICE,
    {
      client,
      variables: priceParams2,
      skip: !token3.token || !token4?.token,
      onCompleted: (data) => {
        data && serPriceData2(data.getPrice)
      },
    }
  )

  const { refetch: refetchPriceAt2 } = useQuery<{ getPriceAt2: string }>(
    ASSETPRICEAT,
    {
      client,
      variables: priceAtParams2,
      skip: !token3.token || !token4?.token,
      onCompleted: (data) => {
        data && serPriceAtData2(data.getPriceAt2)
      },
    }
  )

  useEffect(() => {
    // !historyData2 && refetchHistory2()
    // !priceData2 && refetchPrice2()
    // !priceAtData2 && refetchPriceAt2()
  }, [token3, token4, menuCollapsedState])

  useEffect(() => {
    setInterval(() => {
      if (tokens) {
        refetchHistory()
        refetchPrice()
        refetchPriceAt()
        refetchHistory2()
        refetchPrice2()
        refetchPriceAt2()
      }
    }, 10000)
  }, [])

  const bothAreWh2 = check8decTokens(token3.token, token4?.token)

  const secondPairData = historyData2?.map(({ timestamp: t, price: y }) => {
    const price = adjustAmount(bothAreWh2, check8decOper(token4?.token), y)
    return { y: price, t }
  })
  const firstPairData = historyData?.map(({ timestamp: t, price: y }) => {
    const price = adjustAmount(bothAreWh, check8decOper(token2?.token), y)
    return { y: price, t }
  })

  const dataSource1 = [...firstPairData]
  const dataSource2 = [...secondPairData]

  return (
    <div className={styles.component}>
      <header className={styles.header}>
        <span className={classNames(styles.displayFlex)}>
          <span
            className={classNames(
              styles.priceDropdown,
              styles.priceDropdownPrices
            )}
          >
            Price
            {/* <img src={DOWN_ARROW} alt='down_arrow'/> */}
          </span>
          <span className={styles.assetDropdown}>
            <ComputeAllPairsChartFirstDropdown
              // tokensDetail={tokens}
              setTokens={setTokens}
              lpProp="terra1f0nj4lnggvc7r8l3ay5jx7q2dya4gzllez0jw2"
              setLpToken={setLpToken}
            />
          </span>

          <span className={styles.assetDropdown}>
            <ComputeAllPairsChartSecondDropdown
              // tokensDetail={secondtokens}
              setTokens={setSecondTokens}
              lpProp="terra1j6l2m2e2q92zkd9v48cs2l4n74rxn2plphul96"
              setLpToken={setSecondLpToken}
            />
          </span>
        </span>
        <section className={styles.ranges}>
          {ranges.map((r) => (
            <button
              type="button"
              className={cx(styles.button, { active: r.label === range.label })}
              onClick={() => setRange(r)}
              key={r.label}
            >
              {r.label}
            </button>
          ))}
        </section>
        <HeaderForm />
      </header>

      {HeaderStatus && (
        <>
          <div className={styles.chart}>
            <MultiLineChartContainer
              change={change2}
              datasets1={dataSource1}
              datasets2={dataSource2}
              fmt={{ t: range.fmt }}
              multiAxes={true}
              dataSet1Label={
                tokens[0]?.tokenSymbol + "_" + tokens[1]?.tokenSymbol
              }
              dataSet2Label={
                secondtokens[0]?.tokenSymbol +
                "_" +
                secondtokens[1]?.tokenSymbol
              }
            />
          </div>
          <div className={styles.footer}>
            <ul className={styles.section}>
              <li>
                <span>
                  <span className={styles.token_one}>{heading1}</span>{" "}
                  MARKET CAP
                </span>
                <p>{token1MarketCap>'0' ? formatAsset(multiple(token1MarketCap, SMALLEST), UST): '-' } </p>
              </li>
              <li>
                <span>CIRCULATING SUPPLY</span>
                <p>{token1Supply>'0' ? commas(token1Supply) : '-' }</p>
              </li>
              <li>
                <span>TOTAL LIQUIDITY</span>
                <p>{commas(decimal(token1Liquidity, 0))} UST</p>
              </li>
              <li>
                <span>VOLUME</span>
                <p>{'-'}</p>
              </li>
              <li>
                <span>APY on Loop</span>
                <p>{decimal(token1Apy, 2)}%</p>
              </li>
            </ul>
          </div>
          <div className={styles.footer}>
            <ul className={styles.section}>
              <li>
                <span>
                  <span className={styles.token_two}>{heading2}</span>{" "}
                  MARKET CAP
                </span>
                <p>{token2MarketCap>'0' ? commas(token2MarketCap) + ' ' + 'UST' : '-' }</p>
              </li>
              <li>
                <span>CIRCULATING SUPPLY</span>
                <p>{token2Supply>'0' ? commas(token2Supply) : '-'}</p>
              </li>
              <li>
                <span>TOTAL LIQUIDITY</span>
                <p>{commas(decimal(token2Liquidity, 0))} UST</p>
              </li>
              <li>
                <span>VOLUME</span>
                <p>{'-'}</p>
              </li>
              <li>
                <span>APY on Loop</span>
                <p>{commas(decimal(token2Apy, 2))}%</p>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default CompateAllPairsChart
