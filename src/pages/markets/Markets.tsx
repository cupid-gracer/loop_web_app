import { Component } from "react"
import { Table, Grid, Image, Button } from "semantic-ui-react"
import * as api from "./Api"
import styles from "./Markets.module.scss"
import ClipLoader from "react-spinners/ClipLoader"
import { css } from "@emotion/react"
import search_icon from '../../images/icons/search_icon.svg'
import { commas } from "../../libs/parse"

import LineChart from './charts/lineChart'

declare const window: any;

export interface MyProps {
  tokenAction?: any
}

interface MyState {
  showForm: boolean
  tokenData: Array<any>
  color: string
  loading: boolean
  totalMarket: number
  totalPrice: number
  search: any,
  activeMenuItem: string
}

class Markets extends Component<MyProps, MyState> {
  constructor(props) {
    super(props)
    this.state = {
      showForm: false,
      tokenData: [],
      color: "#FFFFFF",
      loading: true,
      totalMarket: 0,
      totalPrice: 0,
      search: '',
      activeMenuItem: 'Top Tokens (Loop)'
      
    }
    const {
      children,
      to,
      badges,
      className,
      lg,
      full,
      shadow,
      hasForm,
      mainSectionClass,
      headerClass,
    } = props
  }

  componentDidMount() {
    api.fetchTokenData().then((marketData) => {
      let { totalMarket } = this.state
      marketData?.map((data) => {
        data.market_cap > 0 && this.setState({ totalMarket: totalMarket += parseInt(data.market_cap) })
      })
      marketData?.sort((a, b) => b.market_cap - a.market_cap)
      this.setState({ tokenData: marketData })
    })
  }

