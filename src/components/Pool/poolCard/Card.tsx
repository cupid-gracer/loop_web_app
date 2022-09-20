import { FC, ReactNode } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames/bind"
import CardHeader from "./CardHeader"
import styles from "./Card.module.scss"
import FormCardHeader from "../../FormCardHeader"
import classnames from "classnames"

const cx = classNames.bind(styles)

export interface Props {
  /** Icon above title */
  icon?: ReactNode
  header?: ReactNode
  title?: ReactNode | undefined | string
  tabs?: ReactNode
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
  poolSwapWidget?: boolean
  overflow?: boolean
  borderBottom?: boolean
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
    overflow = false,
    borderBottom = true,
  } = props

  const attrs = {
    className: overflow
      ? cx(styles.fullCard, { lg, full, link: to, shadow }, className)
      : cx(styles.card, { lg, full, link: to, shadow }, className),
    children: (
      <>
        {hasForm ? (
          <FormCardHeader {...props} headerClass={headerClass} />
        ) : (
          <CardHeader
            {...props}
            headerClass={headerClass}
            borderBottom={borderBottom}
          />
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

        <section
          className={classnames(
            mainSectionClass ? mainSectionClass : styles.main
          )}
        >
          {children}
        </section>
      </>
    ),
  }

  return to ? <Link {...attrs} to={to} /> : <div {...attrs} />
}

export default Card
