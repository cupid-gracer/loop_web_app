import { useState, useEffect } from "react"
import { Button } from "semantic-ui-react"

import Table from "../../../../components/Table"
import { getICon2 } from "../../../../routes"

import Grid from "../../../../components/Grid"
import styles from "./farming.module.scss"
import { bound } from "../../../../components/Boundary"
import { gt, gte, lt, multiple, number, plus } from "../../../../libs/math"
import { SMALLEST, UST } from "../../../../constants"
import { TooltipIcon } from "../../../../components/Tooltip"
import FarmApyTooltipContent, { lunaArray } from "../../../../components/FarmApyTooltipContent"
import Card from "../../../../components/Card"

import IconLOOPShadow from "../../../../images/stake/loop-shadow.svg"
import {
    commas,
    decimal,
    formatAssetAmount,
    lookupSymbol,
    niceNumber,
} from "../../../../libs/parse"

import UP_ICON from "../../../../images/icons/up.svg"
import DOWN_ICON from "../../../../images/icons/down.svg"

import testData from "../static.json"

const PER_PAGE = 10
const dataSource:any[] = testData.farmings

const Farming = () => {
    const [isExpand, setIsExpand] = useState(false)
    dataSource.forEach((item) =>item["_symbol"] = item["symbol"])
    return <>
        <Grid className={styles.panelHeader}>
            <div>
                <span>Pools available for liquidity farming allocation</span>
                <div>
                    <span>Voting period ends in  </span>
                    <span>12d : 10h : 39m : 08s</span>
                </div>
            </div>
            <div>
                <Button>
                    <img src={IconLOOPShadow} />
                    <span>GET LOOP POWER TO VOTE</span>
                </Button>
            </div>
        </Grid>
        <Card className={styles.card}>
            <Table
                columns={[
                    {
                        key: "symbol",
                        title: "Farm",
                        render: (_value) => {
                            const split = _value?.split("_").map((item) => lookupSymbol(item))
                            return (
                                <div className={styles.icontable}>
                                    <div className={styles.icontableHub}>
                                        <img
                                            style={{ width: "30px", borderRadius: "25px" }}
                                            src={getICon2(_value.split("_")[0].trim().toUpperCase())}
                                            alt=" "
                                        />
                                        <img
                                            style={{ width: "30px", borderRadius: "25px", marginLeft: "-8px" }}
                                            src={getICon2(_value.split("_")[1].trim().toUpperCase())}
                                            alt=" "
                                        />
                                    </div>
                                </div>
                            )
                        },
                        bold: true,
                    },
                    {
                        key:"_symbol",
                        // dataIndex: "0",
                        title: "Composition",
                        render: (value) => {
                            const split = value?.split("_").map((item) => lookupSymbol(item))

                            return bound(
                             <div className={styles.composition}>
                                <div>
                                    <span>{split[0]}</span>
                                </div>

                                <div>
                                    <span>{split[1]}</span>
                                </div>
                            </div>, "fetching...")
                        }

                    },
                    {
                        key: "C_APR",
                        title: <div style={{textAlign:"center"}}> Current Farm APR</div>,
                        align:"center",
                        render: (value) => bound( <div className={styles.APR}><span>{value}%</span></div>, 'fetching...')
                    },
                    {
                        key: "N_APR",
                        title:   "Projected New Farm APR" ,
                        align:"center",
                        render: (value) => bound(<div className={styles.APR}><span>{value}%</span></div>, 'fetching...')
                    },
                    {
                        key: "result",
                        title: "Current Results",
                        align:"center",
                        render: (value) => bound( <div className={styles.APR}><span>{value}%</span></div>, 'fetching...')
                    },
                    {
                        key: "next_vote",
                        title: <div style={{textAlign:"right"}}> Your Next Period votes</div> ,
                        align:"right",
                        render: (value) =>bound( <div className={styles.APR} style={{textAlign:"end"}}><span style={{color:"#32FE9A"}}>{value}%</span></div>, 'fetching...')
                    }
                ]}
                dataSource={isExpand? (dataSource): (dataSource)?.slice(0, PER_PAGE)
                }
            />
            {!isExpand && dataSource.length > PER_PAGE && (
                <div className={styles.expandBtn} onClick={() => setIsExpand(true)}>
                  Expand All
                </div>
              )}
              {isExpand && dataSource.length > PER_PAGE && (
                <div className={styles.expandBtn} onClick={() => setIsExpand(false)}>
                  Collapse
                </div>
              )}
        </Card>

    </>
}

export default Farming