  render() {
    const { tokenData, search } = this.state
    const {tokenAction} = this.props;
    const override = css`
      display: block;
      margin: 0 auto;
      border-color: white;
    `

    function numFormatter(labelValue) {
      // Nine Zeroes for Billions
      return Math.abs(Number(labelValue)) >= 1.0e12
        ? (Math.abs(Number(labelValue)) / 1.0e12).toFixed(2) + "T"
        : 
        Math.abs(Number(labelValue)) >= 1.0e9
        ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
        : // Six Zeroes for Millions
        Math.abs(Number(labelValue)) >= 1.0e6
        ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
        : // Three Zeroes for Thousands
        Math.abs(Number(labelValue)) >= 1.0e3
        ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
        : Math.abs(Number(labelValue))
    }

    const changeCapOrder = () => {
      let data = [...tokenData]
      data.reverse()
      this.setState({ tokenData: data })
    }

    const changePriceOrder = () => {
      let data = [...tokenData]
      data?.sort(
        (a, b) =>
          parseInt(a.price.split("$")[1]) - parseInt(b.price.split("$")[1])
      )
      if (tokenData[1].price == data[1].price) {
        data?.sort(
          (a, b) =>
            parseInt(b.price.split("$")[1]) - parseInt(a.price.split("$")[1])
        )
      }
      this.setState({ tokenData: data })
    }

    const changeHourOrder = () => {
      let data = [...tokenData]
      data?.sort((a, b) => a.hour - b.hour)
      if (tokenData[1].hour == data[1].hour) {
        data?.sort((a, b) => b.hour - a.hour)
      }
      this.setState({ tokenData: data })
    }

    const changeDayOrder = () => {
      let data = [...tokenData]
      data?.sort((a, b) => b.day - a.day)
      if (tokenData[1].day == data[1].day) {
        data?.sort((a, b) => a.day - b.day)
      }
      this.setState({ tokenData: data })
    }

    const changeWeekOrder = () => {
      let data = [...tokenData]
      data?.sort((a, b) => a.week - b.week)
      if (tokenData[1].week == data[1].week) {
        data?.sort((a, b) => b.week - a.week)
      }
      this.setState({ tokenData: data })
    }

    const changeMonthOrder = () => {
      let data = [...tokenData]
      data?.sort((a, b) => a.month - b.month)
      if (tokenData[1].month == data[1].month) {
        data?.sort((a, b) => b.month - a.month)
      }
      this.setState({ tokenData: data })
    }

    const handleDataLayer=(symbol:string, category:string)=>{
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
      'event':`market_token_${symbol}`,
      'event_category':'click',
      'event_action':`market_token_${symbol}`
      });
      window.open(`https://www.loop.markets/category/${category}`, '_blank');
    }

    const updateSearch = (event) => {
      this.setState({ search: event.target.value.substr(0, 20) });
    }

    const sortedMarketData = tokenData.filter(
      (token) => {
        return token?.symbal.toLowerCase().indexOf(search.toLowerCase()) !== -1;
      }
    )

    const symbols = {
      "KUJI": "KUJI"
    }

    const formatSymbol = (symbol: string) => {
      return symbols[symbol.toUpperCase()] ? symbols[symbol.toUpperCase()] : symbol
    }

    const HeaderSortMenu = () => {
      const {activeMenuItem} = this.state;
      const sortItems = [{name:'Top Tokens (Loop)'},{name:'Top Gainers (All)'},{name:'Top Volume (All)'}];
      return (
        <>
          {sortItems.map(({ name }, index) => (
            <span
              key={index}
              className={activeMenuItem == name ? styles.active : ""}
              onClick={() => {
                this.setState({activeMenuItem:name})
                index == 0 && changeDayOrder()
                index == 1 && changeDayOrder()
                index == 2 && changeDayOrder()
              }}
            >
              {name}
            </span>
            )
          )}
        </>
      )
    }

    return (
      <>
        <Grid className={styles.marketTable}>
          <div className={styles.marketHeader}>
            <div className={styles.marketHeader_left}>
              <h3>Today's Prices by Market Cap</h3>
              <span className={styles.sub}>
                The Total Terra Market Cap is $
                {numFormatter(this.state.totalMarket)} as of today.
              </span>
            </div>
            {/* <div className={styles.marketHeader_right}>
              <HeaderSortMenu />
            </div> */}
            {/* Search */}
            <div className={styles.marketHeader_right_search}>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search"
                autoComplete="off"
                onChange={updateSearch.bind(this)} value={this.state.search} 
              />
              <Image src={search_icon} size="tiny" className={styles.search_icon} />
            </div>
          </div>
          {/* <a className={styles.marketTrade} href="/swap">
            Trade Assets (DEX)
          </a> */}
          {/*
          <Link to="/swap" className={styles.marketTrade}>
            Trade Assets (DEX)
          </Link>
          */}

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Cell width="3">Name (Ticker)</Table.Cell>
                <Table.Cell width="2" onClick={changePriceOrder}> Price </Table.Cell>

                <Table.Cell width="1" onClick={changeHourOrder}> 1hr </Table.Cell>
                <Table.Cell width="1" onClick={changeDayOrder}> 24hr </Table.Cell>
                <Table.Cell width="1" onClick={changeWeekOrder}> 7d </Table.Cell>
                <Table.Cell width="1" onClick={changeMonthOrder}> 30d </Table.Cell>

                <Table.Cell width="4"> Circulating Supply </Table.Cell>
                <Table.Cell width="4" onClick={changeCapOrder}>  Mkt. Cap </Table.Cell>

                <Table.Cell width="4"> Last 7 Days </Table.Cell>
                <Table.Cell />
                {/*
                <Table.Cell width="4" onClick={changeCapOrder}> Last 7 Days </Table.Cell>
                <Table.Cell width="4"> Last 7 Days </Table.Cell>
                <Table.Cell width="2">Socials</Table.Cell>
                <Table.Cell width="4"></Table.Cell>
                 */}
                {/* <Table.Cell width="2">Exchange</Table.Cell> */}
              </Table.Row>
            </Table.Header>
            {tokenData ? (
              <Table.Body>
                {sortedMarketData.map((data) => {
                  // Return the element. Also pass key
                  return (
                    <Table.Row className={styles.portfoliotablerow} onClick={() => tokenAction(data?.symbal)}>
                      <Table.Cell>
                        <div className={styles.icontable}>
                          <Image
                            style={{ width: "30px", borderRadius: "25px" }}
                            src={data?.icon}
                            alt=""
                          />
                          <p style={{ display: "block" }}>
                            {data.name} <small style={{ color:'#919191' }}>({formatSymbol(data?.symbal)})</small>
                            {data?.category && (
                              <Button
                                fluid
                                className={styles.learn_btn}
                                content="Learn More"
                                onClick={()=>handleDataLayer(data?.symbal, data.category)}
                              />
                              )}
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell>{data?.price ? '$'+commas(data?.price) : "?"}</Table.Cell>

                      <Table.Cell>
                        {data?.hour > -0.01 ? (
                            <span className="marketUp">{data?.hour}%</span>
                          ) : (
                            <span className="marketDown">{data?.hour}%</span>
                          )
                        }
                      </Table.Cell>
                      <Table.Cell>
                        {data?.day ? (
                          data?.day > -0.01 ? (
                            <span className="marketUp">{data?.day}%</span>
                          ) : (
                            <span className="marketDown">{data?.day}%</span>
                          )
                        ) : (
                          "?"
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {data?.week ? (
                          data?.week > -0.01 ? (
                            <span className="marketUp">{data?.week}%</span>
                          ) : (
                            <span className="marketDown">{data?.week}%</span>
                          )
                        ) : (
                          "?"
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {data?.month ? (
                          data?.month > -0.01 ? (
                            <span className="marketUp">{data?.month}%</span>
                          ) : (
                            <span className="marketDown">{data?.month}%</span>
                          )
                        ) : (
                          "?"
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        {data?.circulating_supply
                          ? commas(data?.circulating_supply)
                          : "?"}
                          <span style={{fontSize: '12px', display: 'block', padding:'0', color: 'rgb(145, 145, 145)'}}>{data?.circulating_supply && formatSymbol(data?.symbal)}</span>
                      </Table.Cell>
                      
                      <Table.Cell>
                        ${data?.market_cap
                          ? commas(data?.market_cap)
                          : "?"}
                      </Table.Cell>


                      <Table.Cell style={{width: '160px', maxWidth: '300px', height: '48px'}}>
                        {data?.pair && (
                          <LineChart pair={data.pair} id={data.id} symbol={data.symbal} />
                        )}
                      </Table.Cell>


                      <Table.Cell />
                      
                      
                      {/* 
                      <Table.Cell>
                        {data?.category ? (
                          <a href={`https://www.loop.markets/category/${data?.category}`} target="_blank">
                            <Button
                              fluid
                              className={styles.btn}
                              content={<Image src={search_icon} />}
                              onClick={()=>handleDataLayer(data?.symbal)}
                            />
                          </a>
                        ) : (
                          <a hidden={data?.website == '#'} href={`${data?.website}`} target="_blank">
                            <Button
                              fluid
                              className={styles.btn}
                              content={<Image src={search_icon} />}
                              onClick={()=>handleDataLayer(data?.symbal)}
                            />
                          </a>
                        )}
                      </Table.Cell>
                      */}
                    </Table.Row>
                  )
                })}
              </Table.Body>
            ) : (
              <div className={styles.marketLoader}>
                <ClipLoader
                  color={this.state.color}
                  loading={this.state.loading}
                  css={override}
                  size={50}
                />
              </div>  
            )}
          </Table>
        </Grid>
        <div className={styles.mobile_main}>
          <div className={styles.cz_tokens_mobile_header}>
            <div className={styles.marketHeader}>
              <div className={styles.marketHeader_left}>
                <h3>Today's Cryptocurrency Prices by Market Cap</h3>
                <span className={styles.sub}>
                  The Total Terra Market Cap is $
                  {numFormatter(this.state.totalMarket)} as of today.
                </span>
              </div>
              {/* Search */}
              <div className={styles.marketHeader_right_search}>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Search"
                  autoComplete="off"
                  onChange={updateSearch.bind(this)} value={this.state.search} 
                />
                <Image src={search_icon} size="tiny" className={styles.search_icon} />
              </div>
            </div>
          </div>
          <div className={styles.cz_tokens_mobile}>
            <Table>
              <Table.Header className={styles.mobile_header_table}>
                <Table.Row>
                  <Table.Cell width="10">Token / mkt. Cap.</Table.Cell>
                  <Table.Cell width="3" onClick={changeDayOrder}> Price/24h Chg. </Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedMarketData.map((data) => {
                  // Return the element. Also pass key
                  return (
                    <Table.Row width={10} className={styles.portfoliotablerow} onClick={() => tokenAction(data?.symbal)}>
                      <Table.Cell width={10}>
                        <div className={styles.icontable} style={{ display: "flex" }}>
                          <div style={{ width: "50px" }}>
                            <Image
                              style={{ width: "50px", borderRadius: "25px", padding: "10px" }}
                              src={data?.icon}
                              alt=""
                            />
                          </div>
                          <span className={styles.token_name}>
                            {data.name}
                            <small className={styles.token_symbol}>({formatSymbol(data?.symbal)})</small>
                            <br />
                            <small>
                              Cap. {data?.market_cap
                              ? `$${data?.market_cap
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                              : "?"}
                            </small>
                            <br />
                            <small>
                             {data?.category && (
                                <Button
                                  fluid
                                  className={styles.btn}
                                  content="Learn More"
                                  onClick={()=>handleDataLayer(data?.symbal, data.category)}
                                />
                              )}
                            </small>
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className={styles.price}>
                        <p>{data?.price ? data?.price : "?"}</p>
                        <p>
                          {data?.day ? (
                            data?.day > -0.01 ? (
                              <span className="marketUp">{data?.day}%</span>
                            ) : (
                              <span className="marketDown">{data?.day}%</span>
                            )
                          ) : (
                            "?"
                          )}
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        </div>
      </>
    )
  }
}
export default Markets
