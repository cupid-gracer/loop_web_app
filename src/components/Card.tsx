import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames/bind"
import CardHeader from "./CardHeader"
import styles from "./Card.module.scss"
import FormCardHeader from "./FormCardHeader"
import classnames from "classnames";

const cx = classNames.bind(styles)

export interface Props {
  /** Icon above title */
  icon?: ReactNode
  header?: ReactNode
  title?: ReactNode | undefined | string
  description?: ReactNode
  title_description?: ReactNode
  headerClass?: string | undefined
  button?: string | undefined

  /** Card acts as a link */
  to?: string
  /** Button to the left of the title */
  goBack?: () => void
  /** Button to the right of the title */
  action?: ReactNode
  /** Badges */
  badges?: Badge[]

  /** Card class */
  className?: string
  /** More padding and more rounded corners */
  lg?: boolean
  /** No padding */
  full?: boolean
  /** Box shadow */
  shadow?: boolean
  /** Show loading indicator to the right of title */
  loading?: boolean
  /** if card has form child */
  hasForm?: boolean
  /** slippage content */
  slippage?: ReactNode
  mainSectionClass?: string
  showForm?: boolean
  makeCollapseable?: boolean
  poolSwapWidget?: boolean
  HeaderForm?: ReactNode | any
  padded?:boolean
  headerBorder?: boolean
}

interface Badge {
  label: string
  color: string
}

const Card: FC<Props> = (props) => {
  const {
    children,
    to,
    badges,
    className,
    lg,
    full,
    shadow,
    hasForm,
    mainSectionClass,
    headerClass,
    showForm=true,
    makeCollapseable=false,
    poolSwapWidget=false,
    HeaderForm,
    padded,
    headerBorder=false,
  } = props

  const attrs = {
    className: cx(styles.card, { lg, full, link: to, shadow, padded }, className),
    children: (
      <>
        {hasForm ? (
          <FormCardHeader {...props} headerClass={headerClass}  headerBorder={headerBorder} />
          ) : (
           <CardHeader {...props} headerClass={headerClass} />
       )}

        {badges && (
          <section className={styles.badges}>
            {badges.map(({ label, color }) => (
              <span className={cx(styles.badge, `bg-${color}`)} key={label}>
                {label}
              </span>
            ))}
          </section>
        )}
        {!makeCollapseable && (
           <section  hidden={!showForm} className={classnames(mainSectionClass ? mainSectionClass : styles.main )} style={poolSwapWidget ? {paddingTop:'2px'} : {}}>
           {children}
         </section>
        )

        }
       
      </>
    ),
  }

  return to ? <Link {...attrs} to={to} /> : <div {...attrs} />
}

export default Card