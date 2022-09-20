import Holdings from "../Holdings"
import {bound} from "../../../components/Boundary"
import Placeholder from "./Placeholder"
//import useMyHoldings from "../../My/useMyHoldings"
import TablePlaceholder from "../../My/TablePlaceholder" 
const MyHoldingList = () => {
    // const  {dataSource}  = useMyHoldings()
    // const tableLen = dataSource.length
    return (

        bound( <Holdings />, <TablePlaceholder tableLength={18}></TablePlaceholder>)
        // bound( <Holdings />, <Placeholder title={'Holdings'} />)
    )
}

export default MyHoldingList
