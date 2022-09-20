import React from 'react';
import styles from './TxType.module.scss';
import BUY_icon from '../../../images/buy_icon.svg';
import SELL_icon from '../../../images/sell_icon.svg';



const TxType = ({item,currentItem}) => {
    const firstToken=currentItem.firstToken;
    const secondToken=currentItem.secondToken;
    const type=(item?.FromAsset===firstToken && item?.ToAsset==secondToken ) ? "Sell" : "Buy";

    return (
        <>
        { 
            type=='Buy' ?
            <div className={styles.dFlex}>
                <span className={styles.imageWrapper}>
                <img src={BUY_icon} alt="Buy" className={styles.icon}/>
                </span>
                <h3 className={styles.text1}>Buy</h3>
            </div>    
             : 
            <div className={styles.dFlex}>
                <span className={styles.imageWrapper}>
                <img src={SELL_icon} alt="Sell" className={styles.icon}/>
                </span>
                <h3 className={styles.text2}>Sell</h3>
            </div>

        }
        </>
  )
}

export default TxType