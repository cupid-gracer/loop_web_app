import classNames from "classnames"

import styles from "./Header.module.scss"
import LinkButton from "../../../components/LinkButton"
import close from "../../../images/close_icon.svg"
import goback_icon from "../../../images/farm_migrate/back.svg"
import { getPath, MenuKey } from "../../../routes"
import Grid from "../../../components/Grid"
import {useHistory} from "react-router-dom"
import {useEffect, useState} from "react";
import {FarmContractTYpe} from "../../../data/farming/FarmV2"
import Button from "../../../components/Button";
const queryString = require('query-string')

export const Header = ({current, heading}:{ current: string, heading?: string}) => {
    const [lpToken, setLpToken]  = useState('')
    const [ticker, setTicker]  = useState('')
    const [farmType, setFarmType]  = useState<FarmContractTYpe>(FarmContractTYpe.Farm2)

    useEffect(()=>{
        const  query= queryString.parse(window.location.search);

        if (query.lp) {
            setLpToken(query?.lp)
        }
        if (query.ticker) {
            setTicker(query?.ticker)
        }
        if (query.ticker) {
            setFarmType(query?.type)
        }
        if (query.ticker) {
            setFarmType(query?.type)
        }
    },[window.location.search, queryString])

    const history = useHistory()
    const navigate = () => {
        history.push({
            pathname: getPath(MenuKey.FARM_MIGRATE),
            search: `?lp=${lpToken}&step=step1&type=${farmType}&ticker=${ticker.replace(/ /g, "").trim()}`
        })
    }

    return (<div className={styles.titleContainer}>
        { !heading ? <Grid className={styles.row}>
            <div className={classNames(styles.title, styles.centerDiv, heading ? styles.head : '')}>
                <Button onClick={navigate} type={'button'} className={styles.close}><img src={goback_icon} alt={'close'} height={'25px'} width={'25px'} /></Button>
            </div>
        </Grid> : <Grid className={styles.row} /> }
        <Grid className={styles.row}>
            <div className={classNames(styles.title, styles.centerDiv, heading ? styles.head : '')}>
                <h1>{heading ? heading :  `Step ${current}`}</h1>
            </div>
        </Grid>
        <Grid className={styles.row}>
            <div className={styles.closeCard}>
                <LinkButton to={getPath(MenuKey.FARMV3)} className={styles.close}><img src={close} alt={'close'} height={'25px'} width={'25px'} /></LinkButton>
            </div>
        </Grid>
    </div>)

}
export default Header
