import { Link, LinkProps } from "react-router-dom"
import Tippy from "@tippyjs/react"
import Tooltip, { DropdownTippyProps } from "./Tooltip"
import Icon from "./Icon"
import Dropdown from "./Dropdown"
import styles from "./DashboardActions.module.scss"

const DashboardActions = ({ list, disabled }: { list: LinkProps[], disabled?: boolean }) => {
  const links = list.filter(({ to }) => !!to).map((item) => <Link {...item} />)
  return (
    disabled ? <Tooltip content='coming soon'>
       <button className={styles.trigger}>
        <Icon name="more_horiz" size={18} />
      </button>
    </Tooltip> :
    <Tippy {...DropdownTippyProps} render={() => <Dropdown list={links} />}>
      <button className={styles.trigger}>
        <Icon name="more_horiz" size={18} />
      </button>
    </Tippy>
  )
}

export default DashboardActions
