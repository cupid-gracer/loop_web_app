import { useRecoilValue } from "recoil"
import { SMALLEST } from "../../constants"
import { unitPricesStore } from "../../data/API/dashboard"
import { num, div, gt, multiple, plus } from "../../libs/math"

export const parseDataSource = (
  dataSource: any,
  name: string,
  keyValue: string,
  symbol: string
) => {
  const dataSourceSet = dataSource.sort(
    (a, b) => num(b[keyValue]) - num(a[keyValue])
  )
  const data1 =
    dataSourceSet.length >= 8
      ? dataSourceSet
          .slice(0, 7)
          .map((item) =>
            num(
              name === "holdings"
                ? div(item[keyValue], SMALLEST)
                : item[keyValue]
            )
          )
      : dataSourceSet?.map((item) =>
          num(
            name === "holdings" ? div(item[keyValue], SMALLEST) : item[keyValue]
          )
        )
  const remainingDataSet =
    dataSourceSet.length >= 8
      ? dataSource
          .slice(7, dataSourceSet.length)
          .map((item) =>
            num(
              name === "holdings"
                ? div(item[keyValue], SMALLEST)
                : item[keyValue]
            )
          )
          .reduce((a, b) => a + b, 0)
      : []

  const symbolsArray =
    dataSourceSet.length >= 8
      ? dataSourceSet.slice(0, 7).map((item) => item[symbol])
      : dataSourceSet?.map((item) => item[symbol])

  return {
    symbolsArray,
    data1,
    remainingDataSet,
  }
}

export const parseArray = (arr: any) => {
  return arr.reduce((a, b) => plus(a, b), 0)
}

export const getUnitPrice = (tokenAddr: string, unitPrices: any) => {
  return unitPrices?.find((item) => item.tokenAddress === tokenAddr)?.price
}

export const getFarmingPendingRewards = (
  dataList: any,
  unitPrices: any,
  check8decOper: any
) => {
  const rewardsAny: any = []

  const rewards =
    dataList && dataList.length > 0
      ? dataList
          ?.filter((farm) => gt(farm.staked ?? "0", "0"))
          ?.map((farm) => {
            return farm?.receivedRewards[0]?.rewards_info.map((item) => item)
          })
      : []

  const totalPendingRewards = rewards?.map((item) => {
    return item?.map((item) => {
      return multiple(
        div(
          item?.amount,
          check8decOper(item?.info?.token?.contract_addr)
            ? "100000000"
            : SMALLEST
        ),
        getUnitPrice(item?.info?.token?.contract_addr, unitPrices)
      )
    })
  })

  totalPendingRewards?.map((item) =>
    rewardsAny.push(parseArray(item))
  )

  return rewardsAny?.reduce((a, b) => plus(a ,b), 0)
}

export const getStakingPendingRewards=(dataList:any)=>{
  const pendingReward:any=[]
  
  dataList && dataList.length > 0 && 
  dataList.map((item)=>{
    pendingReward.push(item?.yourReward?.ust)
  })

  return pendingReward.reduce((a,b)=>plus(a,b),0);

}