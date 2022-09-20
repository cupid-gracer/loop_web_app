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
import styles from "./StakeInfo.module.scss"
import { TooltipIcon } from "../../../components/Tooltip"

import Card from "../../../components/Card"

import LOOPlogoLight from '../../../images/stake/LOOPlogo_light.svg'
//test
import testData from './static.json'
const stakeInfos = testData.stakeInfo

const Stake = () => {
    return (
        <>
            <Card className={styles.card}>
                <Grid className={styles.panelHeader}>
                    <TooltipIcon content={'Hello'} className={styles.panelTitle}>
                        <p>Stake LOOP</p>
                    </TooltipIcon>
                    <div className={styles.panelSubtitle}>
                        <span>Overall LOOP Locked</span>
                        <div>
                            <span>82,400.67</span>
                            <span>LOOP</span>
                        </div>
                    </div>
                </Grid>
                <Grid>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.Cell width="1" className={styles.voteEscrowTeam}>Vote escrow Term</Table.Cell>
                                <Table.Cell width="1" className={styles.apr}> APR</Table.Cell>
                                <Table.Cell width="1" className={styles.loopPower}> LOOP Power </Table.Cell>
                                <Table.Cell width="1" className={styles.totalLocked}> Total Locked </Table.Cell>
                                <Table.Cell width="1" className={styles.action}> Action </Table.Cell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                stakeInfos.map((item, index) => {
                                    return (<Table.Row key={index}>
                                                <Table.Cell className={styles.voteEscrowTeam}>
                                                    <div>
                                                        <img src={LOOPlogoLight} />
                                                        <span>{item.term}</span>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className={styles.apr}>{item.apr}</Table.Cell>
                                                <Table.Cell className={styles.loopPower}>
                                                    <span>$1</span>
                                                    <span>LOOP = </span>
                                                    <span>{item.power}</span>
                                                    <span>/y voting power</span>
                                                </Table.Cell>
                                                <Table.Cell className={styles.totalLocked}>{item.totalLocked} LOOP</Table.Cell>
                                                <Table.Cell className={styles.action}><Button>STAKE</Button></Table.Cell>
                                            </Table.Row>);
                                    
                                })
                            }
                        </Table.Body>
                    </Table>
                </Grid>
            </Card>
        </>
    )
}

export default Stake
