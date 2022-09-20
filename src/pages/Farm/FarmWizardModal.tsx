import {ReactChildren, useEffect, useState} from "react"
import Step1 from "./FarmWizard/Step1"
import Step2 from "./FarmWizard/Step2"
import Step3 from "./FarmWizard/Step3"
import Step4 from "./FarmWizard/Step4"
import {FarmContractTYpe} from "../../data/farming/FarmV2"
import { useStatsState, FarmMigrateProvider, useFarmMigrate } from "./FarmWizard/useFarmMigrate"

const queryString = require('query-string')

const Container =  (props) => {
    
    const { step } = useFarmMigrate()
    const [lp, setLp]  = useState('')
    // const [step, setStep]  = useState('')
    const [ticker, setTicker]  = useState('')
    const [farmType, setFarmType]  = useState<FarmContractTYpe>(FarmContractTYpe.Farm2)
    
    useEffect(()=>{
        const  query= queryString.parse(window.location.search);

        if (query.lp) {
            setLp(query.lp)
        }
        if (query.ticker) {
            setTicker(query.ticker)
        }
        if (query.ticker) {
            setFarmType(query.type)
        }
        if(query.step){
            // setStep(query.step)
            // const step  = query?.step?.replace(/step/g, "").trim()
            // const  q = {...query, step: step == '4' ? 'my' : `step${plus(step,"1")}`}
            // @ts-ignore
            // const params  = Object.keys(q).map((index) => `${index}=${q[index]}`).join('&')
        }
    },[window.location.search, queryString])

    return <>
    {
        step == '1' ? <Step2 ticker={ticker} farmType={farmType} lp={lp} /> : step == '2' ? <Step2 ticker={ticker} farmType={farmType} lp={lp} />  : step == '3' ? <Step3 ticker={ticker} /> : step == '4' ? <Step4 /> : null
    }
    </>
}

export function FarmWizardModal() {
    const farmMigrate = useStatsState()
    

    return (
    <>
        <FarmMigrateProvider value={farmMigrate}>
            <Container>
        </Container>
        </FarmMigrateProvider>
    </>
  )
}