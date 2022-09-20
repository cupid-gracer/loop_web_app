import { useState, useEffect } from "react"
import { Table, Button } from "semantic-ui-react"

import Grid from "../../../../components/Grid"
import styles from "./vote.module.scss"

import Farming from "./Farming"
import OurPol from "./OurPol"
import PartnerPol from "./PartnerPol"

const FarmPannels = () => {
    const [expand, setExpand] = useState(false)

    const [activeNumber, setActiveNumber] = useState(1)

    const switchs = [
        {
            id: 1,
            text: 'Farming',
            page: <Farming />
        },
        {
            id: 2,
            text: 'Our POL NFTs',
            page: <OurPol />

        },
        {
            id: 3,
            text: 'Partner POL NFTs',
            page: <PartnerPol />

        }
    ];
    return <>
        <div className={styles.votePage}>
            <ul className={styles.switchPages}>
                {
                    switchs.map((item, index) => {
                        return (
                            <li key={index} className={`${styles.switchBtn}  ${activeNumber == item.id ? styles.active : ""}`} onClick={() => setActiveNumber(item.id)}>
                                {item.text}
                            </li>
                        )
                    })
                }
            </ul>
            <div>
                {
                    switchs.map((item, index) => {
                        if (activeNumber == item.id) return <div key={index}>
                            {item.page}
                        </div>
                    })
                }
            </div>
        </div>
    </>
}

export default FarmPannels
