import Connect from "../../layouts/Connect"
import MyPoolList from "./MyPoolList"
import useAddress from "../../hooks/useAddress"

const Pool = ({
  version,
  responseFun,
  showTable = true,
}: {
  version?: string | number
  responseFun?: any
  showTable?: boolean
}) => {
  const address = useAddress()

  return (
    <>
      {showTable &&
        (!address ? (
          <Connect />
        ) : (
          <MyPoolList responseFun={responseFun} version={version} />
        ))}
    </>
  )
}

export default Pool
