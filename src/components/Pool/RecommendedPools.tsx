import { useState } from "react"
import styles from "./YourLiquidity.module.scss"
import Card from "./poolCard/Card"
import TooltipMsg from "../../lang/Tooltip.json"
import HeaderModal from "../Pool/HeaderModal"
import SwapWidgetLarge from "../../components/swap/largeWidget/Swap.lg.widget"
import change from "../../images/up.svg"
import { useRecoilValue } from "recoil"
import { tradingListStore } from "../../data/API/dashboard"
import { getICon2 } from "../../routes"
import { lookupSymbol } from "../../libs/parse"
import { lt } from "../../libs/math"
import { bound } from "../Boundary"

interface Props {
  setPairlpToken?: any
  setPairAddr?: any
  setFirstToken?: any
  setSecondToken?: any
  isValueZero?: boolean
  setIsTokenSelected?: any
  isTokenSelected?: boolean
  isPercentageButtons?: boolean
  isFirstTokenBalanceZero?: boolean
}

const useRecommendedPool = () => {
  const tradingData = useRecoilValue(tradingListStore)
  const sortedData = [...tradingData].sort((a, b) =>
    lt(a.APY, b.APY) ? 1 : -1
  )
  return sortedData
}
const RecommendedPools = ({
  setPairlpToken,
  setPairAddr,
  setFirstToken,
  setSecondToken,
  isValueZero,
  setIsTokenSelected,
  isTokenSelected,
  isPercentageButtons,
  isFirstTokenBalanceZero,
}: Props) => {
  const [name, setName] = useState("Popular")

  const sortedData = useRecommendedPool()

  const handleClick = (item: any) => {
    setPairAddr(item.pairAddress)
    setPairlpToken(item.lpToken)
    setFirstToken(item.firstToken)
    setSecondToken(item.secondToken)
    setIsTokenSelected(true)
  }
  const ActiveTab = () => {
    return (
      <>
        <div className={styles.poolCard}>
          <span
            className={name == "Popular" ? styles.active : ""}
            onClick={() => {
              setName("Popular")
            }}
          >
            Popular Pairs
          </span>
        </div>
        <div className={styles.poolCard}>
          <span
            className={name == "Swap" ? styles.active : ""}
            onClick={() => {
              setName("Swap")
            }}
          >
            Swap
          </span>
        </div>
      </>
    )
  }

  const Rec = () => {
    return (
      <div
        className={
          !isTokenSelected && !isPercentageButtons
            ? styles.defaultList
            : isTokenSelected && !isFirstTokenBalanceZero
            ? styles.firstTokenBalanceBtn
            : isValueZero && !isPercentageButtons
            ? styles.newList
            : isValueZero
            ? styles.list
            : styles.openList
        }
      >
        {bound(
          sortedData?.map((item, index) => {
            return (
              <div
                className={styles.content}
                key={index}
                onClick={() => handleClick(item)}
              >
                <span>
                  <span className={styles.token}>
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(
                        item?.symbol?.split("_")[0].trim().toUpperCase()
                      )}
                      alt=" "
                    />{" "}
                    {lookupSymbol(item?.symbol?.split("_")[0].trim())}
                  </span>{" "}
                  -{" "}
                  <span className={styles.token}>
                    <img
                      style={{ width: "30px", borderRadius: "25px" }}
                      src={getICon2(
                        item?.symbol?.split("_")[1].trim().toUpperCase()
                      )}
                      alt=" "
                    />{" "}
                    {lookupSymbol(item?.symbol?.split("_")[1].trim())}
                  </span>
                </span>
                <span className={styles.percent}>
                  <span className={styles.up}>
                    <img src={change} alt=" " /> {item.APY}%
                  </span>{" "}
                  APY
                </span>
              </div>
            )
          })
        )}
        <div className={styles.info}>{TooltipMsg.Pool.PoolRec}</div>
      </div>
    )
  }

  return (
    <>
      {/* <Tooltip content="Coming Soon"> */}
      <HeaderModal
        title={"FARMING WIZARD"}
        content={
          "This will help you Swap + Pool + Farm your tokens automagically"
        }
        hidden={name != "Popular"}
        noMobile={false}
      />
      {/* </Tooltip> */}
      <section
        className={
          name == "Popular" ? styles.recommended : styles.recommendedSwap
        }
      >
        <Card
          title={name == "Popular" ? "Recommended" : "Swap"}
          className={styles.Card}
          overflow={true}
          borderBottom={false}
          tabs={<ActiveTab />}
        >
          {name == "Popular" && <Rec />}
          {name == "Swap" && <SwapWidgetLarge poolSwapWidget={true} />}
        </Card>
      </section>
    </>
  )
}

export default RecommendedPools
