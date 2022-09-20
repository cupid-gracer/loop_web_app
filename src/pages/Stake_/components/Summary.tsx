import { FC, ReactNode } from "react"
import styles from "./Summary.module.scss"
import Grid from "../../../components/Grid"
import { div } from "../../../libs/math"
import classnames from "classnames"
import Card from "../../../components/Card"

interface Props {
    title: string
    icon?: string
    value?: string
    subValue?: string
    className?: string
    style?:any
}

const Summary: FC<Props> = ({
    title,
    icon,
    value,
    children,
    subValue,
    style
}) => (
    <div style={style} className={styles.cardContainer}>
    <Card className={styles.card} >
        <Grid className={styles.wrapper}>
            <h1 className={classnames(styles.title)}>
                {title}
            </h1>
            <Grid className={styles.nextLine}>
                {icon?<img src={icon} alt={""} className={styles.icon} />:''}
                <span className={styles.value}>{value}</span>
                <span className={styles.subValue}>{subValue}</span>
            </Grid>
        </Grid>
    </Card>
    </div>
)

export default Summary
