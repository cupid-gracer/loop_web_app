import classNames from "classnames/bind"
import Loading from "./Loading"
import styles from "./Button.module.scss"
import useAddress from "../hooks/useAddress"
import Switch from "../images/Switch.svg";

const cx = classNames.bind(styles)

const Button = (props: Button) => {
  const { loading, children ,icon,isMigrationBtn=false } = props
  // const pageName = window.location.pathname
  const address=useAddress();
  return (
    <button {...getAttrs(props)}>
      {loading && <Loading className={styles.progress} />}
      {/* {pageName == "/swap" && children !== 'MAX' && ( */}
        {icon &&
        <img src={address ? icon : Switch} className={styles.swapIcon} />
        }
      {/* )} */}
      {children}
    </button>
  )
}

export default Button

/* styles */
export const getAttrs = <T extends ButtonProps>(props: T) => {
  const { size = "sm", color = "blue", outline, block, ...rest } = props
  const { loading, submit, ...attrs } = rest
  const status = { outline, block, loading, disabled: attrs.disabled, submit }
  const className = cx(styles.button, size, color, status, attrs.className)
  return { ...attrs, className }
}
