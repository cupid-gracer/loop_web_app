import { useRef } from "react"
import classNames from "classnames"
import styles from "./FormGroupV2.module.scss"
import classnames from "classnames"
import { gt, multiple } from "../../libs/math"
import { decimal } from "../../libs/parse"
import FormVerticalGroup from "../FormVerticalGroup"

const cx = classNames.bind(styles)

const FormGroupV2 = ({
  input,
  textarea,
  select,
  value,
  unitClass,
  miniForm,
  multiLines,
  vertical,
  inputClass,
  showPercentageButtons = true,
  showPercentageButtonsOnTop=false,
  ...props
}: FormGroup) => {
  const hashName = window.location.hash
  const {
    label,
    help,
    unit,
    max,
    maxValue,
    assets,
    focused,
    error,
    smScreen,
    type = 1,
    newPoolDesign = false,
    hideInput = hashName == "#withdraw" ? true : false,
    maxOnly = false,
    disabledMax = false,
  } = props


  const pageName = window.location.pathname
  const { skipFeedback } = props
  const inputRef = useRef<HTMLInputElement>()
  const handleWheel = () => {
    inputRef.current?.blur()
  }

  const border = cx(styles.border, { focused, error, readOnly: value })
  const maxProps = {
    type: "button",
    className: classnames(styles.max, multiLines ? styles.slippageFormMultiMax : '', disabledMax ? styles.maxBox : '' ),
    onClick: max,
    size: "xs",
    children: "MAX",
    disabled: disabledMax
  }

  const newMaxProps={
     type: "button",
    className: classnames(styles.max, multiLines ? styles.slippageFormMultiMax : '', disabledMax ? styles.maxBox : '' ),
    onClick: max,
    size: "xs",
    children: "MAX",
    disabled: disabledMax
  }

  const addedAmountPercent = (val = "0") => {
    inputRef.current?.focus()
    let inputValue = decimal(
      multiple(maxValue?.(), val ?? "0"),
      unit.props?.token === "uusd" ? 3 : input.decimal ? input.decimal : 4
    )
    if (inputValue) {
      gt(val, "0") && input?.setValue(input.name, inputValue)
    }
  }

  
  
  return vertical ? (
    <FormVerticalGroup
      {...{
        input,
        textarea,
        select,
        value,
        unitClass,
        miniForm,
        multiLines,
        vertical,
        ...props,
      }}
    />
  ) : (
    <div
      className={classNames(
        styles.group,
        styles.component,
        styles.slippageComponent,
        label == "To" ? styles.toSwap : ""
      )}
    >
         
      {multiLines && label && (
        <header
          className={classNames(
            styles.header,
            multiLines ? styles.slippageHeaderMulti : styles.slippageHeader
          )}
        >
          <section
            className={classnames(
              styles.label,
              multiLines ? styles.labelMulti : ""
            )}
          >
            <label htmlFor={input?.id}>{label}</label>
          </section>

          {/*{help && (
              <section className={styles.help}>
                {help.title}: <strong>{help.content}</strong>
              </section>
            )}*/}
            {/*{max && <Button {...maxProps} />}*/}
          </header>
      )}

      <div className={cx(type === 1 && border)}>
        <section
          className={classNames(
            cx(type === 2 && border),
            styles.slippagefrom,
            miniForm ? styles.slippagefrom_mini : ""
          )}
        >
          {!multiLines && label && (
            <header
              className={classNames(
                styles.header,
                multiLines ? styles.slippageHeaderMulti : styles.slippageHeader
              )}
            >
              <section
                className={classnames(
                  styles.label,
                  multiLines ? styles.labelMulti : ""
                )}
              >
                <label htmlFor={input?.id}>{label}</label>
              </section>

              {/*{help && (
              <section className={styles.help}>
                {help.title}: <strong>{help.content}</strong>
              </section>
            )}*/}
              {/*{max && <Button {...maxProps} />}*/}
            </header>
          )}

          <section
            className={classNames(
              pageName == "/farm" || hashName == "#withdraw"
                ? styles.wrapper + " " + styles.wrapper2
                : styles.wrapper,
              miniForm ? styles.wrapper_mini : ""
            )}
          >
            {showPercentageButtonsOnTop ? (
        <div
          className={
            (max && input.setValue && !maxOnly) ?
            classnames(
            styles.slippagePax,styles.marginTopClass,
            multiLines ? styles.slippageFormMultiMax : ""
          )
          :
          classnames(
            styles.slippagePax,styles.disableSlippagePax,styles.marginTopClass,
            multiLines ? styles.slippageFormMultiMax : ""
          )
        
        }
        >
          { (
            <>
              <span
                onClick={() => {
                  max && input.setValue && !maxOnly &&
                  addedAmountPercent("0.25")
                }}
              >
                25%
              </span>
              <span
                onClick={() => {
                  max && input.setValue && !maxOnly &&
                  addedAmountPercent("0.50")
                }}
              >
                50%
              </span>
              <span
                onClick={() => {
                  max && input.setValue && !maxOnly &&
                  addedAmountPercent("0.75")
                }}
              >
                75%
              </span>
            </>
          )}
            <span {...maxProps}>MAX</span>
          {/* <Button {...maxProps} /> */}
        </div>
      ) : (
        ""
      )}
            {unit && (
              <>
              <section
                className={classNames(
                  styles.unit,
                  styles.slippagefromUnit,
                  unitClass,
                  miniForm ? styles.slippagefromUnitMini : ""
                )}
              >
                {unit}
              </section>
              </>
            )}

            <section
              className={classNames(
                styles.field + " " + styles.slippagefromFields,
                smScreen ? styles.sm_field : "",
                miniForm ? styles.miniField : "",
                inputClass ? styles.inputClass : ""
              )}
            >
               {/* && newPoolDesign == false  */}
              {help && (
                <b
                  className={classNames(
                    styles.pendiongSlippage,
                    miniForm ? styles.pendiongSlippageMini : "",
                    multiLines ? styles.slippageFormMultiMeta : ""
                  )}
                >
                  Balance: {help.content}
                </b>
              )}

            
              { input ? (
                hideInput ? (
                  ""
                ) : (
                  <input
                    {...input}
                    onWheel={handleWheel}
                    id={label}
                    ref={inputRef}
                    className={classnames(
                      multiLines ? styles.slippageFormMultiInput : ""
                    )}
                  />
                )
              ) : textarea ? (
                <textarea {...textarea} />
              ) : select ? (
                <div className={styles.select}>{select}</div>
              ) : (
                <input value={value} disabled />
              )}
             
            </section>
          </section>
          {assets && <section className={styles.assets}>{assets}</section>}
        </section>
      </div>

      {max && !showPercentageButtonsOnTop && input?.setValue ? (
        <div
          className={classnames(
            styles.slippagePax,
            multiLines ? styles.slippageFormMultiMax : ""
          )}
        >
          {!maxOnly && showPercentageButtons && (
            <>
              <span
                onClick={() => {
                  addedAmountPercent("0.25")
                }}
              >
                25%
              </span>
              <span
                onClick={() => {
                  addedAmountPercent("0.50")
                }}
              >
                50%
              </span>
              <span
                onClick={() => {
                  addedAmountPercent("0.75")
                }}
              >
                75%
              </span>
            </>
          )}
          {showPercentageButtons &&
            <span {...maxProps}>MAX</span>
          }
          {/* <Button {...maxProps} /> */}
        </div>
      ) : (
        ""
      )}
      
      {/* {error && !skipFeedback && (
        <p
          className={
            hashName == "#provide" || hashName == "#withdraw"
              ? styles.poolBox + " " + styles.feedback
              : styles.swapBox + " " + styles.feedback
          }
        >
          {error}
        </p>
      )} */}
     
    </div>
  )
}

export default FormGroupV2
