import CollapsibleTable from "../../components/CollapsibleTable"
import { getICon2 } from "../../routes"
import { TxResult } from "@terra-money/wallet-provider"
import { PostError } from "../../forms/FormContainer"
import { Info } from "../../hooks/Farm/useFarmingList"
import { ReactNode } from "react"
import styles from "./TopFarming.module.scss"
import { bound } from "../../components/Boundary"
import { commas, decimal, niceNumber } from "../../libs/parse"
import { SMALLEST } from "../../constants"
import { div, gt, gte, number, plus } from "../../libs/math"
import { FarmContractTYpe } from "../../data/farming/FarmV2"
import { ApyTooltipIcon } from "../../components/ApyToolTip"
import FarmApyTooltipContent, {lunaArray} from "../../components/FarmApyTooltipContent"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import { FarmMigrate } from "../FarmMigratePage"

export interface DATASOURCE {
  token: string
  symbol: string
  lpToken: string
  contract_addr: string
  staked?: string
  apr?: string
  pending?: string
  liquidity?: string
  tokens?: Info[]
  rewards?: ReactNode
  rewards_beta?: ReactNode
  all_apr?: string
  call_user_liquidity?: ReactNode
  farm?: ReactNode
  FarmContractType: FarmContractTYpe
  tx_fee_apy?: ReactNode
  all_apy?: string
  total_fee?: string
  tx_fee?: string
  staked_percentage?: string
  lp_balance?: string
    estAPYInUst?: string
    rewards_betaFn?: (expand: boolean) => ReactNode
    call_user_liquidityFn?: (expand: boolean) => ReactNode
  receivedRewards?: any[]
}

const TopFarming = ({
  farmResponseFun,
  dataSource,
  showMigrate = false,
  hidden = true,
}: {
  farmResponseFun: (
    res: TxResult | undefined,
    errors: PostError | undefined,
    type?: string
  ) => void
  dataSource: DATASOURCE[]
  hidden?: boolean
  showMigrate?: boolean
}) => {


  return (
    <>
      {window.innerWidth > 600 ? (
        <CollapsibleTable
          columns={[
            /*  {
                  key: "rank",
                  title: "No.",
                  render: (_value, _record, index) => index + 1,
              },*/
            {
              key: "symbol",
              title: "Farm",
              render: (_value, _record) => {
                return (
                  <div className={styles.icontable}>
                    <div className={styles.icontableHub}>
                      <img
                        style={{ width: "30px", borderRadius: "25px" }}
                        src={getICon2(
                          _value.split("-")[0].trim().toUpperCase()
                        )}
                        alt=" "
                      />
                      <img
                        style={{ width: "30px", borderRadius: "25px" }}
                        src={getICon2(
                          _value.split("-")[1].trim().toUpperCase()
                        )}
                        alt=" "
                      />
                    </div>
                    <p style={{ display: "block" }}>{_value}</p>
                  </div>
                )
              },
            },
            {
              key: "all_rewards",
              title: "Rewards",
              render: (value) => bound(value, <LoadingPlaceholder />),
            },
            {
              key: "lp_balance",
              title: "Your Unstaked LP",
              render: (value) =>
                bound(
                  commas(decimal(div(value, SMALLEST), 3)),
                  <LoadingPlaceholder />
                ),
            },
            // { key: "all_staked", title: "Total Staked" },
            // { key: "staked", title: "User Staked" },
            {
              key: "all_apy",
              title: "Combined APY",
              render: (value, { all_apr, tx_fee_apy, symbol }) =>
                bound(
                  <ApyTooltipIcon
                    content={
                      <>
                        <FarmApyTooltipContent
                          symbol={symbol}
                          apy={value}
                          tx_fee_apy={tx_fee_apy}
                          apr={all_apr}
                        />
                      </>
                    }
                  >
                    <span className={styles.blue}>
                      {bound(
                        `${
                          gte(value, "5000")
                            ? "5,000+"
                            : commas(
                                decimal(
                                  isFinite(number(niceNumber(value)))
                                    ? niceNumber(
                                        [
                                          "LunaX_uluna",
                                          "LunaX - LUNA",
                                        ].includes(symbol)
                                          ? plus(17.06, value)
                                          : value
                                      )
                                    : "0",
                                  2
                                )
                              )
                          // value
                        }%`,
                        "fetching..."
                      )}
                    </span>
                  </ApyTooltipIcon>,
                  <LoadingPlaceholder />
                ),
            },
            {
              key: "call_liquidity",
              title: "TVL",
              render: (value) => bound(value, <LoadingPlaceholder />),
            },
            {
              key: "rank",
              title: "Migrate",
              render: (value, { lpToken, symbol, staked, FarmContractType }) =>
                showMigrate &&
                gt(staked ?? "0", "0") &&
                ["terra1p266mp7ahnrnuxnxqxfhf4rejcqe2lmjsy6tuq"].includes(
                  lpToken
                ) ? (
                  <span className={styles.migrationBtn}>
                    <FarmMigrate
                      ticker={symbol}
                      lpToken={lpToken}
                      symbol={symbol}
                      farmType={FarmContractType}
                      sm={true}
                    />
                  </span>
                ) : (
                  ""
                ),
            },
          ]}
          dataSource={dataSource?.sort((a, b) =>gt(a.lp_balance,b.lp_balance) ? -1 : 1)}
          hidden={hidden}
          farmResponseFun={farmResponseFun}
        />
      ) : (
        <CollapsibleTable
          columns={[
            /*  {
                  key: "rank",
                  title: "No.",
                  render: (_value, _record, index) => index + 1,
              },*/
            {
              key: "symbol",
              title: "Farm",
              render: (_value, _record) => {
                return (
                  <div className={styles.icontable}>
                    <div className={styles.icontableHub}>
                      <img
                        style={{ width: "30px", borderRadius: "25px" }}
                        src={getICon2(
                          _value.split("-")[0].trim().toUpperCase()
                        )}
                        alt=" "
                      />
                      <img
                        style={{ width: "30px", borderRadius: "25px" }}
                        src={getICon2(
                          _value.split("-")[1].trim().toUpperCase()
                        )}
                        alt=" "
                      />
                    </div>
                    <p style={{ display: "block" }}>{_value}</p>
                  </div>
                )
              },
            },
            {
              key: "all_rewards",
              title: "Rewards",
              render: (value) => bound(value, <LoadingPlaceholder />),
            },

            // { key: "all_staked", title: "Total Staked" },
            // { key: "staked", title: "User Staked" },
            {
              key: "all_apy",
              title: "Combined APY",
              render: (value, { all_apr, tx_fee_apy, symbol }) =>
                bound(
                  <ApyTooltipIcon
                    content={
                      <>
                        <FarmApyTooltipContent
                          symbol={symbol}
                          apy={value}
                          tx_fee_apy={tx_fee_apy}
                          apr={all_apr}
                        />
                      </>
                    }
                  >
                    <span className={styles.blue}>
                      {bound(
                        `${
                          gte(value, "5000")
                            ? "5,000+%"
                            : `${commas(
                                decimal(
                                  isFinite(number(niceNumber(value)))
                                    ? niceNumber(
                                        lunaArray.includes(symbol)
                                          ? plus(17.06, value)
                                          : value
                                      )
                                    : "0",
                                  2
                                )
                              )}%`
                        }`,
                        "fetching..."
                      )}
                    </span>
                  </ApyTooltipIcon>,
                  <LoadingPlaceholder />
                ),
            },
            {
              key: "lp_balance",
              title: "Your Unstaked LP",
              render: (value) =>
                bound(
                  commas(decimal(div(value, SMALLEST), 3)),
                  <LoadingPlaceholder />
                ),
            },
            {
              key: "call_liquidity",
              title: "TVL",
              render: (value) => bound(value, <LoadingPlaceholder />),
            },
            {
              key: "rank",
              title: "Migrate",
              render: (value, { lpToken, symbol, staked, FarmContractType }) =>
                showMigrate &&
                gt(staked ?? "0", "0") &&
                ["terra1p266mp7ahnrnuxnxqxfhf4rejcqe2lmjsy6tuq"].includes(
                  lpToken
                ) ? (
                  <>
                    <FarmMigrate
                      ticker={symbol}
                      lpToken={lpToken}
                      symbol={symbol}
                      farmType={FarmContractType}
                      sm={true}
                    />
                  </>
                ) : (
                  ""
                ),
            },
          ]}
          dataSource={dataSource?.sort((a, b) =>gt(a.lp_balance,b.lp_balance) ? -1 : 1)}
          hidden={hidden}
          farmResponseFun={farmResponseFun}
        />
      )}
    </>
  )
}

