import { FC } from "react"
import classNames from "classnames/bind"
import Icon from "./Icon"
import LoadingTitle from "./LoadingTitle"
import { Props } from "./Card"
import styles from "./CardHeader.module.scss"
import Button from "./Button"

enum HeaderType {
  /** (align:left) title + description + loading + action */
  DEFAULT,
  /** (align:center) goBack */
  GOBACK,
  /** (align:center) */
  ICON,
}

const CardHeader: FC<Props> = ({ header, title, button, showForm, ...props }) => {
  const { icon, description, goBack, action, loading, headerClass, title_description } = props

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
            <h1 className={styles.title}>{title}</h1>
          </LoadingTitle>
          {title_description && (
              <section className={styles.description}>{title_description}</section>
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
    <header className={classNames(headerClass ? headerClass : styles.header, className)}>
      {header ?? render}{button && (<Button style={{backgroundColor: '#1eb2ff', color: '#000', borderColor: '#1eb2ff'}} > {button} </Button>)}
    </header>
  )
}

export default CardHeader
