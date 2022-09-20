import { useState, useEffect } from "react"
import { Table, Button } from "semantic-ui-react"

import Grid from "../../../components/Grid"
import styles from "./MyStakedLoop.module.scss"

import LOOPlogoLight from '../../../images/stake/LOOPlogo_light.svg'
import plus_icon from "../../../images/icons/24 expand plus.svg"
import collapsed from "../../../images/stake/24 expand minus.svg"

import ExpandedRow from "./MyStakedExpandRow"

const MyStakedRow = ({ item: item }) => {
    const [expand, setExpand] = useState(false)
    const collapsedIcon = <img src={expand ? collapsed : plus_icon} alt={expand ? '-' : '+'} className={styles.expand_icon} onClick={() => setExpand(!expand)} />
    return <>
        <Table.Row className={expand?styles.expand:""} onClick={() => item.details?.length && setExpand(!expand)} >
            <Table.Cell className={styles.voteEscrowTeam}>
                <div>
                    <img src={LOOPlogoLight} />
                    <span>{item.term}</span>
                </div>
            </Table.Cell>
            <Table.Cell className={styles.yield}>{item.yield}</Table.Cell>
            <Table.Cell className={styles.nextReward}>
                <span>{item.nextReward}</span>
                <span>LOOP</span>
            </Table.Cell>
            <Table.Cell className={styles.loopPower} style={{color:item.p1==item.p2?"#32FE9A":"white"}}>{item.p1}/{item.p2} </Table.Cell>
            <Table.Cell className={styles.totalValue}>
                <div>
                    <span>{item.totalValue}</span> {collapsedIcon}
                </div>
            </Table.Cell>
        </Table.Row>
        {
            item.details?.length && expand?<ExpandedRow details={item.details}/>:''
        }
    </>
}

export default MyStakedRow