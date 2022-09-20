import {useEffect, useState} from "react"
import {TxResult} from "@terra-money/wallet-provider"

import {div, gt, lte, multiple, number} from "../../libs/math"
import {LP, SMALLEST, UST} from "../../constants"
import {decimal, lookup, toAmount} from "../../libs/parse"
import {placeholder, step, validate as v,} from "../../libs/formHelpers"
import FormGroup from "../../components/FormGroup"
import useForm from "../../libs/useForm"
import {Type} from "../../pages/Stake"
import {PostError} from "../FormContainer"
import {useLpTokenBalancesQuery,} from "../../data/contract/normalize"
import {useFindDevTokensByLp, useFindUsersStakedTime,} from "../../data/farming/stakeUnstake"
import styles from "../../pages/LoopStake.module.scss"
import useUnstakedTimeout, {
  useLockTimeFrameForAutoCompound,
  useUnstakeTimoutFarm2
} from "../../graphql/queries/Farm/useUnstakedTimeout"
import {useFindTokenDetails} from "../../data/form/select"
import {useFindStakedByUserFarmQuery} from "../../data/contract/farming"
import useNewContractMsg from "../../terra/useNewContractMsg"
import useFarmStakeReceipt from "../receipts/useFarmStakeReceipt"
import {FarmType, useFarmPage} from "../../pages/FarmBeta"
import {
  FarmContractTYpe,
  useFindDevTokensByLpFarm2,
  useFindStakedByUserFarmQueryFarm2,
  useFindUsersStakedTimeFarm2,
  useLpTokenBalancesV2Query
} from "../../data/farming/FarmV2"
import {useTokenMethods} from "../../data/contract/info"
import {useProtocol} from "../../data/contract/protocol"
import {
  devTokenBalanceQuery,
  useFindStakedByUserFarmQueryFarm4,
  useGetUserAutoCompoundSubriptionFarm4
} from "../../data/contract/migrate"
import {useRecoilValue} from "recoil";
import MiniFormContainer from "../MInFormContainer"
import classNames from "classnames"
import classnames from "classnames"
import useFee from "../../graphql/useFee"
import {insertIf} from "../../libs/utils"
import {useHistory} from "react-router-dom";
import {getPath, MenuKey} from "../../routes";
import FormFeedback from "../../components/FormFeedback";

enum Key {
  value = "value",
}

interface Props {
  type: Type
  token: string
  lpToken: string
  tab?: Tab
  /** Gov stake */
  gov?: boolean
  farmResponseFun?: (
    res: TxResult | undefined,
    errors: PostError | undefined,
    type?: string
  ) => void
  partial?: boolean
  pageName?: FarmType
  isOpen?: boolean
  farmContractType: FarmContractTYpe
}

/**
 * @Instructions-for-unstake
 *
 * @step1: send query with lpToken, you will get a tempToken
 * @step2: send another query for staked balance(max) with temp-token
 * @step3: send balance and temp-token in contract for unstake
 * @note: show staked value to user but send devToken value in contract
 */

