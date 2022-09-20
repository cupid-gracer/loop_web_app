import styles from "./YourLiquidity.module.scss"
import {ReactNode} from "react"
import Card from "../Positions/Card"
import Container from "../Container"
import Pool from "../../pages/Pool/Pool"
// import LinkButton from "../components/LinkButton";
// import {getPath, MenuKey} from "../routes";
import Boundary, {bound} from "../Boundary"
import ClipLoader from "react-spinners/ClipLoader"
import {div} from "../../libs/math"
import {css} from "@emotion/react"
import Tooltip from "../../lang/Tooltip.json"
import {TooltipIcon} from "../Tooltip"
import Button from "../Button"
import {Tooltip as ToolTip } from "../Tooltip"


interface Prop {
  title: string
  content: string
  hidden: boolean
  noMobile: boolean
}

export const diff  = "2"

const HeaderModal = ({
  title,
  content,
  hidden,
  noMobile
}: Prop) => {
  return (
    !hidden ? (
      <div className={noMobile ? styles.noMobile : ''}>
        <section className={styles.farmingWizard}>
            <Card className={styles.Card}>
                <div className={styles.content}>
      <ToolTip content="Coming Soon">

                    <Button size={'lg'} className={styles.button} type={'button'}>{title}</Button>
        </ToolTip>
                    <span><span><TooltipIcon content={title==="FARMING WIZARD" ?  Tooltip.Pool.PoolFarmingWizard: Tooltip.Pool.PoolShare } /></span> {content}</span>
                    
                </div>
            </Card>
      </section>
    </div>
    ) : <></>
  )
}

export default HeaderModal
