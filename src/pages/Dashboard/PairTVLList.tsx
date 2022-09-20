import { SMALLEST, UST } from "../../constants"
import Tooltip from "../../lang/Tooltip.json"
import Table from "../../components/Table"
import { TooltipIcon } from "../../components/Tooltip"
import styles from "./TopTrading.module.scss"
import {
  commas,
  decimal,
  formatAssetAmount,
  lookupSymbol,
  niceNumber,
} from "../../libs/parse"
import { getICon2 } from "../../routes"
import { bound } from "../../components/Boundary"
import { ApyTooltipIcon } from "../../components/ApyToolTip"
import FarmApyTooltipContent, {lunaArray} from "../../components/FarmApyTooltipContent"
import { gt, gte, lt, multiple, number, plus } from "../../libs/math"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import { tradingListStore } from "../../data/API/dashboard"
import UP_ICON from "../../images/icons/up.svg"
import DOWN_ICON from "../../images/icons/down.svg"

const PER_PAGE = 10

const PairTVLList = ({ tokens }: { tokens?: string[] }) => {
  const list = useRecoilValue(tradingListStore)
  const [startSortingByFee, setStartSortingByFee] = useState(true)
  const [startSortingByTotalLocked, setStartSortingByTotalLocked] =useState(false)
  const [startSortingByApy, setStartSortingByApy] = useState(false)

  const [sortTotalLocked, setSortTotalLocked] = useState(false)
  const [sortTradingFee, setSortTradingFee] = useState<any>(true)
  const [sortApy, setSortApy] = useState<any>(false)


  const sortByTotalLocked = () => {
    setStartSortingByFee(false)
    setStartSortingByApy(false)
    setStartSortingByTotalLocked(true)
    setSortApy(false)
    setSortTradingFee(false)
    setSortTotalLocked(!sortTotalLocked)
   
  }

  const sortByTradingFee = () => {
    setStartSortingByApy(false)
    setStartSortingByTotalLocked(false)
    setStartSortingByFee(true)
    setSortApy(false)
    setSortTotalLocked(false)
    setSortTradingFee(!sortTradingFee)
   
  }

  const sortByApy = () => {
    setStartSortingByTotalLocked(false)
    setStartSortingByFee(false)
    setStartSortingByApy(true)
    setSortTradingFee(false)
    setSortTotalLocked(false)
    setSortApy(!sortApy)
   
  }

  const sortByTotalLockedFunc = (dataSource: any) => {
    return startSortingByFee
      ? sortTradingFee
        ? dataSource.sort((a, b) => (gt(a.sevenDayFee, b.sevenDayFee) ? -1 : 1))
        : dataSource.sort((a, b) => (lt(a.sevenDayFee, b.sevenDayFee) ? -1 : 1))
      : startSortingByTotalLocked
      ? sortTotalLocked
        ? dataSource.sort((a, b) => (gt(a.totalLocked, b.totalLocked) ? -1 : 1))
        : dataSource.sort((a, b) => (lt(a.totalLocked, b.totalLocked) ? -1 : 1))
      : startSortingByApy
      ? sortApy
        ? dataSource.sort((a, b) => (gt(a.APY, b.APY) ? -1 : 1))
        : dataSource.sort((a, b) => (lt(a.APY, b.APY) ? -1 : 1))
      : dataSource
  }

  // const dataSource = useFarmsList().filter((item)=> {
  //   const split = item.symbol.split(' - ')
  //   console.log("split", {split, tokens})
  //   return tokens && tokens.length > 0 ? (tokens.includes(split[0].toUpperCase()) || tokens.includes(split[1].toUpperCase())) : true
  // }).filter((li) => gt(li.total_fee, 0) && gt(li.total_locked, 0))
  //     .sort((a, b) => (lt(a.total_fee, b.total_fee) ? 1 : -1))

  const dataSource =
    list && list.length > 0
      ? list?.filter((item) => {
            const split = item.symbol.split("_")
            return tokens && tokens.length > 0
              ? tokens.includes(lookupSymbol(split[0]).toUpperCase()) ||
                  tokens.includes(lookupSymbol(split[1]).toUpperCase())
              : true
          })
          .filter((li) => gt(li.sevenDayFee, '0') && gt(li.totalLocked, '0'))
          // .sort((a, b) => (lt(a.sevenDayFee, b.sevenDayFee) ? 1 : -1))
      : []

  const [isExpand, setIsExpand] = useState(false)

  return (
    <>
      {window.innerWidth < 600 ?
      (
        <>
        <Table
        columns={[
          /* {
              key: "rank",
              title: "No.",
              render: (_value, _record, index) => index + 1,
          },*/
          {
            key: "symbol",
            title: "Ticker",
            render: (_value,{lpToken}) => {
              const split = _value?.split("_").map((item) => lookupSymbol(item))

              return (
                <div className={styles.icontable}>
                  <div className={styles.icontableHub}>
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(_value.split("_")[0].trim().toUpperCase())}
                      alt=" "
                    />
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(_value.split("_")[1].trim().toUpperCase())}
                      alt=" "
                    />
                  </div>
                  <p style={{ display: "block" }}>{split?.join(" - ")} <span>{['terra10mkke9qfhdjgkaq32sjd3ll9ccscjd03xn9gc9'].includes(lpToken) ? 'v3' :''}</span></p>
                </div>
              )
            },
            bold: true,
          },
          {
            key: "APY",
            title: (<>
            <span onClick={sortByApy} className={styles.combinedApy}>Combined APY</span>
            {startSortingByApy && <img src={(sortApy ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon}  />}
             </>),

            render: (value, { APR, TxFee, symbol, Rewards }) =>
              bound(
                <ApyTooltipIcon
                  content={
                    <>
                      <FarmApyTooltipContent
                        symbol={symbol}
                        apy={value}
                        tx_fee_apy={TxFee}
                        rewards={Rewards}
                        apr={APR}
                        isSimplified={true}
                      />
                    </>
                  }
                >
                  <span className={styles.blue}>
                    {bound(
                      `${
                        gte(value, "5000")
                          ? "5,000+%"
                          : `${commas(
                              decimal(
                                isFinite(number(niceNumber(value)))
                                  ? niceNumber(
                                      lunaArray.includes(symbol)
                                        ? plus(17.06, value)
                                        : value
                                    )
                                  : "0",
                                2
                              )
                            )}%`
                      }`,
                      "fetching..."
                    )}
                  </span>{" "}
                </ApyTooltipIcon>,
                "fetching..."
              ),
          },
          {
            key: "totalLocked",
            title: (
              <>
              <span onClick={sortByTotalLocked}>Total Locked</span>
              <TooltipIcon content={Tooltip.TopTrading.Liquidity} />
              {startSortingByTotalLocked && <img src={(sortTotalLocked ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon} />}
              </>
            ),
            render: (value) =>
              bound(
                `$${formatAssetAmount(multiple(value, SMALLEST), UST)}`,
                "Loading..."
              ),
          },
          /*{
          key: "volume",
          title: (
            <TooltipIcon content={Tooltip.TopTrading.Volume7day}>
              7 day Volume
            </TooltipIcon>
          ),
          render: (value) => `$${formatAssetAmount(value, UST)}`,
        },*/
          {
            key: "sevenDayFee",
            title: (
              <>
              <span onClick={sortByTradingFee}>7 day trading fees</span>
              <TooltipIcon content={<div className={styles.tooltipItem}><span>{Tooltip.TopTrading.Fee7day}</span><span>{Tooltip.TopTrading.Fee7day1}</span></div>} />
              {startSortingByFee && <img src={(sortTradingFee ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon} />}
              </>
            ),
            render: (value) =>
              bound(`$${commas(decimal(value, 3))}`, "fetching..."),
          },
          /*{
          key: "7dayFee",
          title: (
            <TooltipIcon content={Tooltip.TopTrading.Fee7day}>
              7 day trading fees
            </TooltipIcon>
          ),
          render: (value, { volume }) => {
            const val = multiple(div(volume, 100), 0.3)
            return bound(`$${formatAssetAmount(gt(val, "5000000000") ? div(val, "2") : val, UST)}`, "$0")
          },
        },*/
          /*{
          key: "apr2",
          title: <TooltipIcon content={"APR"}>APR</TooltipIcon>,
          render: (value) =>
            bound(
              <LinkButton
                className={styles.simpleLink}
                to={getPath(MenuKey.FARMBETA)}
              >
                {value}{" "}
                <img
                  height={"10px"}
                  style={{ marginLeft: 3 }}
                  src={topRightIcon}
                  alt={"link"}
                />
              </LinkButton>,
              "COMING SOON..."
            ),
        },*/
          
        ]}
        dataSource={
          isExpand
            ? sortByTotalLockedFunc(dataSource)
            : sortByTotalLockedFunc(dataSource)?.slice(0, PER_PAGE)
        }
      />
      {!isExpand && dataSource.length > PER_PAGE && (
        <div className={styles.expandBtn} onClick={() => setIsExpand(true)}>
          Expand All
        </div>
      )}
        </>
      )
      :
      (
        <>
        <Table
        columns={[
          /* {
              key: "rank",
              title: "No.",
              render: (_value, _record, index) => index + 1,
          },*/
          {
            key: "symbol",
            title: "Ticker",
            render: (_value, {lpToken}) => {
              const split = _value?.split("_").map((item) => lookupSymbol(item))

              return (
                <div className={styles.icontable}>
                  <div className={styles.icontableHub}>
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(_value.split("_")[0].trim().toUpperCase())}
                      alt=" "
                    />
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(_value.split("_")[1].trim().toUpperCase())}
                      alt=" "
                    />
                  </div>
                  <p style={{ display: "block" }}>{split?.join(" - ")} {['terra10mkke9qfhdjgkaq32sjd3ll9ccscjd03xn9gc9'].includes(lpToken) ? <span> - V3</span> : ''}</p>
                </div>
              )
            },
            bold: true,
          },
          {
            key: "totalLocked",
            title: (
              <>
              <span onClick={sortByTotalLocked}>Total Locked</span>
              <TooltipIcon content={Tooltip.TopTrading.Liquidity} />
              {startSortingByTotalLocked && <img src={(sortTotalLocked ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon} />}
              </>
            ),
            render: (value) =>
              bound(
                `$${formatAssetAmount(multiple(value, SMALLEST), UST)}`,
                "Loading..."
              ),
          },
          /*{
          key: "volume",
          title: (
            <TooltipIcon content={Tooltip.TopTrading.Volume7day}>
              7 day Volume
            </TooltipIcon>
          ),
          render: (value) => `$${formatAssetAmount(value, UST)}`,
        },*/
          {
            key: "sevenDayFee",
            title: (
              <>
              <span onClick={sortByTradingFee}>7 day trading fees</span>
              <TooltipIcon content={<div className={styles.tooltipItem}><span>{Tooltip.TopTrading.Fee7day}</span><span>{Tooltip.TopTrading.Fee7day1}</span></div>} />
              {startSortingByFee && <img src={(sortTradingFee ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon} />}
              </>
            ),
            render: (value) =>
              bound(`$${commas(decimal(value, 3))}`, "fetching..."),
          },
          /*{
          key: "7dayFee",
          title: (
            <TooltipIcon content={Tooltip.TopTrading.Fee7day}>
              7 day trading fees
            </TooltipIcon>
          ),
          render: (value, { volume }) => {
            const val = multiple(div(volume, 100), 0.3)
            return bound(`$${formatAssetAmount(gt(val, "5000000000") ? div(val, "2") : val, UST)}`, "$0")
          },
        },*/
          /*{
          key: "apr2",
          title: <TooltipIcon content={"APR"}>APR</TooltipIcon>,
          render: (value) =>
            bound(
              <LinkButton
                className={styles.simpleLink}
                to={getPath(MenuKey.FARMBETA)}
              >
                {value}{" "}
                <img
                  height={"10px"}
                  style={{ marginLeft: 3 }}
                  src={topRightIcon}
                  alt={"link"}
                />
              </LinkButton>,
              "COMING SOON..."
            ),
        },*/
          {
            key: "APY",
            title: (<>
            <span onClick={sortByApy} className={styles.combinedApy}>Combined APY</span>
            {startSortingByApy && <img src={(sortApy ? DOWN_ICON  : UP_ICON)} alt="Up_icon" className={styles.arrowIcon}  />}
             </>),

            render: (value, { APR, TxFee, symbol, Rewards }) =>
              bound(
                <ApyTooltipIcon
                  content={
                    <>
                      <FarmApyTooltipContent
                        symbol={symbol}
                        apy={value}
                        tx_fee_apy={TxFee}
                        rewards={Rewards}
                        apr={APR}
                        isSimplified={true}
                      />
                    </>
                  }
                >
                  <span className={styles.blue}>
                    {bound(
                      `${
                        gte(value, "5000")
                          ? "5,000+%"
                          : `${commas(
                              decimal(
                                isFinite(number(niceNumber(value)))
                                  ? niceNumber(
                                      lunaArray.includes(symbol)
                                        ? plus(17.06, value)
                                        : value
                                    )
                                  : "0",
                                2
                              )
                            )}%`
                      }`,
                      "fetching..."
                    )}
                  </span>{" "}
                </ApyTooltipIcon>,
                "fetching..."
              ),
          },
        ]}
        dataSource={
          isExpand
            ? sortByTotalLockedFunc(dataSource)
            : sortByTotalLockedFunc(dataSource)?.slice(0, PER_PAGE)
        }
      />
      {!isExpand && dataSource.length > PER_PAGE && (
        <div className={styles.expandBtn} onClick={() => setIsExpand(true)}>
          Expand All
        </div>
      )}
        </>
      )

      }
    </>
  )
}

export default PairTVLList
