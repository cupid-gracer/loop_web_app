import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Helmet } from "react-helmet"
import { TxResult } from "@terra-money/wallet-provider"
import { Table, Button } from "semantic-ui-react"

import Tooltip from "../../../lang/Tooltip.json"
import useHash from "../../../libs/useHash"
import Page from "../../../components/Page"
import { useFetchTokens } from "../../../hooks"
import Grid from "../../../components/Grid"
import { PostError } from "../../../forms/CustomMsgFormContainer"
import Result from "../../../forms/Result"
import Container from "../../../components/Container"
import usePoolReceipt from "../../../forms/receipts/usePoolReceipt"
import styles from "./MyStakedLoop.module.scss"
import { TooltipIcon } from "../../../components/Tooltip"

import Card from "../../../components/Card"
import MyStakedRow from "./MyStakedRow"

import LOOPlogoLight from '../../../images/stake/LOOPlogo_light.svg'
import BtnCoin from '../../../images/stake/btn-coin.svg'
import plus_icon from "../../../images/icons/24 expand plus.svg"
import collapsed from "../../../images/stake/24 expand minus.svg"
//test
import testData from './static.json'
const myStakedInfos = testData.myStaked

const MyStakedLoop = () => {


    return (
        <>
            <Card className={styles.card}>
                <Grid className={styles.panelHeader}>
                    <TooltipIcon content={'Hello'} className={styles.panelTitle}>
                        <p>Your Staked LOOP</p>
                    </TooltipIcon>
                    <div className={styles.panelSubtitle}>
                        <div>
                            <span>Total Available Rewards</span>
                            <div>
                                <span>82,400.67</span>
                                <span> LOOP</span>
                            </div>
                        </div>
                        <div>
                            <Button>RESTAKE & COMPOUND ALL</Button>
                            <Button> <img src={BtnCoin}/> <span>Harvest All</span></Button>
                        </div>
                    </div>
                </Grid>
                <Grid className={styles.myStakedTable}>
                    <Table >
                        <Table.Header>
                            <Table.Row>
                                <Table.Cell width="1" className={styles.voteEscrowTeam}>Vote escrow Term</Table.Cell>
                                <Table.Cell width="1" className={styles.yield}> Yield</Table.Cell>
                                <Table.Cell width="1" className={styles.nextReward}> Next Reward </Table.Cell>
                                <Table.Cell width="1" className={styles.loopPower}> LOOP Power </Table.Cell>
                                <Table.Cell width="1" className={styles.totalValue}> Total Value </Table.Cell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                myStakedInfos.map((item, index) => {
                                    return <MyStakedRow key={`${item.id}_${index}`} item={item}/>
                                })
                            }
                        </Table.Body>
                    </Table>
                </Grid>
            </Card>
        </>
    )
}

export default MyStakedLoop
