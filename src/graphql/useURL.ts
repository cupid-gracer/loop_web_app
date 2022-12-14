import useNetwork from "../hooks/useNetwork";


export default () => {
  const { lcd } = useNetwork()
  return (contract: string, msg: string | object) => {
    const query_msg =
        typeof msg === "string"
            ? toQueryMsg(msg)
            : encodeURIComponent(JSON.stringify(msg))
    return `${lcd}/wasm/contracts/${contract}/store?query_msg=${query_msg}`
  }
}

export const toQueryMsg = (msg: string) => {
  try {
    return JSON.stringify(JSON.parse(msg))
  } catch (error) {
    return ""
  }
}
