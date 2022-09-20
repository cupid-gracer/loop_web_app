import React from "react"
import { useRecoilValue } from "recoil"
import { SMALLEST } from "../../../constants"
import { unitPricesStore } from "../../../data/API/dashboard"
import { div, multiple } from "../../../libs/math"
import { decimal, lookupSymbol } from "../../../libs/parse"

const AssetValue = ({ value, data, showSymbol }) => {
  const unitPrices = useRecoilValue(unitPricesStore)
  const tokenSymbol = (data: any) => {
    if(data=="uusd"){
      return 'UST';
    }
    else
    {
      const currItem = unitPrices.find((item) => item.tokenAddress == data)
      const symbol = currItem?.symbol
      return symbol
    }
   
  }

  const tokenPrice = (data: any) => {
    if(data=="uusd"){
      return '1';
    }
    else
    {
      const currItem = unitPrices.find((item) => item.tokenAddress == data)
      const price = currItem?.price
      return price
    }
   
  }

  const tokenDecimals = (data: any) => {
    if(data=="uusd"){
      return SMALLEST;
    }
    else
    {
    const currItem = unitPrices.find((item) => item.tokenAddress == data)
    const decimal = currItem?.decimals
    return decimal=='6'?SMALLEST:"100000000";
    }
    
  }
  return (
    <div>
      {
        showSymbol ? (
          <span>{`${decimal(div(value,tokenDecimals(data)),6)} ${lookupSymbol(tokenSymbol(data))}`}</span>
          )
        : (
            <span>${`${decimal(multiple(div(value,tokenDecimals(data)),tokenPrice(data)),4)}`} </span>
        )
      }
    </div>
  )
}

export default AssetValue
