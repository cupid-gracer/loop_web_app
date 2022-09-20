import styles from "./Steps.module.scss"
import classnames from "classnames"
import {gte} from "../../libs/math"

const Step = ({step, current}:{step: string | number, current: string}) => {
    // const {searchQ} = useStep(step, minus(step, step).toString())
    return <div  className={classnames(styles.step, gte(current, step) ? styles.fill : "", current == step ? styles.active : '')}>{step}</div>
}

const Steps = ({current, maxSteps = '3'}:{ current: string, maxSteps?: string | number }) => {

  return (
      <div className={styles.steps}>
        <div className={styles.container}>
          <div className={styles.progressWrap}>
            <div className={styles.progress} id="progress"></div>
              { gte(maxSteps, '1') && <Step step="1" current={current}/> }
              { gte(maxSteps, '2') && <Step step="2" current={current}/> }
              { gte(maxSteps, '3') && <Step step="3" current={current}/> }
              {/* <Step step={4} current={current} /> */}
          </div>
        </div>
      </div>
  )
}

export default Steps
