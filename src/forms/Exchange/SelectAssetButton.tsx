import { FC, useEffect, useState } from "react"
import MESSAGE from "../../lang/MESSAGE.json"
import { trimToken } from "../../libs/parse"
import Icon from "../../components/Icon"
import { Config } from "./useSelectSwapAsset"
import styles from "../SelectAsset.module.scss"
import {changedIcons} from "../../routes";
interface Props extends Config {
  isOpen: boolean
  symbol?: string
  onClick: () => void
  smScreen?: boolean
  vertical?: boolean
  color?:any
  disabled?: boolean
}

const SelectAsset: FC<Props> = ({
  isOpen,
  symbol,
  onClick,
  color,
  smScreen,
  disabled
}) => {
  
  const getSymbol = (symbol: string) =>
    smScreen ? trimToken(symbol) : symbol
  return (
    <button type="button" className={styles.button} onClick={!disabled ? onClick : ()=>{}}>
      <span style={(color && color.index===0) ? {color:`${color.color}`} : (color && color.index===1) ? {color:`${color.color}`} : {}}>
        {symbol && changedIcons[symbol?.toUpperCase()] && (
            <img
                height={"25"}
                width={"25"}
                src={changedIcons[symbol?.toUpperCase()] ?? ""}
            />
        )}
        {symbol ? getSymbol(symbol) : MESSAGE.Form.Button.SelectAsset}
      </span>
      { !disabled && <Icon name={isOpen ? "arrow_drop_up" : "arrow_drop_down"} size={24} />}
    </button>
  )
}

export default SelectAsset
