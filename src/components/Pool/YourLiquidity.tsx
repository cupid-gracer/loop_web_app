import styles from "./YourLiquidity.module.scss"
import Pool from "../../pages/Pool/Pool"
import Boundary from "../../components/Boundary"
import ClipLoader from "react-spinners/ClipLoader"
import {css} from "@emotion/react"
import Card from "../Card"
import {TxResult} from "@terra-money/wallet-provider";
import {PostError} from "../../forms/FormContainer";
import useAddress from "../../hooks/useAddress"


const YourLiquidity = (responseFun:any) => {
  // const pageName = window.location.pathname
  // const hashName = window.location.hash
  const address=useAddress();
  const color = '#FFFFFF'
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: white;
    `

  return (
    <div className={styles.flex}>
      <section className={styles.chart}>
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
              <Pool responseFun={responseFun} showTable={address ? true :false} />
            </Boundary>
      </section>
    </div>
  )
}

export default YourLiquidity
