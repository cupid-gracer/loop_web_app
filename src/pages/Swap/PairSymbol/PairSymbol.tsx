import React from "react"
import { useRecoilValue } from "recoil"
import { unitPricesStore } from "../../../data/API/dashboard"
import { lookupSymbol } from "../../../libs/parse"
import { getICon2 } from "../../../routes"
import styles from "./PairSymbol.module.scss"

const PairSymbol = ({ payload }) => {
  const unitPrices = useRecoilValue(unitPricesStore)

  const tokenSymbol = (data: any) => {
    if (data == "uusd") {
      return "UST"
    } else {
      const currItem = unitPrices.find((item) => item.tokenAddress == data)
      const symbol = currItem?.symbol
      return lookupSymbol(symbol)
    }
  }
  return (
    <div className={styles.pairWrapper}>
      <img
        src={getICon2(tokenSymbol(payload?.FromAsset))}
        style={{ width: "30px", borderRadius: "25px" }}
      />
      <img
        src={getICon2(tokenSymbol(payload?.ToAsset))}
        style={{ width: "30px", borderRadius: "25px",marginLeft:'-6px' }}
      />
      <span className={styles.tokenNames}>
        {tokenSymbol(payload?.FromAsset)}<span className={styles.seprator}>-</span>{tokenSymbol(payload?.ToAsset)}
      </span>
    </div>
  )
}

export default PairSymbol
