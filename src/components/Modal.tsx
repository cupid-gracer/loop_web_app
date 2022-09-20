import classNames from "classnames"
import { FC } from "react"
import styles from "./Modal.module.scss"

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  titleClass?: string
  className?: string
}

const Modal: FC<Props> = ({ isOpen, onClose,titleClass,className, title = 'Select a Token', children }) =>
  !isOpen ? null : (
    <div
      className={`${styles.modal} ${
        isOpen ? styles.open_modal : styles.close_modal
      }`}
    >
      <div className={classNames(styles.modalContent, className)}>
        <div className={styles.modalHeader}>
         <div className={styles.title}>
           <h1 className={titleClass}>{title}</h1>
         </div>
         <div className={styles.closeSection}>
            <span className={styles.close} onClick={onClose}>
            &times;
          </span>
         </div>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {/*<div className={styles.modalFooter}>
          <h3>Modal Footer</h3>
        </div>*/}
      </div>
    </div>
  )

export default Modal
