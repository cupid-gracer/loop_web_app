import { Dictionary } from "ramda"
import { ReactNode } from "react"
import { formatAsset } from "../../libs/parse"
import { truncate } from "../../libs/text"
import getLpName from "../../libs/getLpName"
import * as helpers from "../../forms/receipts/receiptHelpers"
import {useTokenMethods} from "../../data/contract/info";

const { parseTokenText, splitTokenText } = helpers

export const getBadge = (type: string) => {
  const group: Dictionary<string[]> = {
    Terra: ["TERRA_SEND", "TERRA_RECEIVE", "TERRA_SWAP"],

    Trade: ["BUY", "SELL"],
    Mint: [
      "OPEN_POSITION",
      "DEPOSIT_COLLATERAL",
      "WITHDRAW_COLLATERAL",
      "MINT",
      "BURN",
      "AUCTION",
    ],
    Pool: ["PROVIDE_LIQUIDITY", "WITHDRAW_LIQUIDITY"],
    Stake: ["STAKE", "UNSTAKE", "WITHDRAW_REWARDS"],
    Gov: ["GOV_STAKE", "GOV_UNSTAKE", "GOV_CREATE_POLL", "GOV_CAST_POLL"],

    Airdrop: ["CLAIM_AIRDROP"],
  }

  const key = Object.entries(group).find(([key, value]) => value.includes(type))
  return key?.[0] ?? type
}

const useParseTx = ({ type, data, token }: Tx) => {
  const { amount, denom, from, to } = data
  const { offerAsset, offerAmount, askAsset, returnAmount } = data
  const { assetToken, positionIdx, pollId, voteOption } = data

  const { getSymbol } = useTokenMethods()
  const symbol = getSymbol(token)

  const formatToken = (asset?: Asset) =>
    formatAsset(asset?.amount, getSymbol(asset?.token))

  const collateral = splitTokenText(data.collateralAmount)
  const deposit = splitTokenText(data.depositAmount)
  const withdraw = splitTokenText(data.withdrawAmount)
  const mint = splitTokenText(data.mintAmount)
  const burn = splitTokenText(data.burnAmount)
  const assets = parseTokenText(data.assets)
  const refund = parseTokenText(data.refundAssets)
  const offer = splitTokenText(data.offer)
  const swap = splitTokenText(data.swapCoin)
  const liquidated = splitTokenText(data.liquidatedAmount)

  const parser: Dictionary<ReactNode[]> = {
    /* Terra */
    TERRA_SEND: ["Sent", formatAsset(amount, denom), "to", truncate(to)],
    SEND: ["Sent", formatAsset(amount, symbol), "to", truncate(to)],
    TERRA_RECEIVE: [
      "Received",
      formatAsset(amount, denom),
      "from",
      truncate(from),
    ],
    RECEIVE: ["Received", formatAsset(amount, symbol), "from", truncate(from)],
    TERRA_SWAP: ["Swapped", formatToken(offer), "to", formatToken(swap)],

    /* Trade */
    BUY: [
      "Bought",
      formatAsset(returnAmount, getSymbol(askAsset)),
      "with",
      formatAsset(offerAmount, getSymbol(offerAsset)),
    ],
    SELL: [
      "Sold",
      formatAsset(offerAmount, getSymbol(offerAsset)),
      "for",
      formatAsset(returnAmount, getSymbol(askAsset)),
    ],

    /* Mint */
    OPEN_POSITION: [
      "Minted",
      formatToken(mint),
      "with",
      formatToken(collateral),
    ],
    DEPOSIT_COLLATERAL: [
      "Deposited",
      formatToken(deposit),
      "to position",
      positionIdx,
    ],
    WITHDRAW_COLLATERAL: [
      "Withdrawn",
      formatToken(withdraw),
      "from position",
      positionIdx,
    ],
    MINT: ["Minted", formatToken(mint), "to position", positionIdx],
    BURN: ["Burned", formatToken(burn), "from position", positionIdx],
    AUCTION: [
      "Liquidated",
      formatToken(liquidated),
      "from position",
      positionIdx,
    ],

    /* Pool */
    PROVIDE_LIQUIDITY: [
      "Provided liquidity",
      formatToken(assets[0]),
      "and",
      formatToken(assets[1]),
    ],
    WITHDRAW_LIQUIDITY: [
      "Withdrawn liquidity",
      formatToken(refund[0]),
      "and",
      formatToken(refund[1]),
    ],

    /* Stake */
    STAKE: ["Staked", formatAsset(amount, getLpName(getSymbol(assetToken)))],
    UNSTAKE: [
      "Unstaked",
      formatAsset(amount, getLpName(getSymbol(assetToken))),
    ],
    WITHDRAW_REWARDS: ["Withdraw rewards", formatAsset(amount, symbol)],

    /* Gov */
    GOV_STAKE: ["Staked", formatAsset(amount, symbol)],
    GOV_UNSTAKE: ["Unstaked", formatAsset(amount, symbol)],
    GOV_CREATE_POLL: ["Created poll", pollId],
    GOV_CAST_POLL: ["Voted", voteOption, "to poll", pollId],

    /* Airdrop */
    CLAIM_AIRDROP: ["Claimed airdrop", formatAsset(amount, symbol)],
  }

  return parser[type] ?? []
}

export default useParseTx
