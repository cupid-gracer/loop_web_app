import { Helmet } from "react-helmet"
import { Grid } from "@material-ui/core"

import Tooltip from "../../lang/Tooltip.json"
import {SMALLEST, UST, UUSD} from "../../constants"
import {
    commas, decimal, decimalnPlaces,
    formatAsset,
    formatAssetAmount,
    lookupSymbol,
} from "../../libs/parse"
import { getICon2, getPath, MenuKey } from "../../routes"
import Card from "../../components/Card"
import Table from "../../components/Table"
import { Di } from "../../components/Dl"
import { TooltipIcon } from "../../components/Tooltip"
import Delisted from "../../components/Delisted"
import DashboardActions from "../../components/DashboardActions"
import useAddress from "../../hooks/useAddress"
import Connect from "../../layouts/Connect"
import { Type } from "../Exchange"
import styles from "./Holdings.module.scss"
import connectBtnStyle from "../../components/theme/Menu.module.scss"
import Price from "../../components/Price"
import {bound} from "../../components/Boundary"
import MESSAGE from "../../lang/MESSAGE.json"
import {openTransak} from "../BuyUst";
import useMyHoldings from "./useMyHoldings"
import { number, div, gt,multiple } from "../../libs/math"
import { useProtocol } from "../../data/contract/protocol"
import { lt } from "ramda"

const Holdings = () => {
  const address = useAddress()
    const {totalValue, dataSource } = useMyHoldings()
    const { ibcList } = useProtocol()
  
  const renderTooltip = (value: string, tooltip: string) => (
   <TooltipIcon content={tooltip}>
      <Price
        price={commas(decimal(div(value ?? "0", SMALLEST) ?? "0",2))}
        symbol={lookupSymbol(UUSD)}
      />
    </TooltipIcon>
  )
  const dataExists = !!dataSource.length
  let sortdataBal = []
  dataSource.map((item) => {
    sortdataBal.push(item.balance)
  })

  const description = (dataExists && !isNaN(number(totalValue))) && (
    <Di
      title="Total Holdings Value"
      className={styles.withDrawableValue}
      content={renderTooltip(totalValue, Tooltip.My.TotalHoldingValue)}
    />
  )

  return (
    <Grid>
      <Helmet>
        <title>Loop Markets | My Portfolio</title>
      </Helmet>

      <Card
        title={"Holdings"}
        headerClass={styles.header}
        description={bound(description)}
      >
        {!address ? (
          <div className={styles.CzConnectWallet} style={{textAlign: 'center'}}>
            <h6 className={styles.connection_required_info}>
              Connect your wallet to see your Holdings
            </h6>
            <div className={connectBtnStyle.connection_btn}>
              <Connect />
            </div>
          </div>
        ):
          <Table
            columns={[
              {
                key: "symbol",
                title: "Ticker",
                render: (symbol, { status }) => {
                  const sym = ibcList[symbol] ? ibcList[symbol]?.symbol : lookupSymbol(symbol)

                  return <>
                    {status === "DELISTED" && <Delisted />}
                    <div className={styles.icontable}>
                            <div className={styles.icontableHub}>
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(sym.split("-")[0].trim().toUpperCase())}
                                    alt=" "
                                />
                            </div>
                            <p style={{ display: "block" }}>{sym}</p>
                        </div>
                  </>
                },
                bold: true,
                align: "left",
              },
              { key: "name", title: "Name", align: "left", render: (value) => ibcList[value] ? ibcList[value]?.name : value },
              {
                key: "price",
                
                align: "left",
                render: (value) => `${decimalnPlaces(value, "000")} ${UST}`,
              },
              /*{
              key: "change",
              title: "",
              render: (change: string) => <Change>{change}</Change>,
              narrow: ["left"],
            },*/
              {
                key: "balance",
                title: (
                  <TooltipIcon content={Tooltip.My.Balance}>
                    Balance
                  </TooltipIcon>
                ),
                align: "left",
                render: (value) => formatAssetAmount(value, UST),
              },
              {
                key: "value",
                title: (
                  <TooltipIcon content={Tooltip.My.Value}>Value</TooltipIcon>
                ),
                render: (value) => <>{`${commas(formatAsset(multiple(decimal(div(value,SMALLEST),2),SMALLEST), UST))} ${UST}`} </>,
              },
              /*{
              key: "ratio",
              dataIndex: "value",
              title: (
                <TooltipIcon content={Tooltip.My.PortfolioRatio}>
                  Port. Ratio
                </TooltipIcon>
              ),
              render: (value) => percent(div(value, totalValue)),
              align: "right",
            },*/
              {
                key: "actions",
                dataIndex: "token",
                render: (token) => {
                  const to = {
                    pathname: getPath(MenuKey.SWAP),
                    state: { token },
                  }

                  const list = [
                    { to: { ...to, hash: Type.SWAP }, children: Type.SWAP },
                  ]

                  return <DashboardActions list={list} />
                },
                align: "right",
                fixed: "right",
              },
            ]}
            dataSource={dataSource.sort((a,b)=>gt(a.balance, b.balance) ? -1 : 1)}
            placeholder={!dataExists && (<p className={styles.description + " " + styles.holdingtext}>
                {MESSAGE.MyPage.Empty.Holdings}
                <a
                    onClick={() => {
                        openTransak()
                    }}
                    className={styles.tranLink}
                >
                    credit card here
                </a>
            </p>)}
          />
        }
      </Card>
    </Grid>
  )
}

export default Holdings
