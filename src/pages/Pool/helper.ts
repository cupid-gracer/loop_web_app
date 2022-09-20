import { useRecoilValue } from "recoil"
import { unitPricesStore } from "../../data/API/common"
import { lookupSymbol } from "../../libs/parse"

export const tokenSymbol = (tokenAddr: string, tokenInfo: any) => {
  const token = tokenInfo.find((item) => item.tokenAddress === tokenAddr)
  return tokenAddr == "uusd" ? "UST" : lookupSymbol(token?.symbol)
}
