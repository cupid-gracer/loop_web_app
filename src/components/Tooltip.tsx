import { FC } from "react"
import Tippy, { TippyProps } from "@tippyjs/react"
import classNames from "classnames"
import { isNil } from "ramda"
import Icon from "./Icon"

import "tippy.js/dist/tippy.css"
import "tippy.js/themes/light-border.css"
import styles from "./Tooltip.module.scss"
import TooltipContainer from "./Static/TooltipContainer"

export const DefaultTippyProps: TippyProps = {
  animation: false,
  interactive: true,
  appendTo: document.body,
}

export const DropdownTippyProps: TippyProps = {
  ...DefaultTippyProps,
  placement: "bottom-end",
  trigger: "click",
}

const TooltipTippyProps: TippyProps = {
  ...DefaultTippyProps,
  placement: "top",
  theme: "light-border",
  className: styles.tooltip,
}

interface Props extends Omit<TippyProps, "children"> {
  onClick?: () => void
  alignTextToLeft?: boolean
  className?: string
}

export const Tooltip: FC<Props> = ({ className, onClick, children, alignTextToLeft=false,...props }) => {
  const button = (
    <button
      type="button"
      className={classNames(alignTextToLeft ? styles.newButton  :styles.button, className)}
      onClick={onClick}
    >
      {children}
    </button>
  )

  return props.content ? (
    <Tippy
      {...TooltipTippyProps}
      {...props}
      content={<TooltipContainer><h3>{props?.content}</h3></TooltipContainer>}
      hideOnClick={isNil(props.visible) ? false : undefined}
    >
      {button}
    </Tippy>
  ) : (
    button
  )
}

export const TooltipIcon: FC<Props> = ({ children, className, ...props }) => (
  <div className={classNames(styles.flex, className)}>
    {children}
    <div className={styles.icon}>
      <Tooltip {...props}>
        <Icon name="info_outline" size={16} />
      </Tooltip>
    </div>
  </div>
)

export default Tooltip
