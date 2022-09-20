import Button from "../../components/Button"
import {useHistory} from "react-router-dom"
import { MenuKey } from "../../routes"
import styles from './FarmWizard.module.scss'
import transactions_black from '../../images/farm_migrate/transactions_black.svg'


export function FarmWizard({
  ticker,
  lpToken,
  farmType,
  path,
  title,
  className
}: {
  ticker: string
  lpToken: string
  farmType: string
  path: MenuKey | string
  title: string
  className?: string
}) {

  const history = useHistory()
  const func = () => {
    history.push({
      pathname: path,
      search: `?lp=${lpToken}&step=step1&type=${farmType}&ticker=${ticker.replace(/ /g, "").trim()}`
    })
  }

  return (
    <>
      <Button className={className} color={'green'} onClick={func} ><img src={transactions_black} height={20} alt={''} /><span className={styles.migrate}>{title}</span></Button>
    </>
  )
}