import MESSAGE from "../lang/MESSAGE.json"
import { useModal } from "../containers/Modal"
import ConnectButton from "../components/ConnectButton"
import Connected from "./Connected"
import ConnectListModal from "./ConnectListModal"
import useAddress from "../hooks/useAddress"
import Switch_Icon from "../images/Switch.svg";

const Connect = () => {
  const address = useAddress()
  const modal = useModal()

  const handleClick = () => modal.open()

  return !address ? (
    <>
      <ConnectButton onClick={handleClick}>
        {/* <img src={Switch_Icon} alt="switchIcon" /> */}
        {MESSAGE.Wallet.ConnectWallet}
      </ConnectButton>

      <ConnectListModal {...modal} />
    </>
  ) : (
    <Connected/>
  )
}

export default Connect
