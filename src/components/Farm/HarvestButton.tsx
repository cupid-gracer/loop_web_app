import { TxResult, useWallet } from "@terra-money/wallet-provider"
import classnames from "classnames"
import { Fee } from "@terra-money/terra.js"
import useFee from "../../graphql/useFee"

import styles from "./FarmUserStakeV4.module.scss"
import Button from "../Button"
import { FarmContractTYpe } from "../../data/farming/FarmV2"
import useNewContractMsg from "../../terra/useNewContractMsg"
import { plus } from "../../libs/math"
import { PostError } from "../../forms/FormContainer"
import { useProtocol } from "../../data/contract/protocol"
import { useGetUserAutoCompoundSubriptionFarm4 } from "../../data/contract/migrate"
import autoCompoundIcon from "../../images/icons/auto_compound.svg"
import Tooltip from "../../components/Tooltip"

interface Props {
  lpToken: string
  farmContractType: FarmContractTYpe
  farmResponseFun: (
    res: TxResult | undefined,
    errors: PostError | undefined,
    type?: string
  ) => void
  shortTimeString?: string
  icon?: string
  classname?: string
}

const HarvestButton = ({
  farmResponseFun,
  shortTimeString,
  farmContractType,
  icon,
  classname,
  lpToken,
}: Props) => {
  const newContractMsg = useNewContractMsg()
  const { contracts } = useProtocol()

  const msgs = [
    newContractMsg(contracts["loop_farm_staking_v4"], {
      claim_reward: {
        pool_address: lpToken ?? "",
      },
    }),
  ]

  const disabled = shortTimeString ? true : false

  /* submit */

  const fee = useFee()
  const { post } = useWallet()

  const submit = async () => {
    try {
      const { gasPrice } = fee
      const txOptions = {
        msgs,
        // fee: new Fee(gas, { uusd: plus(feeAmount, undefined) }),
        gasPrices: `${gasPrice}uusd`,
        purgeQueue: true,
      }

      const response = await post(txOptions)

      farmResponseFun(response, undefined, "harvest")
    } catch (error) {
      farmResponseFun(undefined, error)
    }
  }

  return (
    <Button
      className={classnames(
        styles.stake_unstake_btn,
        styles.harvestBtn,
        disabled ? styles.disabled : ""
      )}
      disabled={disabled}
      onClick={disabled ? () => {} : submit}
    >
      <img
        src={icon}
        className={classnames(styles.imgIcon)}
        height="20px"
        width="20px"
      />{" "}
      {" Harvest"}
    </Button>
  )
}

export default HarvestButton
