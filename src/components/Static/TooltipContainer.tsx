import styles from "./TooltipContainer.module.scss"
import { ReactChild } from "react"
import classNames from "classnames"

const TooltipContainer = ({children}:{ children: ReactChild}) => {

  return (
    <div className={styles.tolBox}>
    <div className={styles.d_flex_col}>
      <span className={classNames(styles.d_flex_col)}>
        {children}
      </span></div>
      </div>
  )
}

export default TooltipContainer
