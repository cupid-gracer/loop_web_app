import { Link } from "react-router-dom"

import {LP, SMALLEST, UST, UUSD} from "../../constants"
import MESSAGE from "../../lang/MESSAGE.json"
import Tooltip from "../../lang/Tooltip.json"
import {commas, decimal, lookupSymbol, LpBalanceFormatter} from "../../libs/parse"
import { getICon2, getPath, MenuKey } from "../../routes"
import Card from "../../components/Card"
import Table from "../../components/Table"
import { Di } from "../../components/Dl"
import { TooltipIcon } from "../../components/Tooltip"
import Delisted from "../../components/Delisted"
import DashboardActions from "../../components/DashboardActions"
import { Type } from "../PoolDynamic"
import styles from "./Holdings.module.scss"
import Price from "../../components/Price"
import {div, gt, multiple} from "../../libs/math"
import {bound} from "../../components/Boundary"
import LoadingPlaceholder from "../../components/Static/LoadingPlaceholder"
import useMyPool, { useMyPoolV2Provides } from "./useMyPool"
import {number } from "../../libs/math"

const Pool = () => {
    const { totalWithdrawableValue, dataSource } = useMyPool()

    const dataExists = !!dataSource.length
    const description = (dataExists && !isNaN(number(totalWithdrawableValue))) && (
        <Di
            title="Total Withdrawable Value"
            className={styles.withDrawableValue}
            content={
                <TooltipIcon content={Tooltip.My.TotalWithdrawableValue}>
                    <Price price={commas(decimal(totalWithdrawableValue ?? "0",2))} symbol={lookupSymbol(UUSD)} />
                </TooltipIcon>
            }
        />
    )

    return (
        <Card
            title={
                <TooltipIcon content={Tooltip.My.Pool}>
                    <b className={styles.poolToolTip}>Pool</b>
                </TooltipIcon>
            }
            description={bound(description)}
            headerClass={styles.header}
        >
            <Table
                columns={[
                    {
                        key: "symbol",
                        title: "Pool Name",
                        render: (symbol, { status }) => bound((
                            <>
                                {status === "DELISTED" && <Delisted />}
                                <div className={styles.icontable}>
                            <div className={styles.icontableHub}>
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol.split("-")[0].trim().toUpperCase())}
                                    alt=" "
                                />
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol.split("-")[1].trim().toUpperCase())}
                                    alt=" "
                                />
                            </div>
                            <p style={{ display: "block" }}>{symbol}</p>
                        </div>
                            </>
                        ), <LoadingPlaceholder size={'sm'} color={'black'} />),
                        bold: true,
                    },
                    {
                        key: "balance",
                        title: (
                            <TooltipIcon content={Tooltip.My.LP}>LP Balance</TooltipIcon>
                        ),
                        render: (value) => bound(LpBalanceFormatter(div(value,SMALLEST),LP) , <LoadingPlaceholder size={'sm'} color={'black'} />),
                    },
                    {
                        key: "withdrawable.text",
                        title: (
                            <TooltipIcon content={Tooltip.My.Withdrawable}>
                                Withdrawable Asset
                            </TooltipIcon>
                        ),
                        render: (value) => bound(value, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    },
                    {
                        key: "withdrawableValue",
                        title: "Withdrawable Value",
                        render: (value) => bound(`${commas(value)} ${UST}`, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    },
                    // {
                    //     key: "TxFee",
                    //     title: "Tx Fee return",
                    //     render: (value) => bound(`${commas(value)} ${UST}`, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    // },
                    {
                        key: "share",
                        title: (
                            <TooltipIcon content={Tooltip.My.PoolShare}>
                                Pool share
                            </TooltipIcon>
                        ),
                    },
                    {
                        key: "actions",
                        dataIndex: "pair",
                        render: (pair, { lpToken }) => {
                            const to = {
                                pathname: getPath(MenuKey.POOL),
                                state: { pair, lpToken },
                            }

                            const farmRoute = `${getPath(MenuKey.FARMBETA)}`

                            const list = [
                                {
                                    to: { ...to, hash: Type.PROVIDE },
                                    children: Type.PROVIDE,
                                },
                                {
                                    to: { ...to, hash: Type.WITHDRAW },
                                    children: Type.WITHDRAW,
                                },
                                {
                                    to: farmRoute,
                                    children: MenuKey.FARMBETA,
                                },
                            ]

                            return <DashboardActions list={list} />
                        },
                        align: "right",
                        fixed: "right",
                    },
                ]}
                dataSource={dataSource.filter((data) => gt(multiple(div(data?.balance,SMALLEST),'1000'),'1'))}
                placeholder={!dataExists && (<p className={styles.description + " " + styles.holdingtext}>
                    {MESSAGE.MyPage.Empty.Pool}
                    <Link to="/pool">
                        <a onClick={() => {}} className={styles.tranLink}>
                            here
                        </a>
                    </Link>
                </p>)}
            />
        </Card>
    )
}

