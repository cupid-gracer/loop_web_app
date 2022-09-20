import { useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { commas, decimal } from "../../libs/parse"
import { parseDataSource } from "../../pages/My/parser"
import useMy from "../../pages/My/useMy"
import styles from "./PortFolioChart.module.scss"
import { useFarmsList } from "../../pages/Farm/useFarmBetaList"
import { div, gt, multiple, number } from "../../libs/math"

const useFarmUserStaked = () => {
  const dataList = useFarmsList(true)

  return dataList && dataList.length > 0
    ? dataList
        ?.filter((farm) => gt(farm.liquidity ?? "0", "0"))
        ?.map((farm) => {
          return {
            symbol: farm?.symbol ?? "",
            liquidity: farm?.liquidity ?? "",
          }
        })
    : []
}

const PortFolioChart = () => {
  const [tab, setTab] = useState(0)
  const { holdings, pool, staking } = useMy()
  const list = useFarmUserStaked()

  const dataSource =
    tab === 1
      ? parseDataSource(list, "Farm", "liquidity", "symbol") //{ symbolsArray:list?.map(({symbol})=>symbol), data1: list?.map(({staked})=>staked)}
      : tab === 2
      ? parseDataSource(pool.dataSource, "pool", "withdrawableValue", "symbol")
      : tab === 3
      ? parseDataSource(staking.dataSource, "staking", "total_value", "title")
      : parseDataSource(
          holdings.dataSource.filter(
            (data) =>
              gt(data.balance, "0") &&
              gt(data.value, "0") &&
              !isNaN(number(data.balance)) &&
              !isNaN(number(data.value))
          ),
          "holdings",
          "value",
          "symbol"
        )

  const colorArray = [
    "#AF435D",
    "#D4B957",
    "#96C24E",
    "#8A61E2",
    "#AF6343",
    "#0998B9",
    "#2ED081",
    "#9BB0CF",
  ]

  const percentageData = [
    ...dataSource.data1,
    dataSource.remainingDataSet,
  ].reduce((a, b) => a + b, 0)
  const testArray = dataSource?.data1?.map((item) =>
    decimal(multiple(div(item, percentageData), 100), 2)
  )

  const percentageSymbol = dataSource.symbolsArray?.map((item) => item)
  const allSymbols = [...percentageSymbol, "Others"]

  const data = {
    labels: [...allSymbols],
    datasets: [
      {
        label: "My First Dataset",
        data: [
          ...testArray,
          decimal(
            multiple(div(dataSource.remainingDataSet, percentageData), 100),
            2
          ),
        ],
        backgroundColor: [...colorArray],
        hoverOffset: 2,
        borderColor: "#343232",
        borderWidth: 2,
        percentageInnerCutout: 40,
      },
    ],
  }

  const emptyChartdata = {
    labels: ["START TRADING"],
    datasets: [
      {
        label: "My First Dataset",
        data: [100],
        backgroundColor: ["#01CDFD"],
        hoverOffset: 2,
        borderColor: "#01CDFD",
        borderWidth: 2,
        percentageInnerCutout: 40,
      },
    ],
  }

  return (
    <div className={styles.pieChart}>
      {dataSource.data1 && dataSource.data1.length > 0 ? (
        <>
          <div className={styles.chartContainer}>
            <Doughnut
              data={data}
              width={300}
              height={285}
              options={{
                legend: {
                  display: false,
                },
                layout: {
                  padding: 2,
                },
                maintainAspectRatio: false,
                cutoutPercentage: 40,
                // tooltips: {
                //   callbacks: {
                //     label: function (tooltipItem:any, data:any) {
                //       const dataset:any =
                //         data?.datasets?.[tooltipItem?.datasetIndex]
                //       const index:any = tooltipItem.index
                //       return (
                //         allSymbols[index] + ": " + dataset.data[index] + "%"
                //       )
                //     },
                //   },
                // },
              }}
            />
          </div>
          <div className={styles.wrapper}>
            <div className={styles.tabs}>
            {window.innerWidth > 768 ? (
              <>
                <span
                className={styles.pl4}
                style={
                  tab === 0
                    ? { color: "#01CDFD", textDecoration: "underLine" }
                    : {}
                }
                onClick={() => setTab(0)}
              >
                Holdings
              </span>
              <span className={styles.pl4}>|</span>
              <span
                className={styles.pl4}
                style={
                  tab === 1
                    ? { color: "#01CDFD", textDecoration: "underLine" }
                    : {}
                }
                onClick={() => setTab(1)}
              >
                Farm
              </span>
              <span className={styles.pl4}>|</span>

              <span
                className={styles.pl4}
                style={
                  tab === 2
                    ? { color: "#01CDFD", textDecoration: "underLine" }
                    : {}
                }
                onClick={() => setTab(2)}
              >
                LPTokens
              </span>
              <span className={styles.pl4}>|</span>

              <span
                className={styles.pl4}
                style={
                  tab === 3
                    ? { color: "#01CDFD", textDecoration: "underLine" }
                    : {}
                }
                onClick={() => setTab(3)}
              >
                Staked
              </span>
              </>
            )
            :
            <>
            <span
                className={styles.pl4}
                style={
                  tab === 0
                    ? { color: "#01CDFD", textDecoration: "underLine" }
                    : {}
                }
                onClick={() => setTab(0)}
              >
                Holdings
              </span>
            </>

            }
            </div>
            <div
              className={styles.labels}
              style={
                tab === 1 || tab === 3
                  ? { flexDirection: "column", flexWrap: "unset" }
                  : {}
              }
            >
             {window.innerWidth > 768 ?
             (
               <>
                {dataSource.data1.map((item, index) => {
                return (
                  <span className={styles.holdingData}>
                    <span
                      style={{ color: colorArray[index] }}
                      className={styles.assetTitles}
                    >
                      {`$${commas(decimal(item, 2))}`}
                    </span>
                    <span className={styles.assetTitles}>
                      {dataSource.symbolsArray[index]}
                    </span>
                  </span>
                )
              })}
              {dataSource.remainingDataSet > 0 && (
                <span className={styles.holdingData}>
                  <span
                    style={{ color: "#9BB0CF" }}
                    className={styles.assetTitles}
                  >
                    {`$${commas(decimal(dataSource.remainingDataSet, 2))}`}
                  </span>
                  <span
                    style={{ paddingLeft: "4px" }}
                    className={styles.assetTitles}
                  >
                    Other
                  </span>
                </span>
              )}
               </>
             )
             :
             <>
             {dataSource?.data1?.slice(0,4)?.map((item, index) => {
                return (
                  <span className={styles.holdingData}>
                    <span
                      style={{ color: colorArray[index] }}
                      className={styles.assetTitles}
                    >
                      {`$${commas(decimal(item, 2))}`}
                    </span>
                    <span className={styles.assetTitles}>
                      {dataSource.symbolsArray[index]}
                    </span>
                  </span>
                )
              })}
             </>

             }
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.chartContainer}>
            <Doughnut
              data={emptyChartdata}
              width={300}
              height={285}
              options={{
                legend: {
                  display: false,
                },
                layout: {
                  padding: 2,
                },
                maintainAspectRatio: false,
                cutoutPercentage: 50,
              }}
            />
          </div>
          <div className={styles.emptyChartHolding}>
            <span className={styles.holdingText}>Your Holdings</span>
            <span className={styles.startTrading}>START TRADING</span>
          </div>
        </>
      )}
    </div>
  )
}

export default PortFolioChart
