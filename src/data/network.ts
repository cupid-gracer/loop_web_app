import { atom, selector } from "recoil"
import networks, { defaultNetwork } from "../networks"

export const networkNameState = atom({
  key: "networkName",
  default: defaultNetwork.name,
})

export const networkQuery = selector({
  key: "network",
  get: ({ get }) => {
    const name = get(networkNameState)
    return networks[name]
  },
})

export const mantleURLQuery = selector({
  key: "mantleURL",
  get: ({ get }) => {
    const { mantle } = get(networkQuery)
    return mantle
  },
})

export const apiURLQuery = selector({
  key: "apiURLQuery",
  get: ({ get }) => {
    const { api } = get(networkQuery)
    return api
  },
})

export const LCDURLQuery = selector({
  key: "LCDURL",
  get: ({ get }) => {
    const { lcd } = get(networkQuery)
    return lcd
  },
})

export const statsURLQuery = selector({
  key: "statsURL",
  get: ({ get }) => {
    const { stats } = get(networkQuery)
    return stats
  },
})
