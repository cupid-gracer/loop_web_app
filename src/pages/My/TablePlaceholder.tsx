import "./TablePlaceHolderLoading.scss"
import styles from "./TablePlaceholder.module.scss"
import classNames from "classnames"


const cx = classNames.bind(styles)

const TablePlaceholder = (props) => {
const tableLength = props.tableLength
  // return <div className={styles.wrapper}>
  return <div>
    
  <table className="skelton">
    <thead>
      <tr className="row">

      </tr>
    </thead>
    <tbody>
    <div
        className={styles.assetsContainer}
        // className={classNames(
        //   styles.assetsContainer,
        //   styles.assetsContainerLoading
        // )}
      >
        {Array.from(Array(tableLength), (e, i) => {
          return (
        <tr
            // className={styles.tr}
          >
      

        <div
          className={classNames(
            styles.valuesContainer,
            styles.valuesContainerChart
          )}
        >
          <span className={styles.itemWrapper}>
            {/* <span className="skeleton-box skeleton-box-title chartValueHolderMin"></span> */}
            <span className={styles.dflex}>
              <div className={styles.row}>
                {/* <span className="skeleton-box chartValueHolder chartValueHolderRight"></span> */}
                
            <td  className="skeleton-box skeleton-box-title chartValueHolder1"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder2"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder3"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder4"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder5"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder6"></td>
            <td  className="skeleton-box skeleton-box-title chartValueHolder7"></td>
              </div>
            </span>
          </span>



            </div>
            
        </tr>
        )
      })}
      </div>
    </tbody>
  </table>
  </div>
}

export default TablePlaceholder
