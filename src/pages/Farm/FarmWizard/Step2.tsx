import styles from "./Step2.module.scss"
import {Type} from "../../PoolDynamic"
import Card from "../../../components/Card"
import FarmWizardStep2Form from "../../../forms/Farm/FarmWizardStep2Form"
import Steps from "../../../components/Static/Steps"
import {useContractsList} from "../../../data/contract/normalize"
import {CONTRACT} from "../../../hooks/useTradeAssets"
import Header from "./Header";
import { FarmContractTYpe } from "../../../data/farming/FarmV2"

const Step2 = ({lp, farmType, ticker}:{lp:string, farmType: FarmContractTYpe, ticker?: string}) => {
    const { contents: findPair } = useContractsList()
    const pair = findPair?.find((list: CONTRACT) => list.lp === lp)?.pair ?? ''
    
    return (<article className={styles.component}>
        <Card className={styles.container}>
            <Header current={'2'} />
            <div className={styles.content}>
                <Steps current={'2'}/>
                <div className={styles.form}>
                    <h1>Unfarm, Unpool and claim TX Fee rewards</h1>
                        <p className={styles.pool}>{ticker ? 'Pool: '+ ticker : ''}</p>
                    <FarmWizardStep2Form farmType={farmType} pairProp={pair} type={Type.WITHDRAW} lpToken={lp} farmResponseFun={() => {
                    }}/>
                </div>
            </div>
        </Card>
    </article>)
}

export default Step2
