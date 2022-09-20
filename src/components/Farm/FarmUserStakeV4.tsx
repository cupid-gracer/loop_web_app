import { TxResult } from "@terra-money/wallet-provider"
import { useEffect, useState } from "react"
import classnames from "classnames"
import Loader from "react-loader-spinner"

import styles from "./FarmUserStakeV4.module.scss"
import Card from "../Card"
import Grid from "../Grid"
import Button from "../Button"
import Modal from "../Modal"
import { DATASOURCE } from "../../pages/Farm/TopFarming"
import FarmStakeForm from "../../forms/Farm/FarmStakeForm"
import { Type as StakeType } from "../../pages/Stake"
import { PostError } from "../../forms/FormContainer"
import { gt, gte, number } from "../../libs/math"
import { commas, decimal } from "../../libs/parse"
import {
  useLockTimeFrameForAutoCompound,
  useUnstakeTimoutFarm2,
} from "../../graphql/queries/Farm/useUnstakedTimeout"
import { FarmType } from "../../pages/FarmBeta"
import Boundary, { bound } from "../Boundary"
import {
  FarmContractTYpe,
  useFindUsersStakedTimeFarm2,
} from "../../data/farming/FarmV2"
import { getICon2 } from "../../routes"
import LoadingPlaceholder from "../Static/LoadingPlaceholder"
import plus_btn_icon from "../../images/plus.svg"
import minus_btn_icon from "../../images/minus.svg"
import plus_icon from "../../images/icons/24 expand plus.svg"
import collapsed from "../../images/icons/24-expand minus.svg"
import AutoCompoundBtn from "./AutoCompoundBtn"
import { useGetUserAutoCompoundSubriptionFarm4 } from "../../data/contract/migrate"
import { useRewardNextPayoutFarm2 } from "../../graphql/queries/Farm/useRewardNextPayout"
import { TooltipIcon } from "../Tooltip"
import harvest_icon from "../../images/icons/harvest2.svg"
import HarvestButton from "./HarvestButton"

interface Props {
  farmResponseFun: (
    res: TxResult | undefined,
    errors: PostError | undefined,
    type?: string
  ) => void
  dataSource: DATASOURCE
  hidden?: boolean
  type: StakeType
  pageName?: FarmType
  farmContractType: FarmContractTYpe
}

