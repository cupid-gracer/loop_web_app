import { useRef } from "react"
import classNames from "classnames"
import styles from "./FormGroupError.module.scss"
import FormVerticalGroup from "./FormVerticalGroup";

const cx = classNames.bind(styles)

const FormGroupError = ({
  input,
  textarea,
  select,
  value,
  unitClass,
  miniForm,
  multiLines,
  vertical,
  inputClass,
  ...props
}: FormGroup) => {
  const hashName = window.location.hash
  const {
    label,
    error
  } = props
  const { skipFeedback } = props
  const inputRef = useRef<HTMLInputElement>()
  const handleWheel = () => {
    inputRef.current?.blur()
  }


  return (
      vertical ?  <FormVerticalGroup { ...{
                                       input,
                                       textarea,
                                       select,
                                       value,
                                       unitClass,
                                       miniForm,
                                       multiLines,
                                       vertical,
                                       ...props
                                     }} />
          :
    <div
      className={classNames(
        styles.group,
        styles.component,
        styles.slippageComponent,
        label == "To" ? styles.toSwap : ""
      )}
      style={{zIndex:999}}
    >
      {error && !skipFeedback && (
        <p
          className={
            hashName == "#provide" || hashName == "#withdraw"
              ? styles.poolBox + " " + styles.feedback
              : styles.swapBox + " " + styles.feedback
          }
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default FormGroupError