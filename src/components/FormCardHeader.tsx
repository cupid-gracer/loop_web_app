import { FC } from "react"
import classNames from "classnames/bind"
import Icon from "./Icon"
import LoadingTitle from "./LoadingTitle"
import { Props } from "./Card"
import styles from "./FormCardHeader.module.scss"

enum HeaderType {
  /** (align:left) title + description + loading + action */
  DEFAULT,
  /** (align:center) goBack */
  GOBACK,
  /** (align:center) */
  ICON,
}

const FormCardHeader: FC<Props> = ({ header, title, headerBorder, ...props }) => {
  const { icon, description, goBack, action, loading, slippage, headerClass, showForm, HeaderForm } = props

  const headerType = icon
    ? HeaderType.ICON
    : goBack
    ? HeaderType.GOBACK
    : HeaderType.DEFAULT

  const className = {
    [HeaderType.DEFAULT]: headerBorder ? styles.newDefault : styles.default,
    [HeaderType.GOBACK]: styles.goback,
    [HeaderType.ICON]: styles.icon,
  }[headerType]

  const render = {
    [HeaderType.DEFAULT]: (
      <>
        <section className={styles.wrapper}>
          <LoadingTitle loading={loading} size={16}>
            <h1 className={styles.title}>{title}</h1>
          </LoadingTitle>

          {description && (
            <section className={styles.description}>{description}</section>
          )}
        </section>

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
    <header className={classNames(headerClass ? headerClass : styles.header, className)}>
      <span className={styles.title}>{header ?? render}</span> {showForm && slippage} { HeaderForm ? <HeaderForm /> : null }
    </header>
  )
}

export default FormCardHeader