export default Pool

export const PoolV2 = () => {
    const { totalWithdrawableValue, dataSource } = useMyPoolV2Provides()
    
    const dataExists = !!dataSource.length
    const description = (dataExists && !isNaN(number(totalWithdrawableValue))) && (
        <Di
            title="Total Withdrawable Value"
            className={styles.withDrawableValue}
            content={
                <TooltipIcon content={Tooltip.My.TotalWithdrawableValue}>
                    <Price price={commas(decimal(totalWithdrawableValue ?? "0",2))} symbol={lookupSymbol(UUSD)} />
                </TooltipIcon>
            }
        />
    )

    return (
        <Card
            title={
                <TooltipIcon content={Tooltip.My.Pool}>
                    <b className={styles.poolToolTip}>Pool V3</b>
                </TooltipIcon>
            }
            description={bound(description)}
            headerClass={styles.header}
        >
            <Table
                columns={[
                    {
                        key: "symbol",
                        title: "Pool Name",
                        render: (symbol, { status }) => bound((
                            <>
                                {status === "DELISTED" && <Delisted />}
                                <div className={styles.icontable}>
                            <div className={styles.icontableHub}>
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol.split("-")[0].trim().toUpperCase())}
                                    alt=" "
                                />
                                <img
                                    style={{ width: "30px", borderRadius: "25px" }}
                                    src={getICon2(symbol.split("-")[1].trim().toUpperCase())}
                                    alt=" "
                                />
                            </div>
                            <p style={{ display: "block" }}>{symbol}</p>
                        </div>
                            </>
                        ), <LoadingPlaceholder size={'sm'} color={'black'} />),
                        bold: true,
                    },
                    {
                        key: "balance",
                        title: (
                            <TooltipIcon content={Tooltip.My.LP}>LP Balance</TooltipIcon>
                        ),
                        render: (value) => bound(LpBalanceFormatter(div(value,SMALLEST),LP) , <LoadingPlaceholder size={'sm'} color={'black'} />),
                    },
                    {
                        key: "withdrawable.text",
                        title: (
                            <TooltipIcon content={Tooltip.My.Withdrawable}>
                                Withdrawable Asset
                            </TooltipIcon>
                        ),
                        render: (value) => bound(value, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    },
                    {
                        key: "withdrawableValue",
                        title: "Withdrawable Value",
                        render: (value) => bound(`${commas(value)} ${UST}`, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    },
                    // {
                    //     key: "TxFee",
                    //     title: "Tx Fee return",
                    //     render: (value) => bound(`${commas(value)} ${UST}`, <LoadingPlaceholder size={'sm'} color={'black'} />)
                    // },
                    {
                        key: "share",
                        title: (
                            <TooltipIcon content={Tooltip.My.PoolShare}>
                                Pool share
                            </TooltipIcon>
                        ),
                    },
                    {
                        key: "actions",
                        dataIndex: "pair",
                        render: (pair, { lpToken }) => {
                            const to = {
                                pathname: getPath(MenuKey.POOL_V2),
                                state: { pair, lpToken },
                            }

                            const farmRoute = `${getPath(MenuKey.FARMV3)}`

                            const list = [
                                {
                                    to: { ...to, hash: Type.PROVIDE },
                                    children: Type.PROVIDE,
                                },
                                {
                                    to: { ...to, hash: Type.WITHDRAW },
                                    children: Type.WITHDRAW,
                                },
                                {
                                    to: farmRoute,
                                    children: MenuKey.FARMV3,
                                },
                            ]

                            return <DashboardActions list={list} />
                            
                        },
                        align: "right",
                        fixed: "right",
                    },
                ]}
                dataSource={dataSource?.filter((data) => gt(multiple(div(data?.balance,SMALLEST),'1000'),'1'))}
                placeholder={!dataExists && (<p className={styles.description + " " + styles.holdingtext}>
                    New pools are coming soon!
                </p>)}
            />
        </Card>
    )
}
