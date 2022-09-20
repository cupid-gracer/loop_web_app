import {selector, useRecoilValue,} from "recoil";
import { CONTRACT } from "../../hooks/useTradeAssets";
import { contractsList } from "../contract/contract";
import { lookupSymbol } from "../../libs/parse";
import {useContractsList, useContractsListFactory2} from "../contract/normalize";
import { insertIf } from "../../libs/utils";

/**
 * Tokens list
 */
export const getTokensList = selector({
    key: "getTokensList",
    get: async ({ get }) => {
        const contracts = await get(contractsList);
        return (type: string) => {
            const uniqueList: any = []
            //improve
            contracts?.map((list: CONTRACT) => {
                const duplicat = uniqueList.find((unique: CONTRACT) => {
                    return type === 'token' ?
                        unique.contract_addr === list.contract_addr
                        :
                        unique.pair === list.pair
                })
                !duplicat && uniqueList.push(list)
            })
            return uniqueList;
        }
    },
})


export const useGetTokenList = () => {
    // const { contents: contracts } = useContractsList()
    const contracts = useRecoilValue(contractsList)

    return (type: string) => {
        const uniqueList: any = []
        //improve
        contracts?.map((list: CONTRACT) => {
            const duplicat = uniqueList.find((unique: CONTRACT) => {
                return type === 'token' ?
                    unique.contract_addr === list.contract_addr
                    :
                    unique.pair === list.pair
            })
            !duplicat && uniqueList.push(list)
        })
        return uniqueList;
    }
}

/**
 * find Token detail
 */
export const findTokenDetail = selector({
    key: "findTokenDetail",
    get: async ({ get }) => {
        const contracts = await get(contractsList);
        return (token?: string, type: string = '') => {
            if (type === 'lp') {
                const pairs = token ? contracts?.filter((list: CONTRACT) => list.lp === token) : undefined
                if (pairs) {
                    return { tokenSymbol: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), tokenName: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), decimals: 6 }
                }
            } else if (type === 'pair') {
                const pairs = token ? contracts?.filter((list: CONTRACT) => list.pair === token) : undefined
                if (pairs) {
                    return { tokenSymbol: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), tokenName: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), decimals: 6 }
                }
            } else {
                return token ? contracts?.find((list: CONTRACT) => list.token === token) as CONTRACT : undefined
            }
        }
    },
})


export const useFindTokenDetails = () => {
    const { contents } = useContractsList()
    const { contents: contractsFac2 } = useContractsListFactory2()
    const contents1 = contents ? contents : []
    const contracts  = [...contents1, ...contractsFac2?.filter((item)=> ['terra1k0f77x4057fexvmyrhzwhge3vxcl5kkgwck89p'].includes(item.pair) || ['terra10mkke9qfhdjgkaq32sjd3ll9ccscjd03xn9gc9'].includes(item.lp))]

    return (token?: string, type: string = '') => {
        if (type === 'lp') {

            const pairs = token ? contracts && contracts?.filter((list: CONTRACT) => {
                return [list.lp].includes(token)
            }) : undefined

            if (pairs) {
                return { tokenSymbol: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), tokenName: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), decimals: 6 }
            }
        } else if (type === 'pair') {
            const pairs = token ? contracts && contracts?.filter((list: CONTRACT) => list.pair === token) : undefined

            if (pairs) {
                return { tokenSymbol: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), tokenName: pairs.map((pair) => lookupSymbol(pair.tokenSymbol)).join('-'), decimals: 6 }
            }
        } else {
            return token ? contracts && contracts?.find((list: CONTRACT) => list.token === token) as CONTRACT : undefined
        }
    }

}


export const useFindLpTokens = () => {
    const { contents: contracts } = useContractsList()
    return (lp?: string ) => lp ? contracts && contracts?.filter((list: CONTRACT) => list.lp === lp) : []
}

export const useFindPair = () => {
    const { contents: contracts } = useContractsList()
    return (lp?: string ) => lp ? contracts && contracts?.find((list: CONTRACT) => list.lp === lp)?.pair : ''
}