import StakeFarm2, { StakeFarmV3 } from "../StakeFarm2"
import {bound} from "../../../components/Boundary"
import Placeholder from "./Placeholder"

const MyFarmUserStakeList = () => {

    return (
        bound(<StakeFarm2 />, <Placeholder title={'Farm'} />)
    )
}

export default MyFarmUserStakeList

export const MyFarmV3UserStakeList = () => {

    return (
        bound(<StakeFarmV3 />, <Placeholder title={'Farm'} />)
    )
}
