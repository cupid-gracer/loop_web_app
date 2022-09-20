
import {  selector } from "recoil"
import { LOOP } from "../../constants"
import { fetchAPIQuery } from "./dashboard"

export const unitPricesStore = selector({
    key: "unitPricesStore",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'getUnitPrices'})
    },
})

export const loopUnitPrice = selector({
    key: "loopUnitPrice",
    get: async ({ get }) => {
        const prices = get(unitPricesStore)
        return prices.find((item)=> item?.symbol.toUpperCase() === LOOP)?.price ?? "0"
    },
})

export const pairsFactory1 = selector({
    key: "pairsFactory1",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'factory1PiarDetail'})
    },
})

export const pairsFactory2 = selector({
    key: "pairsFactory2",
    get: async ({ get }) => {
        const fetchAPIQ = get(fetchAPIQuery)
        return fetchAPIQ({name: 'factory2PiarDetail'})
    },
})