const FarmStakeForm = ({
  type,
  token,
  tab,
  gov,
  farmResponseFun,
  partial,
  lpToken: outerLpToken,
                         farmContractType,
  pageName,
                         isOpen
}: Props) => {
  const farmPage = useFarmPage(pageName)

  /* context */
  const { contracts, whitelist } = useProtocol()
  const { getSymbol } = useTokenMethods()

  // const findUserStakedTimeFn = useRecoilValue(findUserStakedTime)
  const findUserStakedTimeFn = useFindUsersStakedTime()
  const findUserStakedTimeFarm2Fn = useFindUsersStakedTimeFarm2(farmContractType)
  const findTokenDetailFn = useFindTokenDetails()

  const { lpToken } = whitelist[token] ?? {}

  const [agree, setAgree] = useState(false)
  const [enableCompound, setEnableCompound] = useState(true)

  // const findDevTokenFn = useRecoilValue(findDevTokensByLp)
  const findDevTokenFn = useFindDevTokensByLp()
  const FindDevTokensByLpFarm2 = useFindDevTokensByLpFarm2(farmContractType)
  const devToken = findDevTokenFn?.(lpToken ?? outerLpToken ?? "")
  const devTokenFarm2 = FindDevTokensByLpFarm2?.(lpToken ?? outerLpToken ?? "")

  const balanceQuery = useRecoilValue(devTokenBalanceQuery({ devToken : devToken ?? ""}))
  const balanceFarm2Query = useRecoilValue(devTokenBalanceQuery({ devToken : devTokenFarm2 ?? ""}))

  const { contents: findBalances } = useLpTokenBalancesV2Query()
  const findFarmLPBalance = (token: string) => findBalances[token]

  const balance = balanceQuery?.balance ?? "0"
  const balanceFarm2 = farmContractType === FarmContractTYpe.Farm4 ? findFarmLPBalance?.(token) ?? "0" : balanceFarm2Query?.balance ?? "0"

  const findStakedByUserFarm = useFindStakedByUserFarmQuery()
  const findStakedByUserFarm2 = useFindStakedByUserFarmQueryFarm2(farmContractType)
  const findStakedByUserFarm4Fn = useFindStakedByUserFarmQueryFarm4()
  const lpStaked = findStakedByUserFarm(lpToken ?? outerLpToken ?? "")
  const lpStakedv2 = farmContractType === FarmContractTYpe.Farm4 ? findStakedByUserFarm4Fn(lpToken ?? outerLpToken ?? "") ?? "0" : findStakedByUserFarm2(lpToken ?? outerLpToken ?? "") ?? "0"

  const stakedv2 = findUserStakedTimeFn?.(lpToken ?? outerLpToken ?? "")
  const { timeLeft, timeString, formatTime,unStakeTimeLeft } = useUnstakedTimeout(
      stakedv2
  )

  const { shortDayString, shortFormatTime} = unStakeTimeLeft
  const stakedv3 = findUserStakedTimeFarm2Fn?.(lpToken ?? outerLpToken ?? "")
  const { timeLeft: timeLeftv2, timeString: timeStringv2, unStakeTimeLeft: unStakeTimeLeftV2, timeArr } = useUnstakeTimoutFarm2(
      stakedv3, farmContractType, lpToken ?? outerLpToken ?? ""
  )

  const {
    timeLeft: timeLeftUnstakeCompound,
    timeString: timeStringUnstakeCompound,
      timeArr: compoundTimeArr
  } = useLockTimeFrameForAutoCompound(
      farmContractType === FarmContractTYpe.Farm4 ? findUserStakedTimeFarm2Fn?.(lpToken ?? outerLpToken ?? "") : findUserStakedTimeFn?.(lpToken ?? outerLpToken ?? ""),
      farmContractType
  )

  /* get lp balance */
  const { contents: lpTokenBalances } = useLpTokenBalancesQuery()
  const token1Value = farmContractType === FarmContractTYpe.Farm4 ? findFarmLPBalance(lpToken ?? outerLpToken ?? "") ?? "0" : lpTokenBalances[outerLpToken ?? lpToken] ?? "0"

  /* form:validate */
  const validate = ({ value }: Values<Key>) => {
    const symbol = getSymbol(token)
    return {
      [Key.value]: {
        [Type.STAKE]: v.amount(value, {
          symbol,
          max: div(token1Value, SMALLEST) ?? "0",
          min: "0",
        }),
        [Type.UNSTAKE]: v.required(value),
      }[type],
    }
  }

  /* form:hook */
  const initial = { [Key.value]: "" }
  const form = useForm<Key>(initial, validate)
  const { values, setValue, getFields, attrs, invalid } = form
  const { value } = values
  const amount = toAmount(value)
  const symbol = getSymbol(token)
  const pairSymbol = findTokenDetailFn?.(lpToken ?? outerLpToken, "lp")

  /* render:form */
  const max =
    outerLpToken !== undefined && type === Type.STAKE
      ? div(token1Value, SMALLEST) ?? "0"
      : "1"

  const fields = getFields({
    [Key.value]: {
      [Type.STAKE]: {
        label: "Amount",
        input: {
          type: "number",
          step: step(symbol),
          placeholder: placeholder(symbol),
          autoFocus: true,
          setValue: form.setValue,
          name: Key.value,
          decimal: 3,
        },
        className: styles.input,
        // help: {
        //   [Type.STAKE]: renderBalance(max, symbol),
        //   [Type.UNSTAKE]: renderBalance(div(farmPage === FarmType.farm ? balance : balanceFarm2, SMALLEST), symbol),
        // }[type],
        unit: pairSymbol ? `${pairSymbol.tokenSymbol} ${LP}` : LP,
        // max: gt(max, 0)
        //   ? () => setValue(Key.value, lookup(max, symbol))
        //     : undefined,
        // maxValue: gt(max, 0)
        //     ? () => lookup(max, symbol)
        //     : undefined,
        max: undefined,
        maxValue: undefined,
      },
      [Type.UNSTAKE]: {
        label: "Amount",
        input: {
          type: "number",
          step: step(symbol),
          placeholder: placeholder(symbol),
          autoFocus: true,
          setValue: form.setValue,
          name: Key.value,
          decimal: 3,
          disabled: true
        },
        className: styles.input,
        // max: gt(max, 0)
        //   ? () => setValue(Key.value, lookup(div(farmPage === FarmType.farm ? balance : balanceFarm2, SMALLEST), symbol))
        //   : undefined,
        // maxValue: gt(max, 0)
        //     ? () => lookup(div(farmPage === FarmType.farm ? balance : balanceFarm2, SMALLEST), symbol)
        //     : undefined,
            max: undefined,
        maxValue: undefined,
      },
    }[type],
  })

  useEffect(() => {
    if (type === Type.UNSTAKE) {
      
      // setValue(Key.value, decimal(div(farmPage === FarmType.farm ? balance : balanceFarm2, SMALLEST), 3))
      setValue(Key.value, decimal(div(farmPage === FarmType.farm ? lpStaked : lpStakedv2, SMALLEST), 4))
    }
  }, [type, lpToken, balance, balanceFarm2, isOpen])


  const contents = undefined

  /* submit */
  const newContractMsg = useNewContractMsg()
//   const unstakeData = type === Type.UNSTAKE ? gt(number(farmPage === FarmType.farm ? timeLeft : timeLeftv2), "0") ? { unstake_without_claim: {
//     pool_address: lpToken ?? outerLpToken ?? ""
// }} : { unstake_and_claim: {
//     pool_address: lpToken ?? outerLpToken ?? ""
//   }} : {}

const withoutClaim = (((timeLeft && gt(timeLeft, "0")) && timeString.length > 0) || ((timeLeftv2 && gt(timeLeftv2, "0")) && timeStringv2.length > 0))

  const data = {
    [Type.STAKE]: [
      newContractMsg(lpToken ?? outerLpToken ?? "", {
        send: {
          contract: farmPage === FarmType.farm ? contracts["loop_farm_staking"] : contracts[farmContractType],
          amount,
          msg: "eyJzdGFrZSI6e319", //{stake:{}}
        },
      }),
      ...insertIf(enableCompound && farmPage === FarmType.farm3 && lte(farmPage === FarmType.farm ? lpStaked : lpStakedv2, '0'),
        newContractMsg(contracts['loop_farm_staking_v4'] ?? "", {
          opt_for_auto_compound: {
            pool_address: lpToken ?? outerLpToken ?? "",
            opt_in: true,
          }
        }))
    ],
    [Type.UNSTAKE]: ((farmPage === FarmType.farm && devToken) || (farmPage != FarmType.farm && devTokenFarm2))
      ? [
          newContractMsg(farmPage === FarmType.farm ? devToken : devTokenFarm2, {
            send: {
              contract: farmPage === FarmType.farm ? contracts["loop_farm_staking"] : contracts[farmContractType],
              amount: farmPage === FarmType.farm ? lpStaked : lpStakedv2,
              msg: withoutClaim ? "eyJ1bnN0YWtlX3dpdGhvdXRfY2xhaW0iOnt9fQ==" : "eyJ1bnN0YWtlX2FuZF9jbGFpbSI6e319", //- {"unstake_without_claim":{}} {unstake_and_claim:{}}
            },
          })
        ]
      : [],
  }[type as Type]

  const messages = undefined

  const   disabled =
    invalid ||
    (type === Type.STAKE && !gt(token1Value, "0")) ||
    (type === Type.UNSTAKE && (farmPage != FarmType.farm3 && !gt(farmPage === FarmType.farm ? balance : balanceFarm2, "0"))) ||
    (type === Type.UNSTAKE && (farmPage === FarmType.farm && ((timeLeft && gt(timeLeft, "0")) && timeString.length > 0) && !agree)) ||
    (type === Type.UNSTAKE && (farmPage != FarmType.farm && ((timeLeftv2 && gt(timeLeftv2, "0")) && timeStringv2.length > 0) && !agree))

  /* result */
  const parseTx = useFarmStakeReceipt(type, !!gov)

  const msgInfo = {
    max: {
      [Type.STAKE]: multiple(max, SMALLEST),
      [Type.UNSTAKE]: multiple(value, SMALLEST),
    }[type],
    value: value,
    symbol: "LP",
  }

  const container = {
    label: type === Type.STAKE ? "Farm" : "Unfarm",
    tab,
    attrs,
    contents,
    messages,
    disabled,
    data,
    parseTx,
    msgInfo,
    partial,
  }

  const { amount: uusdFee } = useFee()

  const [sumbit, setSumbit] = useState(false)

  const MapTimeChar = (str: string | number) => {
    return `${str}`?.split('').map(s => <i>{s}</i>)
  }

  useEffect(()=>{
    type == Type.STAKE && setValue(Key.value, lookup(max, symbol))
  },[max, type])

  const farmResponse = (
      res: TxResult | undefined,
      error: PostError | undefined,
      types: string = "farm_stake"
  ) => {
    farmResponseFun(res, error, type === Type.STAKE ? 'farm_stake' : 'farm_unstake')
  }


  const { contents: findAutoCompundStatus } = useGetUserAutoCompoundSubriptionFarm4(farmContractType)
  const compounding = findAutoCompundStatus[lpToken ?? outerLpToken ?? ""] ?? false

  const history = useHistory()
  const resetFunc = () => {
    history.push({
      pathname: getPath(MenuKey.POOL_V2)
    })
  }
  return (
    <MiniFormContainer
      {...container}
      farmResponseFun={farmResponse}
      label={type}
      // extResponse={response}
      className={styles.mimiContainer}
      customActions={()=><></>}
      formSubmited={sumbit}
      resetFunc={type === Type.UNSTAKE && resetFunc}
    >
      <div className={styles.stakeModal}>
      {type === Type.STAKE  && (gt(farmPage === FarmType.farm ? lpStaked : lpStakedv2, '0') ? (
        farmContractType === FarmContractTYpe.Farm4 ? (<div className={styles.StakeMsg}>
          <>
            <p>
              The { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"} min farm period before you’re able to claim rewards will start again from now. Your previous rewards will remain in your position.
            </p>
            <p>You can still withdraw before the { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"} farm period is over without rewards.</p>
          </>
        </div>): (<div className={styles.StakeMsg}>
          <>
            <p>
              The 1 week min farm period before you’re able to claim rewards will start again from now. Your previous rewards will remain in your position.
            </p>
            <p>You can still withdraw before the 1 week farm period is over without rewards.</p>
          </>
        </div>)
      ) :  (
        <div className={styles.StakeMsg}>
          <>
            <p>
            Min { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"} farm period before you’re able to claim rewards. You can still withdraw before the { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"} farm period is over without rewards.
            </p>
          </>
        </div>
      ))}
      
      { type === Type.UNSTAKE   ? (((FarmType.farm === farmPage && ((timeLeft && gt(timeLeft, "0")) && timeString.length > 0)) || ([FarmType.farm2, FarmType.farm3].includes(farmPage) && ((timeLeftv2 && gt(timeLeftv2, "0")) && timeStringv2.length > 0)))) ? (
          compounding ? <div className={styles.StakeMsg}>
            <>
              <p>
                Your 3 month compounding period is not over. unfarm without rewards?
              </p>
            </>
          </div> : <div className={styles.StakeMsg}>
          <>
            <p>
            Your min { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"}  farming period is not over. Unfarm without rewards?
            </p>
          </>
        </div>
      ) : (
          farmContractType === FarmContractTYpe.Farm4 && <div className={styles.StakeMsg}>
            <>
              <p>
                Your min { farmContractType === FarmContractTYpe.Farm4 ? "24 hours" : "1 week"} farming period is over.Unfarm everything with rewards?
              </p>
              <p>Partial withdrawals will be supported in the future.</p>
            </>
          </div>
      ) : ""}

        {(type === Type.STAKE && (farmPage === FarmType.farm3) && lte(farmPage === FarmType.farm ? lpStaked : lpStakedv2, '0')) && (<div className={styles.compoundingContainer}>
          <label className={styles.checkbox}><input checked={enableCompound} onChange={()=> setEnableCompound(!enableCompound)} type="checkbox"/><span></span>
            
          <h3>Enable auto daily compounding. Min farming period 3 months.
            Can withdraw at any time, but all rewards are forfeited.</h3>
           </label>
        </div>)
      }

            {(type === Type.UNSTAKE && (( farmPage === FarmType.farm) ? (
                ((timeLeft && gt(timeLeft, "0")) && timeString.length > 0) && (<div className={styles.stakeModalMiddle}>
                      <b>Time left:</b>
                      <div>
                        <>
                          <b className={styles.pinkColor}>{shortDayString}</b><i>{shortDayString && "D"}</i><b className={styles.pinkColor}>{shortFormatTime}</b>
                        </>
                      </div>
                    </div>
                )
            ): (compounding ? (((timeLeftUnstakeCompound && gt(timeLeftUnstakeCompound, "0")) && timeStringUnstakeCompound.length > 0) && (<div className={classnames(styles.stakeModalMiddle, styles.stakeModalMiddle2)}>
              <b>Time left (compound):</b>
              <div >
                <span className={styles.pinkColor}>{MapTimeChar(compoundTimeArr['months'])}<i  className={styles.whiteTick}>M</i><span className={classNames(styles.pinkColor,styles.blueTick)}>{MapTimeChar(compoundTimeArr['days'])}<i  className={styles.whiteTick}>D</i></span><span  className={classNames(styles.pinkColor,styles.blueTick)}>{MapTimeChar(compoundTimeArr['hours'])}
                          <i className={styles.whiteTick}>:</i>{MapTimeChar(compoundTimeArr['minutes'])}<i className={styles.whiteTick}>:</i>{MapTimeChar(compoundTimeArr['seconds'])}</span></span>
              </div>
            </div>))
            : ((timeLeftv2 && gt(timeLeftv2, "0")) && timeStringv2.length > 0) && (<div className={styles.stakeModalMiddle}>
                    <b>Time left:</b>
                    <div >
                        <span className={styles.pinkColor}>{MapTimeChar(timeArr['days'])}<i  className={styles.whiteTick}>D</i><span  className={classNames(styles.pinkColor,styles.blueTick)}>{MapTimeChar(timeArr['hours'])}
                          <i className={styles.whiteTick}>:</i>{MapTimeChar(timeArr['minutes'])}<i className={styles.whiteTick}>:</i>{MapTimeChar(timeArr['seconds'])}</span></span>
                    </div>
                  </div>
              )
          ))
            )}


    {type === Type.UNSTAKE && ((FarmType.farm === farmPage && ((timeLeft && gt(timeLeft, "0")) && timeString.length > 0)) || ([FarmType.farm2, FarmType.farm3].includes(farmPage) && ((timeLeftv2 && gt(timeLeftv2, "0")) && timeStringv2.length > 0))) && (
        
        <label className={styles.checkBoxCheck}><input onChange={()=> setAgree(!agree)} type="checkbox"/><span></span>Yes, I'm sure I want to unfarm everything without rewards.</label>
      )}
        {(type === Type.UNSTAKE && !(timeString && gt(number(timeLeft), "0")) && farmContractType != FarmContractTYpe.Farm4) && (
            <FormFeedback notice>
              Are you sure you want to unstake your LP and rewards?
            </FormFeedback>
        )}

       <section>
        {
          type === Type.UNSTAKE && (
                <div className={styles.stakeModalInner}>
                  Tx Fee: <b className={classNames(styles.stakeMarginLeft, styles.fee)}>&#8776; {div(uusdFee, SMALLEST)}</b> {UST}{" "}
                </div>
            )
        }
        { type === Type.STAKE && (<>
          <div className={styles.balanceLine}>
            Balance: <b className={styles.stakeMarginLeft}>{lookup(max, symbol)}</b> LP{" "}
            
            <span
              onClick={() => setValue(Key.value, type == Type.STAKE ? lookup(max, symbol) : lookup(max, symbol))}
              className={styles.maxBtn}
          >
            MAX
          </span>
          
          </div>
          
        </>) }
        <div className={styles.stakeModalForm}>
          <div className={styles.stakeModalLeft}>
            <FormGroup {...fields[Key.value]} miniForm={true} />
           {/* <i>~0.000 UST</i>*/}
          </div>
          <div className={styles.stakeModalRightt}>
            <button className={styles.button} onClick={()=> type === Type.STAKE ? {} :  setSumbit(true)} type='submit' disabled={disabled} >{ type === Type.UNSTAKE ? 'UNFARM' : 'FARM' }</button>
          </div>
        </div>
      </section>
      </div>
    </MiniFormContainer>
  )
}

export default FarmStakeForm