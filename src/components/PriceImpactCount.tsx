import classNames from "classnames/bind"
import { gt } from "../libs/math"
import styles from "./PriceImpaceCount.module.scss"

const cx = classNames.bind(styles)

interface Props {
  price?: string
}

const PriceImpaceCount = ({ price }: Props) => {
  return gt(price ?? "0", '0') ? (
    <span className={cx(styles.flex)}>
      <span className={classNames(styles.price, gt(price ?? "0", '10') ? styles.red : '')}>{`${price ?? "0"}%`}</span>
    </span>
  ): <span className={styles.price}>0</span>
}

export default PriceImpaceCount
