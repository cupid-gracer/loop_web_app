import { styled } from '@material-ui/core'
import React from 'react'
import { useRecoilValue } from 'recoil'
import ClaimCommissionBtn from '../../components/ClaimCommissionBtn/ClaimCommissionBtn'
import Page from '../../components/Page'
import { factory2Pairs } from '../../data/API/dashboard'
import { div } from '../../libs/math'
import styles from './ClaimCommission.module.scss'

const ClaimCommission = () => {

    const allPairs=useRecoilValue(factory2Pairs)

    const noOfButtons=Math.ceil(Number(div(allPairs.length,"5")))
    const btnArray:any=[];
    for(let i=1;i<=noOfButtons;i++){
        btnArray.push(i)
    }


  return (
      <Page title={"claim-commission"}>
      <div className={styles.wrapper}>
      {
          btnArray.map((item)=>{
                return(
                    <ClaimCommissionBtn btnNumber={item}/>
                )
            })
        }
      </div>
      </Page>
  )
}

export default ClaimCommission