const FarmUserStakeV4 = ({
  type,
  dataSource,
  farmResponseFun,
  pageName,
  farmContractType,
  hidden = true,
}: Props) => {
  const [token, setToken] = useState("")
  const [lpToken, setLpToken] = useState("")
  const [expand, setExpand] = useState(false)
  const [symbol, setSymbol] = useState("")
  const [isOpenStakeModal, setIsOpenStakeModal] = useState(false)
  const [stakeDefaultType, setStakeDefaultType] = useState(StakeType.STAKE)

  useEffect(() => {
    if (dataSource) {
      !token && setToken(dataSource?.token)
      !token && setSymbol(dataSource?.symbol)
      !token && setLpToken(dataSource?.lpToken)
    }
  }, [dataSource, token])

  // get reward for claimable by LpToken
  // const userClaimable = useRewardByDistributionToken(lpToken ?? "")

  // const parsePrice = (price: string, def: string) =>
  //   price !== undefined ? commas(decimal(price, 4)) : def

  const modalTitle = {
    [StakeType.STAKE]: "Farm LP",
    [StakeType.UNSTAKE]: "Unfarm LP",
  }[stakeDefaultType]

  const openStakeModal = (type: StakeType): any => {
    setIsOpenStakeModal(!isOpenStakeModal)
    setStakeDefaultType(type)
  }

  const closeStakeModal = () => {
    setIsOpenStakeModal(!isOpenStakeModal)
  }
  const collapsedIcon = (
    <img
      src={expand ? collapsed : plus_icon}
      alt={expand ? "-" : "+"}
      className={styles.expand_icon}
      onClick={() => setExpand(!expand)}
    />
  )
  const { contents: findAutoCompundStatus } =
    useGetUserAutoCompoundSubriptionFarm4(farmContractType)
  const disabled = findAutoCompundStatus[lpToken] ?? false

  const { formatTime, timeString, timeLeft } = useRewardNextPayoutFarm2(
    farmContractType,
    lpToken
  )
  const findUserStakedTimeFn = useFindUsersStakedTimeFarm2(farmContractType)
  const {
    timeLeft: timeLeftUnstake,
    timeString: timeStringUnstake,
    shortTimeStringFarm2
  } = useUnstakeTimoutFarm2(
    findUserStakedTimeFn?.(lpToken),
    farmContractType,
    lpToken
  )
  // const { shortDayString, shortMonthsString, shortFormatTime } = unStakeTimeLeft

  const {
    timeLeft: timeLeftUnstakeCompound,
    timeString: timeStringUnstakeCompound,
    shortTimeString
  } = useLockTimeFrameForAutoCompound(
    findUserStakedTimeFn?.(lpToken),
    farmContractType
  )
  const nextRewardTimer = timeLeft && timeString.length > 0 ? (
      <span className={styles.payoutSection}>
                          {timeString && gt(number(timeLeft), "0") && (
                              <span>next reward:</span>
                          )}
        {formatTime && gt(number(timeLeft), "0")
            ? ` ${formatTime}`
            : ""}
                        </span>
  ) : (
      <span>(Few days left)</span>
  )

  // const { shortDayString: shortDayStringComp, shortMonthsString: shortMonthsStringComp, shortFormatTime: shortFormatTimeComp } = shortTime
  // @ts-ignore
  return (
    <div>
      <Card
        className={classnames(styles.container, expand ? "" : styles.slim)}
        mainSectionClass={styles.main}
      >
        <Grid
          className={styles.stake_container}
          onClick={() => setExpand(!expand)}
        >
          <Grid className={classnames(styles.cell, styles.mobile_cell)}>
            <Grid className={classnames(styles.selection, styles.symbol_title)}>
              <div className={styles.icontable}>
                <div className={styles.icontableHub}>
                  {symbol.split("-")[0] && (
                    <img
                      style={{ width: "25px", borderRadius: "25px" }}
                      src={getICon2(symbol.split("-")[0].trim().toUpperCase())}
                      alt=" "
                    />
                  )}
                  {symbol.split("-")[1] && (
                    <img
                      style={{ width: "25px", borderRadius: "25px" }}
                      src={getICon2(symbol.split("-")[1].trim().toUpperCase())}
                      alt=" "
                    />
                  )}
                </div>
                <p style={{ display: "block" }} className={styles.symbol}>
                  {symbol}
                </p>
              </div>
            </Grid>
            <Grid
              className={classnames(
                expand ? styles.expanded : styles.closed,
                styles.stake_btn
              )}
            >
              <div
                className={classnames(styles.grid, styles.comboBtnContainer)}
              >
                <Button
                  disabled={hidden}
                  className={classnames(styles.stake_unstake_btn, styles.smBtn)}
                  onClick={() =>
                    hidden ? {} : openStakeModal(StakeType.STAKE)
                  }
                >
                  <img src={plus_btn_icon} height={"20px"} alt={"+"} />
                </Button>
                <Button
                  className={classnames(styles.stake_unstake_btn, styles.smBtn)}
                  onClick={() => openStakeModal(StakeType.UNSTAKE)}
                >
                  <img src={minus_btn_icon} height={"20px"} alt={"-"} />
                </Button>
                <HarvestButton
                  classname={classnames(
                    styles.stake_unstake_btn,
                    styles.harvestBtn,
                    styles.disabled
                  )}
                  shortTimeString={shortTimeString}    
                  icon={harvest_icon}
                  lpToken={lpToken}
                  farmContractType={farmContractType}
                  farmResponseFun={farmResponseFun}
                />
                
              </div>
              <div
                className={classnames(styles.grid, styles.comboBtnContainer)}
              >
                <AutoCompoundBtn
                  lp={lpToken}
                  farmContractType={farmContractType}
                  farmResponseFun={farmResponseFun}
                />
              </div>
            </Grid>
            <Grid className={styles.collapsed_mobile_icon}>
              {collapsedIcon}
            </Grid>
          </Grid>
          <Grid className={styles.cell}>

              <Grid className={styles.row}>
                <div className={styles.content}>
                  <h3 className={styles.title}>APY</h3>
                  <h2 className={styles.greenColor}>
                    {bound(
                      `${
                        gte(dataSource.all_apr ?? "0", "5000")
                          ? `${dataSource.all_apr}+`
                          : dataSource.all_apr
                      }%`,
                      <LoadingPlaceholder size={"sm"} color={"black"} />
                    )}
                  </h2>
                  { expand && gt(dataSource?.estAPYInUst, "0") && <p className={styles.sm}>Est. {commas(decimal(dataSource?.estAPYInUst, 2))} UST per year</p> }
                </div>
              </Grid>

            <Grid
              className={classnames(expand ? styles.expanded : styles.closed)}
            >
              <div className={styles.content}>
                <TooltipIcon content="Your TX fee profit from the pool, converted to UST. This does not include your farm profits too. Farm profits are included in Total Value.">
                  <h2 className={styles.title}>Tx Fees</h2>
                </TooltipIcon>
                <h2 className={styles.white}>
                  TBD
                {/*  {bound(
                    `$${commas(dataSource.tx_fee)}`,
                    <LoadingPlaceholder size={"sm"} color={"black"} />
                  )}*/}
                </h2>
              </div>
            </Grid>
          </Grid>
          <Grid className={classnames(styles.cell, styles.maxCell)}>
            <Grid className={styles.row}>
              <div className={styles.content}>
                <h3 className={styles.title}>Next Rewards</h3>
                <h2>
                  {bound(
                    dataSource?.rewards_betaFn(expand),
                    <LoadingPlaceholder size={"sm"} color={"black"} />
                  )}
                </h2>
                <small  className={classnames(expand ? styles.expanded : styles.closed, styles.title,  styles.estimatedDet)}>*your estimated rewards over the next hour</small>
              </div>
            </Grid>
            {/* <Grid  className={styles.row}>
              <div  className={styles.content}>
                <h3>Total Locked</h3>
                <h2>{bound(<Price price={dataSource && dataSource.staked  ? parsePrice(dataSource.staked, '0') ?? "0" : "0"} symbol={'LP'} classNames={styles.value} />, <LoadingPlaceholder size={'sm'} color={'black'} />)}</h2>
              </div>
            </Grid> */}

            {/*<Grid className={classnames(expand ? styles.expanded : styles.closed)}>
              <div  className={styles.content}>
                <h3>LP vs HODL APY</h3>
                <h2><Price price={dataSource && dataSource.apr ? `+${parsePrice(dataSource.apr, '0')}%` ?? "0%" : "0%"} classnames={styles.value} /></h2>
              </div>
            </Grid>*/}

            <Grid
              className={classnames(expand ? styles.expanded : styles.closed)}
            >
              <div className={styles.content}>
                <TooltipIcon content="This new exciting metric is coming soon.">
                  <h2 className={styles.title}>LP vs HODL APY</h2>
                </TooltipIcon>
                <h2 className={styles.white}>
                  TBD
                </h2>
              </div>
            </Grid>
          </Grid>
          <Grid className={styles.cell}>
            <Grid className={styles.row}>
              <Grid className={classnames(styles.row,styles.expanded)}>
                <div className={classnames(styles.content,styles.title)}>
                  <h3>Rewards</h3>
                  <Boundary
                    fallback={
                      <div className="dashboardLoader">
                        <Loader
                          type="Oval"
                          color="white"
                          height={50}
                          width={50}
                        />
                      </div>
                    }
                  >
                    { dataSource?.receivedRewards.find(({rewards_info})=> rewards_info.length > 0) ? <h2>{dataSource?.rewards}</h2> : <h2>{nextRewardTimer}</h2>}

                  </Boundary>
                  { dataSource?.receivedRewards.find(({rewards_info})=> rewards_info.length > 0) ?  <Grid className={classnames(styles.payoutContainer, expand ? '' : styles.closed)}>
                    {bound(
                        nextRewardTimer,
                        <LoadingPlaceholder size={"sm"} color={"black"}/>
                    )}
                  </Grid> : <></>
                  }
                </div>
              </Grid>
            </Grid>
            <Grid className={expand ? styles.expanded : styles.closed}>
              <Grid className={classnames(styles.expanded)}>
                <div className={styles.content}>
                  <h3 className={styles.title}>Percentage of Pool</h3>
                  <h2 className={styles.white}>{decimal(dataSource?.staked_percentage, 2)}<span className={styles.whiteSm}>%</span></h2>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid className={styles.cell}>
            <Grid className={styles.row}>
              <div className={styles.content}>
                <h3 className={styles.title}>Total Value</h3>
                <h2>
                  {bound(
                    dataSource.call_user_liquidityFn(expand),
                    <LoadingPlaceholder size={"sm"} color={"black"} />
                  )}
                </h2>
              </div>
            </Grid>
            {disabled
              ? timeLeftUnstakeCompound &&
                timeStringUnstakeCompound.length > 0 &&
                gt(timeLeftUnstakeCompound, "0") && (
                  <Grid className={expand ? styles.expanded : styles.closed}>
                    <div className={classnames(styles.title,styles.content)}>
                      <h3>Min. Farm Period (compounding)</h3>
                      <h2>
                        {bound(
                          timeLeftUnstakeCompound &&
                            timeStringUnstakeCompound.length > 0 ? (
                            <span className={classnames(styles.timeLeftSection, styles.white)}>
                              {/*<b className={styles.pinkColor}>{shortMonthsStringComp}</b><b>{shortMonthsStringComp && "M "}</b> <b className={styles.pinkColor}>{shortDayStringComp}</b><b>{shortDayStringComp && "D "} </b><b className={styles.pinkColor}>{shortFormatTimeComp}</b><b>m</b>*/}
                              <b className={styles.pinkColor}><b className={styles.pinkColor}>{shortTimeString}</b></b>
                              {/*{formatTimeUnstakeCompound &&*/}
                              {/*gt(number(timeLeftUnstakeCompound), "0")*/}
                              {/*  ? `${formatTimeUnstakeCompound}`*/}
                              {/*  : ""}*/}
                            </span>
                          ) : (
                            <span>(Few days left)</span>
                          ),
                          <LoadingPlaceholder size={"sm"} color={"black"} />
                        )}
                      </h2>
                    </div>
                  </Grid>
                )
              : timeLeftUnstake &&
                timeStringUnstake.length > 0 &&
                gt(timeLeftUnstake, "0") && (
                  <Grid className={expand ? styles.expanded : styles.closed}>
                    <div className={classnames(styles.content,styles.title)}>
                      <h3>Min. Farm Period</h3>
                      <h2>
                        {bound(
                          timeLeftUnstake && timeStringUnstake.length > 0 ? (
                            <span className={classnames(styles.timer)}>
                              {/*<b className={styles.pinkColor}>{shortMonthsString}</b><b>{shortMonthsString && "M"}</b><b className={styles.pinkColor}>{shortDayString}</b><b>{shortDayString && "D "} </b><b className={styles.pinkColor}>{shortFormatTime}</b><i>m</i>*/}
                              <b className={styles.pinkColor}>{shortTimeStringFarm2}</b>
                            </span>
                          ) : (
                            <span>(Few days left)</span>
                          ),
                          <LoadingPlaceholder size={"sm"} color={"black"} />
                        )}
                      </h2>
                    </div>
                  </Grid>
                )}
          </Grid>
          <Grid className={styles.cell}>
            <Grid className={styles.collapsedIcon}>{collapsedIcon}</Grid>
          </Grid>
        </Grid>
      </Card>
      <Modal
        isOpen={isOpenStakeModal}
        title={modalTitle}
        onClose={closeStakeModal}
      >
        {stakeDefaultType && lpToken && token && (
          <FarmStakeForm
            type={stakeDefaultType}
            token={token}
            lpToken={lpToken}
            farmResponseFun={farmResponseFun}
            partial
            key={type}
            pageName={pageName}
            isOpen={isOpenStakeModal}
            farmContractType={farmContractType}
          />
        )}
      </Modal>
    </div>
  )
}

export default FarmUserStakeV4
