import { useRef, useState, useEffect } from "react"
import { plus, minus, div, gt, lt } from "../libs/math"
import { format, lookupSymbol } from "../libs/parse"
import classnames from "classnames"
import styles from "./Count.module.scss"

const FPS = 15
const INTERVAL = 1000 / FPS
const DURATION = 300

const Count = ({ children: target = "0", ...props }: CountOptions) => {
  const { symbol, className, symbolClass, priceClass, ...config } = props
  const prevRef = useRef<string>(target)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const [count, setCount] = useState(false)
  const [current, setCurrent] = useState<string>(target)

  useEffect(() => {
    setCount(true)
  }, [target])

  useEffect(() => {
    const change = () => {
      const timeoutID = setTimeout(() => {
        const delta = minus(target, prevRef.current)
        const next = plus(current, div(delta, div(DURATION, INTERVAL)))

        if (gt(delta, 0) ? lt(next, target) : gt(next, target)) {
          setCurrent(next)
        } else {
          setCount(false)
          setCurrent(target)
          prevRef.current = target
        }
      }, INTERVAL)

      timeoutRef.current = timeoutID
    }

    count && change()
    return () => clearTimeout(timeoutRef.current!)
  }, [count, current, target])

  return (
    <div className={classnames(className)}>
      {props.plus && gt(current, 0) && "+"}
      <span className={classnames(styles.price, priceClass)}>
        {props.format?.(current) ?? format(current, symbol, config)}
      </span>
      <span className={classnames(styles.symbol, symbolClass)}>
        {symbol ? ` ${lookupSymbol(symbol)}` : ""}
      </span>
    </div>
  )
}

export default Count
