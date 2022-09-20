import {useRecoilValue} from "recoil";
import {getDistributionWaitTimeQuery, getLockTimeFrameQuery} from "../../../data/farming/stakeUnstake";
import {useEffect, useState} from "react";
import {div, gt, lte, minus, multiple, number, plus} from "../../../libs/math";
import {intervalToDuration} from "date-fns";
import {
  FarmContractTYpe,
  getLockTimeFrameForAutoCompoundQuery,
  getLockTimeFrameQueryFarm2
} from "../../../data/farming/FarmV2";
import styles from "../../../pages/LoopStake.module.scss";

export default (stakedTime: string | undefined) => {
  const getLockTimeFrame = useRecoilValue(getLockTimeFrameQuery)

  const [timeString, setTimeString] = useState('')
  const [dayString, setDayString] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [shortTimeString, setShortTimeString] = useState('')
  const [shortMonthsString, setShortMonthsString] = useState('')
  const [shortDayString, setShortDayString] = useState('')

  const [currentTime, setTime] = useState(div(Date.now(), 1000));

  useEffect(() => {
    const interval = setInterval(() => setTime(div(Date.now(), 1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const shorts = {
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
  };

  useEffect(()=>{
    const remaningTime = minus(getLockTimeFrame ?? "0", minus(currentTime, stakedTime ?? "0"))
    setTimeLeft(number(remaningTime))
    const time = intervalToDuration({ start: 0, end: number(multiple(remaningTime, "1000")) });
    const timeArray = Object.keys(time).filter((item) => ['hours', 'minutes', 'seconds'].includes(item));
    setTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]} ${shorts[item]}` : `${time[item]} ${shorts[item] }`}`).join(' '))
    const days = time['days'];

    days !==undefined && setDayString(`${lte(days, 0) ? '' : ((lte(days, 9) ? `0${days} Days` : `${days} Days`))}  `)
    days && setShortDayString(`${lte(days, 9) ? `0${days}` : days}`)
    setShortTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]}` : `${time[item]}`}`).join(':'))
  },[stakedTime, currentTime])

  return {
    timeString,
    timeLeft,
    formatTime: `${dayString ? dayString : ""} ${timeString}`,
    unStakeTimeLeft: {
      shortFormatTime: `${shortTimeString}`,
      shortMonthsString,
      shortDayString
    }
  }
}


export const useUnstakeTimoutFarm2 = (stakedTime: string | undefined, type: FarmContractTYpe, lp: string | undefined) => {
  const getLockTimeFrame = useRecoilValue(getLockTimeFrameQueryFarm2(type))
  
  const [timeString, setTimeString] = useState('')
  const [dayString, setDayString] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [shortTimeString, setShortTimeString] = useState('')
  const [shortMonthsString, setShortMonthsString] = useState('')
  const [shortDayString, setShortDayString] = useState('')
  const [shortTime, setShortTime] = useState('')
  const [currentTime, setTime] = useState(div(Date.now(), 1000));
  const [shortMonth, setShortMonth] = useState('');
  const [timeArr, setTimeArr] = useState<any>({});

  useEffect(() => {
    const interval = setInterval(() => setTime(div(Date.now(), 1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const shorts = {
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
  };
  const shortsSm = {
    months: "M",
    days: "D",
    hours: "H",
    minutes: "M",
    seconds: "S",
  };

  useEffect(()=>{
    const remaningTime = minus(getLockTimeFrame ?? "0", minus(currentTime, stakedTime ?? "0"))
    setTimeLeft(number(remaningTime))
    const time = intervalToDuration({ start: 0, end: number(multiple(remaningTime, "1000")) });
    const timeArray = Object.keys(time).filter((item) => ['hours', 'minutes', 'seconds'].includes(item));
    setTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]} ${shorts[item]}` : `${time[item]} ${shorts[item] }`}`).join(' '))
    setShortTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]}` : `${time[item]}`}`).join(':'))
    setTimeArr(time)
    const days = time['days']
    const months = time['months']

    days !==undefined && setDayString(`${lte(days, 0) ? '' : ((lte(days, 9) ? `0${days} Days` : `${days} Days`))}  `)
    days && setShortDayString(`${lte(days, 9) ? `0${days}` : days}`)
    setShortMonth(`${months}`)

    setShortTime(timeArray.map((item)=> `${`${time[item]}${shortsSm[item] }`}`).join(' '))
  },[stakedTime, currentTime])

  return {
    timeString,
    timeLeft,
    formatTime: `${dayString ? dayString : ""} ${timeString}`,
    unStakeTimeLeft: {
      shortFormatTime: `${shortTimeString}`,
      shortMonthsString,
      shortDayString
    },
    shortTimeStringFarm2: `${gt(shortMonth, "0") ? shortMonth+'M' : ''} ${shortTime}`,
    timeArr
  }
}


export const useLockTimeFrameForAutoCompound = (stakedTime: string | undefined, type: FarmContractTYpe) => {
  const getLockTimeFrame = useRecoilValue(getLockTimeFrameForAutoCompoundQuery(type))

  const [timeString, setTimeString] = useState('')
  const [dayString, setDayString] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [shortTimeString, setShortTimeString] = useState('')
  const [shortMonthsString, setShortMonthsString] = useState('')
  const [shortDayString, setShortDayString] = useState('')
  const [shortTime, setShortTime] = useState('')
  const [currentTime, setTime] = useState(div(Date.now(), 1000));
  const [shortMonth, setShortMonth] = useState('');
  const [timeArr, setTimeArr] = useState<any>({});

  useEffect(() => {
    const interval = setInterval(() => setTime(div(Date.now(), 1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const shorts = {
    months: "Month",
    days: "Days",
    hours: "Hours",
    minutes: "Min",
    seconds: "Sec",
  };
  const shortsSm = {
    months: "M",
    days: "D",
    hours: "H",
    minutes: "M",
    seconds: "S",
  };

  useEffect(()=>{
    const remaningTime = minus(getLockTimeFrame ?? "0", minus(currentTime, stakedTime ?? "0"))
    setTimeLeft(number(remaningTime))
    const time = intervalToDuration({ start: 0, end: number(multiple(remaningTime, "1000")) });
    setTimeArr(time)
    const timeArray = Object.keys(time).filter((item) => ['days','hours', 'minutes', 'seconds'].includes(item));

    setTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]} ${shorts[item]}` : `${time[item]} ${shorts[item] }`}`).join(' '))
    setShortTime(timeArray.map((item)=> `${`${time[item]}${shortsSm[item] }`}`).join(' '))
    const days = time['months'];
    const daysSm = time['days'];

    days !==undefined && setDayString(`${lte(days, 0) ? '' : ((lte(days, 9) ? `0${days} Month` : `${days} Month`))}  `)
    days && setShortMonthsString(`${lte(days, 9) ? `0${days}` : days}`)
    days && setShortMonth(`${lte(days, 9) ? `${days}` : days}`)
    days && setShortDayString(`${lte(daysSm, 9) ? `${daysSm}` : daysSm}`)
    setShortTimeString(timeArray.map((item)=> `${lte(time[item], 9) ? `0${time[item]}` : `${time[item]}`}`).join(':'))
  },[stakedTime, currentTime])

  return {
    timeString,
    timeLeft,
    formatTime: `${dayString ? dayString : ""} ${timeString}`,
    shortTime: {
      shortFormatTime: `${shortTimeString}`,
      shortMonthsString,
      shortDayString
    },
    shortTimeString:  `${shortMonth ? shortMonth+'M' : ""} ${shortTime}`,
    timeArr
  }
}