export default TopFarming

export const TopFarmingFarm4 = ({
  farmResponseFun,
  dataSource,
  showMigrate = false,
  hidden = true,
}: {
  farmResponseFun: (
    res: TxResult | undefined,
    errors: PostError | undefined,
    type?: string
  ) => void
  dataSource: DATASOURCE[]
  hidden?: boolean
  showMigrate?: boolean
}) => {
  return (
    <CollapsibleTable
      columns={[
        /*  {
                  key: "rank",
                  title: "No.",
                  render: (_value, _record, index) => index + 1,
              },*/
        {
          key: "symbol",
          title: "Farm",
          render: (_value, _record) => {
            return (
              <div className={styles.icontable}>
                <div className={styles.icontableHub}>
                  <img
                    style={{ width: "30px", borderRadius: "25px" }}
                    src={getICon2(_value.split("-")[0].trim().toUpperCase())}
                    alt=" "
                  />
                  <img
                    style={{ width: "30px", borderRadius: "25px" }}
                    src={getICon2(_value.split("-")[1].trim().toUpperCase())}
                    alt=" "
                  />
                </div>
                <p style={{ display: "block" }}>{_value}</p>
              </div>
            )
          },
        },
        {
          key: "all_rewards",
          title: "Rewards",
          render: (value) => bound(value, <LoadingPlaceholder />),
        },
        {
          key: "lp_balance",
          title: "Your Unstaked LP",
          render: (value) =>
            bound(
              commas(decimal(div(value, SMALLEST), 3)),
              <LoadingPlaceholder />
            ),
        },
        /*{ key: "all_staked", title: "Total Staked" },
            { key: "staked", title: "User Staked" },*/
        {
          key: "all_apy",
          title: "Combined APY",
          render: (value, { all_apr, tx_fee_apy, symbol }) =>
            bound(
              <ApyTooltipIcon
                content={
                  <>
                    <FarmApyTooltipContent
                      symbol={symbol}
                      apy={value}
                      tx_fee_apy={tx_fee_apy}
                      apr={all_apr}
                    />
                  </>
                }
              >
                <span className={styles.blue}>
                  {bound(`${value}%`, "fetching...")}
                </span>{" "}
              </ApyTooltipIcon>,
              <LoadingPlaceholder />
            ),
        },
        {
          key: "call_liquidity",
          title: "TVL",
          render: (value) => bound(value, <LoadingPlaceholder />),
        },
      ]}
      dataSource={dataSource?.sort((a, b) =>gt(a.lp_balance,b.lp_balance) ? -1 : 1)}
      hidden={hidden}
      farmResponseFun={farmResponseFun}
    />
  )
}
