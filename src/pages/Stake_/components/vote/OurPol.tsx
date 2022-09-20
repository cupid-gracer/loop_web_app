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
const dataSource:any[] = testData.ourpols

const OurPol = () => {
    const [isExpand, setIsExpand] = useState(false)
    return <>
        <Grid className={styles.panelHeader}>
            <div style={{flex:"2"}}>
                <span>Amount of LOOP available for our POL reward NFTs is in the period :</span>
                <span>4,000000 ≈ US $1.6M</span>
                <div>
                    <span>Next Period:  </span>
                    <span>14th Auhust 2022 - 27th August 2022</span>
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
                        title: "Pair",
                        align:"left",
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
                                        <span>{_value.replace('_',' - ')}</span>
                                    </div>
                                </div>
                            )
                        },
                        bold: true,
                    },
                    {
                        key:"reward",
                        // dataIndex: "0",
                        title: "LOOP Rewards",
                        render: (value,{apx_reward}) => {
                            return bound(
                             <div className={styles.reward}>
                                <div>
                                    <span>{value} LOOP</span>
                                </div>

                                <div>
                                    <span>≈{apx_reward}UST</span>
                                </div>
                            </div>, "fetching...")
                        }

                    },
                    {
                        key: "period",
                        title: <div style={{textAlign:"left"}}> Vesting Period</div>,
                        align:"left",
                        render: (value) => bound( <div className={styles.APR} style={{textAlign:"left"}}><span>{value} Months</span></div>, 'fetching...')
                    },
                    {
                        key: "total_vote",
                        title:   <div style={{textAlign:"left"}}> Total Votes</div> ,
                        align:"left",
                        render: (value) => bound(<div className={styles.APR} style={{textAlign:"left"}}><span>{value}%</span></div>, 'fetching...')
                    },
                    {
                        key: "total_loop",
                        title:  <div style={{textAlign:"left"}}> Total LOOP</div> ,
                        align:"left",
                        render: (value) => bound( <div className={styles.APR} style={{textAlign:"left"}}><span>{value}</span></div>, 'fetching...')
                    },
                    {
                        key: "num_nft",
                        title: <span>Number of NFTs<br/>(at US $1,000 each)</span>,
                        align:"left",
                        render: (value) => bound( <div className={styles.APR} style={{textAlign:"left"}}><span>{value}</span></div>, 'fetching...')
                    },
                    {
                        key: "your_vote",
                        title: <div style={{textAlign:"right"}}> Your Vote</div> ,
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

export default OurPol