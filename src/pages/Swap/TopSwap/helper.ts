import axios from "axios"

export const getSwapData = async (contractAddress: string, limit: number) => {
  const response = await axios
    .get(
      `https://fcd.terra.dev/v1/txs?account=${contractAddress}&limit=${limit}`
    )
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      return error
    })

  return response
}

export const topSwapData = async (contractAddress: string, limit: number) => {
  const swapData: any = []

  const res = await getSwapData(contractAddress, limit)

  res.txs.map((item: any, index: any) => {
    item?.logs[0]?.events?.map((log: any, index: any) => {
      if (log?.type == "from_contract") {
        let node = 0
        node = log?.attributes.findIndex(
          (item) =>
            item?.key == "contract_address" && item?.value == contractAddress
        )
        if (log?.attributes[node]?.value == contractAddress) {
          swapData.push({
            FromAsset: log?.attributes[node + 4]?.value,
            FromAmount: log?.attributes[node + 6]?.value,
            ToAsset: log?.attributes[node + 5].value,
            ToAmount: log?.attributes[node + 7]?.value,
            tradeLength: item?.logs?.length,
            tradeId: index,
            timeStamp: item?.timestamp,
            userWallet: item.tx?.value?.msg[0]?.value?.sender,
            txHash: item?.txhash,
          })
        }
      }
    })
  })

  return swapData;
}
