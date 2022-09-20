import styles from "./PoolWithPoolList.module.scss"
import {ReactNode} from "react"
import HeaderModal from "../components/Pool/HeaderModal"
import RecommendedPools from "../components/Pool/RecommendedPools"
import Container from "../components/Container"
import Card from "../components/Card"
import Boundary, { bound } from "../components/Boundary"
import { ClipLoader } from "react-spinners"
import {css} from "@emotion/react"
import Pool from "../pages/Pool/Pool"

interface Props {
  children: ReactNode
  version: number | string
  setPairlpToken?: any
  setPairAddr?:any
  setFirstToken?:any
  setSecondToken?:any
  isValueZero?:boolean
  setIsTokenSelected?:any
  isTokenSelected?:boolean
  isPercentageButtons?:boolean
  isFirstTokenBalanceZero?:boolean
}

const PoolWithPoolList = ({ children, version,setPairlpToken,setPairAddr,setFirstToken,setSecondToken,isValueZero,setIsTokenSelected,isTokenSelected,isPercentageButtons,isFirstTokenBalanceZero }: Props) => {

  const color = '#FFFFFF'
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: white;
    `

  return (
    <div className={styles.flex}>
      {
        version === 2 ? <>
        <section className={styles.content}>
        <HeaderModal title={"HOW TO POOL?"} content={
          "By adding liquidity you’ll earn 0.225% of all trades on the pair + farm rewards"
          } hidden={false} noMobile={true} />
        <div className={styles.childPool}>{children}</div>
      </section>
      <section className={styles.chart}>
        {bound(<RecommendedPools isFirstTokenBalanceZero={isFirstTokenBalanceZero} setIsTokenSelected={setIsTokenSelected} isTokenSelected={isTokenSelected} setPairlpToken={setPairlpToken} setPairAddr={setPairAddr} setFirstToken={setFirstToken} setSecondToken={setSecondToken} isValueZero={isValueZero} isPercentageButtons={isPercentageButtons} />)}
      </section>
        </>
      :
      <>
        <section className={styles.content}>
        <div className={styles.childPool}>{children}</div>
      </section>
      <section className={styles.chart}>
        <Container sm>
          <Card title="Your Liquidity" className={styles.your_liquidity}>
            <div className={styles.your_liquidity_content}>
              <Boundary
                  fallback={<div className="dashboardLoaderInline">
                    <ClipLoader
                        color={color}
                        loading={true}
                        css={override}
                        size={50}
                    />
                  </div>}
              >
                <Pool version={version} />
              </Boundary>
              <h6 className={styles.msg}>
                If you staked your LP tokens in a farm,
                <br /> unstake them to see them here.
              </h6>
            </div>
          </Card>
        </Container>
      </section>
      </>
}
    </div>
  )
}

export default PoolWithPoolList
