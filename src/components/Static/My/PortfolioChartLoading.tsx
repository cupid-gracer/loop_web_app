import './PortfolioAllAssetsLoading.scss'
import styles from '../../PortfolioAllAssets/PortFolioAllAssets.module.scss'
import classNames from "classnames"

const PortfolioChartLoading = () => {
  return (
    <div className='skelton'>
  <div className={classNames(styles.assetsContainer, styles.assetsContainerLoading)}>
      <div className={classNames(styles.imageWrapper, styles.imageWrapperChart)}>
      
        <span className="skeleton-box chartImage"></span>
        
      </div>
      <div className={classNames(styles.valuesContainer, styles.valuesContainerChart)}>
        <span className={styles.itemWrapper}>
        <span className="skeleton-box skeleton-box-title chartValueHolderMin"></span>
          <span className={styles.dflex}>
          
          <div className={styles.row}>
          <span className="skeleton-box chartValueHolder chartValueHolderRight"></span> 
          <span className="skeleton-box chartValueHolder"></span> 
          </div>
          </span>
        </span>

        <span className={styles.itemWrapper}>
        
          <span className={styles.dflex}>
          
          <div className={styles.row}>
          <span className="skeleton-box chartValueHolder chartValueHolderRight"></span> 
          <span className="skeleton-box chartValueHolder"></span> 
          </div>
          </span>
        </span>

        <span className={styles.itemWrapper}>
          <span className={styles.dflex}>
          <div className={styles.row}>
          <span className="skeleton-box chartValueHolder chartValueHolderRight"></span> 
          <span className="skeleton-box chartValueHolder"></span> 
          </div>
          </span>
        </span>
        <span className={styles.itemWrapper}>
          <span className={styles.dflex}>
          <div className={styles.row}>
          <span className="skeleton-box chartValueHolder chartValueHolderRight"></span> 
          <span className="skeleton-box chartValueHolder"></span> 
          </div>
          </span>
        </span>
      </div>
    </div>
    </div>
  )
}

export default PortfolioChartLoading
