import { useRef, useState } from 'react';
import axios from 'axios';
import './index.css';
import { widget } from '../../charting_library';
import { useEffect } from 'react';
import { bound } from '../Boundary';
import Loading from '../Loading';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function TradingChart(props) {
	const pool = props.pool
	const token1 = props.token1
	const token2 = props.token2
	const removeBorderTop = props.removeBorderTop
	const [_quote, setQuote] = useState("")
	const [_pool, setPool] = useState("")

	const [currentTime, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);
	
	// static defaultProps = {
	// 	symbol: 'AAPL',
	// 	interval: 'D',
	// 	datafeedUrl: 'https://demo_feed.tradingview.com',
	// 	libraryPath: '/charting_library/',
	// 	chartsStorageUrl: 'https://saveload.tradingview.com',
	// 	chartsStorageApiVersion: '1.1',
	// 	clientId: 'tradingview.com',
	// 	userId: 'public_user_id',
	// 	fullscreen: false,
	// 	autosize: true,
	// 	studiesOverrides: {},
	// };
	const defaultProps = {
		symbol: 'LOOP/UST', // default symbol
		interval: '4H', // default interval
		container: 'tv_chart_container',
		datafeedUrl: "https://middlewareapi.loop.markets/v1/contracts",
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	// let _tvWidget = null;

	const [_tvWidget, setTvWidget] = useState(null)

	const _ref = useRef(null);

	useEffect(() => {
		if (!pool || pool === "UST") return;
		if (!token1 || !token2) return;
		let symbol, liquidity_pool, quote;

		axios.get(`https://middlewareapi.loop.markets/v1/contracts/pairDetail?pair1=${pool}`).then((res) => {//quote: token1, base: token2
			res = res.data[pool]
			if (
					(token1 !== 'uusd' && 
						(token1 && token1 === res.asset0.contractAddress || token2 && token2 === res.asset1.contractAddress)) || 
					(token2 !== 'uusd' &&
						(token2 && token2 === res.asset0.contractAddress || token1 && token1 === res.asset1.contractAddress))
				) {
				symbol = `${res.asset1.symbol}/${res.asset0.symbol}`;
				liquidity_pool = pool;
				// base = res.asset1.contractAddress;
				quote = res.asset1.contractAddress;
			} else {
				symbol = `${res.asset0.symbol}/${res.asset1.symbol}`;
				liquidity_pool = pool;
				// base = res.asset0.contractAddress;
				quote = res.asset0.contractAddress;
			}
			if (quote === _quote && pool === _pool) return
			setQuote(quote)
			setPool(pool)
			if (_tvWidget) {
				_tvWidget.remove();
				setTvWidget(null)
			}
			sessionStorage.setItem(symbol, JSON.stringify(
				{
					liquidity_pool: liquidity_pool,
					// base: base,
					quote: quote
				},
			));
			const widgetOptions = {
				symbol: symbol || defaultProps.symbol,
				// BEWARE: no trailing slash is expected in feed URL
				datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
				interval: defaultProps.interval,
				container: _ref.current,
				library_path: defaultProps.libraryPath,
	
				locale: getLanguageFromURL() || 'en',
				disabled_features: [
					'use_localstorage_for_settings',
					'header_symbol_search',
					'header_compare',
					'header_saveload',
					'timeframes_toolbar'
				],
				// enabled_features: ['study_templates'],
				charts_storage_url: defaultProps.chartsStorageUrl,
				charts_storage_api_version: defaultProps.chartsStorageApiVersion,
				client_id: defaultProps.clientId,
				user_id: defaultProps.userId,
				fullscreen: defaultProps.fullscreen,
				autosize: defaultProps.autosize,
				studies_overrides: defaultProps.studiesOverrides,
				theme: 'Dark',
				custom_css_url: '/styles/custom.css',
				autosize: true,
			};
	
			setTvWidget(new widget(widgetOptions))

			// _tvWidget.onChartReady(() => {
			// 	_tvWidget.headerReady().then(() => {
			// 		const simpleButton = _tvWidget.createButton();
			// 		simpleButton.classList.add('simple-btn');
			// 		simpleButton.addEventListener('click', () => {
			// 			console.log('simple')
			// 		});
			// 		simpleButton.innerHTML = 'SIMPLE';

			// 		const advancedButton = _tvWidget.createButton();
			// 		advancedButton.classList.add('advanced-btn');
			// 		advancedButton.addEventListener('click', () => {
			// 			console.log('advanced')
			// 		});
			// 		advancedButton.innerHTML = 'ADVANCED';
			// 	});
			// });
		}).catch((error) => {
			  if (error.response) {
				// Request made and server responded
				console.log(error.response.data);
				console.log(error.response.status);
				console.log(error.response.headers);
			  } else if (error.request) {
				// The request was made but no response was received
				console.log(error.request);
			  } else {
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message);
			  }
			setPool("");
		})

	}, [pool,currentTime])

	
	return (
		bound(<div
			ref={ _ref }
			className={`TVChartContainer ${removeBorderTop ? 'removeBorderTop' : ''}`}
		><div className="data"><Loading /></div></div>  , )
	);
}


export default TradingChart;
