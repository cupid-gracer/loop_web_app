import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import ProgressLoading from "../../../components/Static/ProgressLoading"
import Table from "../../../components/Table"
import { tradingListStore, unitPricesStore } from "../../../data/API/dashboard"
import TxType from "../TxType/TxType"
import { topSwapData } from "./helper"
import SWITCH_ICON from "../../../images/Switch.svg"
import styles from "./SwapTable.module.scss"
import { truncate } from "../../../libs/text"
import { gt } from "../../../libs/math"
import AssetValue from "../AssetValue/AssetValue"
import moment from "moment"
import ExtLink from "../../../components/ExtLink"
import { getICon2 } from "../../../routes"
import PairSymbol from "../PairSymbol/PairSymbol"
import useAddress from "../../../hooks/useAddress"

const PER_PAGE = 2

const SwapTable = ({ showOnlyMyTransactions, pairAddress,updateTransactions }:{showOnlyMyTransactions?:boolean,pairAddress?:string,updateTransactions?:boolean}) => {
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState([])
  const tradingData = useRecoilValue(tradingListStore)
  const [isExpand, setIsExpand] = useState(false)
  const unitPrices = useRecoilValue(unitPricesStore)
  const [time, setTime] = useState(Date.now());

  const currentItem = tradingData.find(
    (item) => item.pairAddress === pairAddress
  )
  const address = useAddress()
  useEffect(() => {
    const allData = async () => {
      try {
        const res = await topSwapData(pairAddress, 100)
        setDataSource(res)
        setLoading(false)
      } catch (e) {
        return e
      }
    }
    allData()
   
  }, [pairAddress,updateTransactions,time])


  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);


  const filterByFromValue = (data: any) => {
    if (showOnlyMyTransactions) {
      const result = dataSource
        ?.filter((item) => item.userWallet == address)
        ?.filter((item) => gt(item.FromAmount, 0))
      return result
    } else {
      const result = dataSource.filter((item) => gt(item.FromAmount, 0))
      return result
    }
  }

  return (
    <>
      {loading ? (
        <div className={styles.loader}>
          <ProgressLoading />
        </div>
      ) : (
        <>
          <Table
            columns={[
              {
                title: "Pair",
                key: "pairSymbol",
                render: (value, ToAsset) => (
                  <>
                    <PairSymbol payload={ToAsset} />{" "}
                  </>
                ),
              },
              {
                title: "Side",
                key: "FromAsset",
                render: (value, ToAsset) => (
                  <TxType item={ToAsset} currentItem={currentItem} />
                ),
              },
              {
                title: "Trade Value",
                key: "tradeValue",
                render: (value, FromAsset) => (
                  <AssetValue
                    value={FromAsset?.FromAmount}
                    data={FromAsset?.FromAsset}
                    showSymbol={false}
                  />
                ),
              },
              {
                title: "From",
                key: "FromAmount",
                render: (value, FromAsset) => (
                  <AssetValue
                    value={value}
                    data={FromAsset?.FromAsset}
                    showSymbol={true}
                  />
                ),
              },
              {
                title: "To",
                key: "ToAmount",
                render: (value, ToAsset) => (
                  <AssetValue
                    value={value}
                    data={ToAsset?.ToAsset}
                    showSymbol={true}
                  />
                ),
              },
              {
                title: "When",
                key: "timeStamp",
                render: (value) => (
                  <span>{moment(value).format("D MMM`YY @ h:m:s A")}</span>
                ),
              },
            ]}
            dataSource={
              isExpand
                ? filterByFromValue(dataSource)
                : filterByFromValue(dataSource)?.slice(0, PER_PAGE)
            }
          />
          {!isExpand && dataSource.length > PER_PAGE && (
            <div className={styles.expandBtn} onClick={() => setIsExpand(true)}>
              Expand All
            </div>
          )}
        </>
      )}
    </>
  )
}

export default SwapTable
