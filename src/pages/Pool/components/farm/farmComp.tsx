import styles from "./farmComp.module.scss"
import classNames from "classnames"
import FarmStakeForm from "../../../../forms/Farm/FarmStakeForm"
import {Type as StakeType} from "../../../Stake"
import Modal from "../../../../components/Modal"
import {useState} from "react"
import {FarmContractTYpe} from "../../../../data/farming/FarmV2"

const FromComp = ({ isFarmed, item, farmResponseFun }) => {

  const [isOpenModal, setIsOpenModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [tokenForm, setTokenForm] = useState("")
  const farmType = FarmContractTYpe.Farm4

  const closeModal = () => {
    setIsOpenModal(!isOpenModal)
  }
  const openModal = (lp: string) => {
    lp && setTokenForm(lp)
    lp && setIsOpenModal(true)
    lp && setModalTitle("Farm LP")
  }

  return (
    <div>
      {!isFarmed ? (
        <div className={styles.noFarm}>
          <span>No Farm</span>
        </div>
      ) : (
        <div className={classNames(styles.component, styles.addFarmBtn)} onClick={()=> openModal(item?.lpToken)}>
            <span className={styles.addToFarm}>Add to Farm</span>
          <span className={styles.Apy}>+{item?.APY}% APY</span>
        </div>
      )}
      <Modal isOpen={isOpenModal} className={styles.modal} title={modalTitle} onClose={closeModal}>
        <FarmStakeForm
            type={StakeType.STAKE}
            token={tokenForm}
            lpToken={item.lpToken}
            farmResponseFun={farmResponseFun?.responseFun}
            partial
            key={StakeType.STAKE}
            farmContractType={farmType}/>

      </Modal>
    </div>
  )
}

export default FromComp
