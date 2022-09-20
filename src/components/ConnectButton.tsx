import { FC } from "react"
import classNames from "classnames"
import styles from "./ConnectButton.module.scss"

interface Props {
  address?: string
  className?: string
  onClick: () => void
}

const ConnectButton: FC<Props> = (props) => {
  const { address, className, children, ...attrs } = props

  return (
    <button {...attrs} className={address ? classNames(styles.button, className) : classNames(styles.connectWalletButton, className)  }>
      {address && <span className={styles.address}>{address}</span>}
      {children}
    </button>
  )
}

export default ConnectButton
