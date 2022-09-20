import Pool, { PoolV2 } from "../Pool"
import {bound} from "../../../components/Boundary"
import Placeholder from "./Placeholder"

const MyPoolList = ({version = 1}:{version?: string | number }) => {

    return (
        bound(version ===1 ? <Pool /> : <PoolV2 />, <Placeholder title={'Pool'} />)
    )
}

export default MyPoolList
