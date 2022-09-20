import { useState, useEffect } from "react"
import { Table, Button } from "semantic-ui-react"

import Grid from "../../../components/Grid"
import styles from "./MyStakedLoop.module.scss"

import LOOPlogoLight from '../../../images/stake/LOOPlogo_light.svg'
import plus_icon from "../../../images/icons/24 expand plus.svg"
import collapsed from "../../../images/stake/24 expand minus.svg"
import mintIcon from "../../../images/stake/mint-icon.svg"

const DigitalTime = ({ time: time, unit:unit }) => {
    const tenDigit = time.length == 1 ? "0" : time.slice(0, 1)
    const oneDigit = time.length == 1 ? time.slice(0, 1) : time.slice(1, 2)
    const isColor = unit == "hours" || unit == "minutes"
    return <div className={styles.timeBoard}>
        <div className={styles.digitalTime}>
            <div>
                <span style={{color:isColor?"#1FC1E8":"white"}}>{tenDigit}</span>
            </div>
            <div>
                <span style={{color:isColor?"#1FC1E8":"white"}}>{oneDigit}</span>
            </div>
        </div>
        <div>
            {unit}
        </div>
    </div>
}

const ExpandedRow = ({ details: details }) => {
    return <>
        {
            details.map((item, index) => {
                return <Table.Row key={`${index}`} className={styles.expandRow}>
                    <Table.Cell className={styles.voteEscrowTeam}>
                        <Button className={styles.btnMint}>
                            <img src={mintIcon} />
                            <span>MINT TO NFT</span>
                        </Button>
                    </Table.Cell>
                    <Table.Cell className={styles.weight}>
                        <span>weight</span>
                        <span>{item.weight}%</span>
                    </Table.Cell>
                    <Table.Cell className={styles.nextReward}>
                        <span>Available Rewards</span>
                        <div>
                            <span>{item.avReward}</span>
                            <span>LOOP</span>
                        </div>
                        <span >${item.v1} next reward: {item.nextReward}</span>
                    </Table.Cell>
                    <Table.Cell className={styles.loopPower}>
                        <div>
                            <span>{item.loopPower}</span>
                            <div>
                                <Button>RESTAKE</Button>

                            </div>
                        </div>
                    </Table.Cell>
                    <Table.Cell className={styles.remaingTime}>
                        <span>Remaing time</span>
                        <div className={styles.leftTime}>
                            <DigitalTime time={item.remaingTime.month} unit={'months'} />
                            <DigitalTime time={item.remaingTime.day} unit={'days'} />
                            <DigitalTime time={item.remaingTime.hour} unit={'hours'} />
                            <DigitalTime time={item.remaingTime.minutes} unit={'minutes'} />
                        </div>
                    </Table.Cell>
                </Table.Row>
            })}
    </>
}

export default ExpandedRow