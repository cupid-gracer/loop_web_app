import { FC, ReactNode } from "react"
import styles from "./Summary.module.scss"
import Grid from "../../../components/Grid"
import { div } from "../../../libs/math"
import classnames from "classnames"
import Card from "../../../components/Card"
import { Tooltip } from "@material-ui/core"
import { TooltipIcon } from "../../../components/Tooltip"
import IconArrowDown from "../../../images/stake/arrow-down.svg"

interface Props {
    icon1: string
    icon2?: string
    value1?: string
    value2?: string
    className?: string
    style?:any
}

const SummaryVote: FC<Props> = ({
    icon1,
    icon2,
    value1,
    value2,
    style
}) => (
    <div style={style} className={styles.cardContainer}>
    <Card className={styles.card} >
        <Grid className={styles.wrapper}>
            <h1 className={classnames(styles.title)}>
            <TooltipIcon content={'Hello'} className={styles.panelTitle}>
                <p>Voting Value</p>
            </TooltipIcon>
            </h1>
            <div className={styles.nextLineVote}>
                {icon1?<img src={icon1} alt={""} className={styles.icon} />:''}
                <span className={styles.value}>{value1}</span>
                <span className={styles.subValue}>  LOOP Power</span>
            </div>
            <div className={styles.arrowDown}> <img src={IconArrowDown}/></div>
            <div className={styles.nextLine}>
                {icon2?<img src={icon2} alt={""} className={styles.icon} />:''}
                <span className={styles.value}>{value2}</span>
                <span className={styles.subValue}>  UST Per Year Voting Power</span>
            </div>
        </Grid>
    </Card>
    </div>
)

export default SummaryVote
