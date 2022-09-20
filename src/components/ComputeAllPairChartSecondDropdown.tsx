import { useEffect, useState } from "react"
import useSelectSwapAsset from "../forms/Exchange/useSelectSwapAsset"
import { Key } from "../forms/PoolDynamicForm"
import { useFindTokenDetails } from "../data/form/select"
import { useContractsList } from "../data/contract/normalize"
import { CONTRACT } from "../hooks/useTradeAssets"

const ComputeAllPairsChartSecondDropdown = ({ setTokens, lpProp,setLpToken }:{ setTokens:any, lpProp?: string,setLpToken?:any }) => {
  const [pair, setPair] = useState<string | undefined>(lpProp ?? "")
  const findTokenDetailFn = useFindTokenDetails()
  const [isDropdown, setIsDropdown] = useState(false)

  const onSelect = (name: Key) => (token: string, pair: string | undefined) => {
    setPair(token)
    setLpToken && setLpToken(token)
    setIsDropdown(false)
  }

  const symbol = findTokenDetailFn(pair, "lp")?.tokenSymbol
  const { contents: contracts } = useContractsList()

  useEffect(() => {
    setPair(lpProp)
  },[lpProp])

  useEffect(() => {
    if(contracts){
      const tokens = (pair && contracts) ? contracts?.filter((list: CONTRACT) => list.lp === pair) : []      
      setTokens(tokens)
    }
  }, [contracts, pair])

  const config = {
    token: pair,
    onSelect: onSelect(Key.token1),
    symbol: symbol,
    formatTokenName: undefined,
    formatPairToken: true,
    showAsPairs: true,
    showQuickTokens: false,
    showBalance: false,
    showSearch: true,
    orderBy: true,
    color:{
      color:'#32FE9A',
      index:1
    }
  }
  // @ts-ignore
  const select = useSelectSwapAsset({ ...config })

  return (
    <>
    {
      isDropdown &&
    <div style={{
      inset: 0,
      position: "absolute",
    }}
    onClick={() => setIsDropdown(false)}
    >

    </div>
    }
      <span onClick={() => setIsDropdown(true)}>{select.button}</span>

      {isDropdown && (
        <div style={{ position: "relative",zIndex:90 }}>
          <span style={{ position: "absolute",
          background: '#252525',
          border: '1px solid #404040',
          borderRadius: '10px',
          marginTop:'12px'
        
        }}>{select.assets}</span>
        </div>
      )}
    </>
  )
}

export default ComputeAllPairsChartSecondDropdown
