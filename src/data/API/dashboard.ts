
import {  selector } from "recoil"
import { apiURLQuery } from "../network"
import { fetchAPI } from "../../libs/fetchApi"
import { priceKeyIndexState } from "../app"

export const FACTORY2_LP_FOR_TRADING = [
    'terra10mkke9qfhdjgkaq32sjd3ll9ccscjd03xn9gc9'
]

export const unitPricesStore = selector({
    key: "unitPricesStore",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'getUnitPrices'})
    },
})

export const tradingListStore = selector({
    key: "tradingListStore",
    get: async ({ get }) => {
        const allPairs = get(tradingListAllPairsStore)
        const filterList = allPairs//.filter((item) => !FACTORY2_LP_FOR_TRADING.includes(item.lpToken))
        return filterList && filterList.length > 0 ? filterList : []
    },
})

export const tradingListFactory4Store = selector({
    key: "tradingListFactory4Store",
    get: async ({ get }) => {
        const allPairs = get(tradingListAllPairsStore)
        const filterList = allPairs.filter((item) => FACTORY2_LP_FOR_TRADING.includes(item.lpToken))
        return filterList && filterList.length > 0 ? filterList : []
    },
})

export const tradingListAllPairsStore = selector({
    key: "tradingListAllPairsStore",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'tradingData'})
    },
})

export const factory2Pairs = selector({
    key: "factory2Pairs",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'factory2Pairs'})
    },
})


export const cardsStore = selector({
    key: "cardsStore",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'dashboardCard'})
    },
})

export const stakingStore = selector({
    key: "stakingStore",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'stakingData'})
    },
})

/* native */
export const fetchAPIQuery = selector({
    key: "fetchAPIQuery",
    get: ({ get }) => {
        const url = get(apiURLQuery)
        return async({ name }: { name: string}) => await fetchAPI(`${url}/v1/contracts/` + name)
    },
})

export const statsStore = selector({
    key: "statsStore",
    get: async ({ get }) => {
        get(priceKeyIndexState)
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'statsData'})
    },
})
