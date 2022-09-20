import { FC } from "react"
import classNames from "classnames/bind"
import Icon from "../../Icon"
import LoadingTitle from "../../LoadingTitle"
import { Props } from "./Card"
import styles from "../../CardHeader.module.scss"
import Button from "../../Button"

enum HeaderType {
  /** (align:left) title + description + loading + action */
  DEFAULT,
  /** (align:center) goBack */
  GOBACK,
  /** (align:center) */
  ICON,
}

const CardHeader: FC<Props> = ({
  header,
  title,
  button,
  tabs,
  borderBottom,
  ...props
}) => {
  const {
    icon,
    description,
    goBack,
    action,
    loading,
    headerClass,
    title_description,
  } = props

  const headerType = icon
    ? HeaderType.ICON
    : goBack
    ? HeaderType.GOBACK
    : HeaderType.DEFAULT

  const className = {
    [HeaderType.DEFAULT]: styles.default,
    [HeaderType.GOBACK]: styles.goback,
    [HeaderType.ICON]: styles.icon,
  }[headerType]

  const render = {
    [HeaderType.DEFAULT]: (
      <>
        <section className={styles.wrapper}>
          <LoadingTitle loading={loading} size={16}>
            <h1 className={`${styles.title} my-10`}>{title}</h1>
          </LoadingTitle>
          {title_description && (
            <section className={styles.description}>
              {title_description}
            </section>
          )}
        </section>
        {description && (
          <section className={styles.description}>{description}</section>
        )}
        {action && <section className={styles.action}>{action}</section>}
      </>
    ),

    [HeaderType.GOBACK]: (
      <>
        {goBack && (
          <button type="button" className={styles.action} onClick={goBack}>
            <Icon name="arrow_back_ios" size={24} />
          </button>
        )}

        <h1 className={styles.title}>{title}</h1>
      </>
    ),

    [HeaderType.ICON]: (
      <>
        <section className={styles.wrapper}>{icon}</section>
        <h1 className={styles.title}>{title}</h1>
      </>
    ),
  }[headerType]

  return !(header || title) ? null : (
    <header
      className={classNames(
        headerClass
          ? headerClass
          : borderBottom
          ? styles.header
          : classNames(styles.header, styles.newHeader),
        className
      )}
    >
      {header ?? render}
      <div
        className={
          title == "Liquidity Positions"
            ? styles.rightHeader
            : styles.poolWidget
        }
      >
        {tabs}
      </div>
    </header>
  )
}

export default CardHeader
