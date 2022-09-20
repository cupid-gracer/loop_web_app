(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Datafeeds = {}));
}(this, (function (exports) { 'use strict';

    /**
     * If you want to enable logs from datafeed set it to `true`
     */
    function logMessage(message) {
    }
    function getErrorMessage(error) {
        if (error === undefined) {
            return '';
        }
        else if (typeof error === 'string') {
            return error;
        }
        return error.message;
    }

    class HistoryProvider {
        constructor(datafeedUrl, requester) {
            this._datafeedUrl = datafeedUrl;
            this._requester = requester;
        }
        getBars(symbolInfo, resolution, periodParams) {
            const requestParams = {
                pairAddress: JSON.parse(sessionStorage.getItem(symbolInfo.name) || '').liquidity_pool,
                quoteAsset: JSON.parse(sessionStorage.getItem(symbolInfo.name) || '').quote,
                resolution: resolution,
                from: periodParams.from,
                to: periodParams.to,
                interval: _convertResolution(resolution),
            };
            // if (periodParams.countBack !== undefined) {
            // 	requestParams.countback = periodParams.countBack;
            // }
            // if (symbolInfo.currency_code !== undefined) {
            // 	requestParams.currencyCode = symbolInfo.currency_code;
            // }
            // if (symbolInfo.unit_id !== undefined) {
            // 	requestParams.unitId = symbolInfo.unit_id;
            // }
            return new Promise((resolve, reject) => {
                let _datafeedUrl, urlPath, params;
                if (!sessionStorage.getItem('isFetchedAdvancedTradingView')) {
                    _datafeedUrl = "https://middlewareapi.loop.markets/v1/contracts/chachedChartData";
                    urlPath = '';
                    params = undefined;
                    sessionStorage.setItem('isFetchedAdvancedTradingView', true)
                }
                else {
                    _datafeedUrl = this._datafeedUrl;
                    urlPath = 'candleChartData';
                    params = requestParams;
                }
                // this._requester.sendRequest<any[]>(this._datafeedUrl, 'candleChartData', requestParams)
                this._requester.sendRequest(_datafeedUrl, urlPath, params)
                    .then((response) => {
                    // if (response.s !== 'ok' && response.s !== 'no_data') {
                    // 	reject(response.errmsg);
                    // 	return;
                    // }
                    const bars = [];
                    const meta = {
                        noData: false,
                    };
                    // if (response.s === 'no_data') {
                    // 	meta.noData = true;
                    // 	meta.nextTime = response.nextTime;
                    // } else {
                    // 	const volumePresent = response.v !== undefined;
                    // 	const ohlPresent = response.o !== undefined;
                    // 	for (let i = 0; i < response.t.length; ++i) {
                    // 		const barValue: Bar = {
                    // 			time: response.t[i] * 1000,
                    // 			close: parseFloat(response.c[i]),
                    // 			open: parseFloat(response.c[i]),
                    // 			high: parseFloat(response.c[i]),
                    // 			low: parseFloat(response.c[i]),
                    // 		};
                    // 		if (ohlPresent) {
                    // 			barValue.open = parseFloat((response as HistoryFullDataResponse).o[i]);
                    // 			barValue.high = parseFloat((response as HistoryFullDataResponse).h[i]);
                    // 			barValue.low = parseFloat((response as HistoryFullDataResponse).l[i]);
                    // 		}
                    // 		if (volumePresent) {
                    // 			barValue.volume = parseFloat((response as HistoryFullDataResponse).v[i]);
                    // 		}
                    // 		bars.push(barValue);
                    // 	}
                    // }
                    if (!response.length) {
                        meta.noData = true;
                        meta.nextTime = periodParams.from;
                    }
                    else {
                        const volumePresent = response[0].volume !== undefined;
                        const ohlPresent = response[0].open !== undefined;
                        for (let i = 0; i < response.length; ++i) {
                            const barValue = {
                                time: response[i].time,
                                close: parseFloat(response[i].close),
                                open: parseFloat(response[i].close),
                                high: parseFloat(response[i].close),
                                low: parseFloat(response[i].close),
                            };
                            if (ohlPresent) {
                                barValue.open = parseFloat(response[i].open);
                                barValue.high = parseFloat(response[i].high);
                                barValue.low = parseFloat(response[i].low);
                            }
                            if (volumePresent) {
                                barValue.volume = parseFloat(response[i].volume);
                            }
                            bars.push(barValue);
                        }
                    }
                    resolve({
                        bars: bars,
                        meta: meta,
                    });
                })
                    .catch((reason) => {
                    const reasonString = getErrorMessage(reason);
                    // tslint:disable-next-line:no-console
                    console.warn(`HistoryProvider: getBars() failed, error=${reasonString}`);
                    reject(reasonString);
                });
            });
        }
    }
    function _convertResolution(resolution) {
        if (resolution.indexOf('D') !== -1)
            return resolution;
        if (resolution.indexOf('W') !== -1)
            return resolution;
        if (resolution.indexOf('M') !== -1)
            return resolution;
        if (parseInt(resolution) >= 60)
            return (parseInt(resolution) / 60).toFixed() + 'H';
        else
            return resolution + 'M';
    }

    class DataPulseProvider {
        constructor(historyProvider, updateFrequency) {
            this._subscribers = {};
            this._requestsPending = 0;
            this._historyProvider = historyProvider;
            setInterval(this._updateData.bind(this), updateFrequency);
        }
        subscribeBars(symbolInfo, resolution, newDataCallback, listenerGuid) {
            if (this._subscribers.hasOwnProperty(listenerGuid)) {
                return;
            }
            this._subscribers[listenerGuid] = {
                lastBarTime: null,
                listener: newDataCallback,
                resolution: resolution,
                symbolInfo: symbolInfo,
            };
            logMessage(`DataPulseProvider: subscribed for #${listenerGuid} - {${symbolInfo.name}, ${resolution}}`);
        }
        unsubscribeBars(listenerGuid) {
            delete this._subscribers[listenerGuid];
        }
        _updateData() {
            if (this._requestsPending > 0) {
                return;
            }
            this._requestsPending = 0;
            for (const listenerGuid in this._subscribers) { // tslint:disable-line:forin
                this._requestsPending += 1;
                this._updateDataForSubscriber(listenerGuid)
                    .then(() => {
                    this._requestsPending -= 1;
                    logMessage(`DataPulseProvider: data for #${listenerGuid} updated successfully, pending=${this._requestsPending}`);
                })
                    .catch((reason) => {
                    this._requestsPending -= 1;
                    logMessage(`DataPulseProvider: data for #${listenerGuid} updated with error=${getErrorMessage(reason)}, pending=${this._requestsPending}`);
                });
            }
        }
        _updateDataForSubscriber(listenerGuid) {
            const subscriptionRecord = this._subscribers[listenerGuid];
            const rangeEndTime = parseInt((Date.now() / 1000).toString());
            // BEWARE: please note we really need 2 bars, not the only last one
            // see the explanation below. `10` is the `large enough` value to work around holidays
            const rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 10);
            return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, {
                from: rangeStartTime,
                to: rangeEndTime,
                countBack: 2,
                firstDataRequest: false,
            })
                .then((result) => {
                this._onSubscriberDataReceived(listenerGuid, result);
            });
        }
        _onSubscriberDataReceived(listenerGuid, result) {
            // means the subscription was cancelled while waiting for data
            if (!this._subscribers.hasOwnProperty(listenerGuid)) {
                return;
            }
            const bars = result.bars;
            if (bars.length === 0) {
                return;
            }
            const lastBar = bars[bars.length - 1];
            const subscriptionRecord = this._subscribers[listenerGuid];
            if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
                return;
            }
            const isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
            // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
            // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
            if (isNewBar) {
                if (bars.length < 2) {
                    throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
                }
                const previousBar = bars[bars.length - 2];
                subscriptionRecord.listener(previousBar);
            }
            subscriptionRecord.lastBarTime = lastBar.time;
            subscriptionRecord.listener(lastBar);
        }
    }
    function periodLengthSeconds(resolution, requiredPeriodsCount) {
        let daysCount = 0;
        if (resolution === 'D' || resolution === '1D') {
            daysCount = requiredPeriodsCount;
        }
        else if (resolution === 'M' || resolution === '1M') {
            daysCount = 31 * requiredPeriodsCount;
        }
        else if (resolution === 'W' || resolution === '1W') {
            daysCount = 7 * requiredPeriodsCount;
        }
        else {
            daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
        }
        return daysCount * 24 * 60 * 60;
    }

    class QuotesPulseProvider {
        constructor(quotesProvider) {
            this._subscribers = {};
            this._requestsPending = 0;
            this._quotesProvider = quotesProvider;
            setInterval(this._updateQuotes.bind(this, 1 /* Fast */), 10000 /* Fast */);
            setInterval(this._updateQuotes.bind(this, 0 /* General */), 60000 /* General */);
        }
        subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
            this._subscribers[listenerGuid] = {
                symbols: symbols,
                fastSymbols: fastSymbols,
                listener: onRealtimeCallback,
            };
        }
        unsubscribeQuotes(listenerGuid) {
            delete this._subscribers[listenerGuid];
        }
        _updateQuotes(updateType) {
            if (this._requestsPending > 0) {
                return;
            }
            for (const listenerGuid in this._subscribers) { // tslint:disable-line:forin
                this._requestsPending++;
                const subscriptionRecord = this._subscribers[listenerGuid];
                this._quotesProvider.getQuotes(updateType === 1 /* Fast */ ? subscriptionRecord.fastSymbols : subscriptionRecord.symbols)
                    .then((data) => {
                    this._requestsPending--;
                    if (!this._subscribers.hasOwnProperty(listenerGuid)) {
                        return;
                    }
                    subscriptionRecord.listener(data);
                    logMessage(`QuotesPulseProvider: data for #${listenerGuid} (${updateType}) updated successfully, pending=${this._requestsPending}`);
                })
                    .catch((reason) => {
                    this._requestsPending--;
                    logMessage(`QuotesPulseProvider: data for #${listenerGuid} (${updateType}) updated with error=${getErrorMessage(reason)}, pending=${this._requestsPending}`);
                });
            }
        }
    }

    function extractField(data, field, arrayIndex) {
        const value = data[field];
        return Array.isArray(value) ? value[arrayIndex] : value;
    }
    /**
     * This class implements interaction with UDF-compatible datafeed.
     * See UDF protocol reference at https://github.com/tradingview/charting_library/wiki/UDF
     */
    class UDFCompatibleDatafeedBase {
        constructor(datafeedURL, quotesProvider, requester, updateFrequency = 10 * 1000) {
            this._configuration = defaultConfiguration();
            // private readonly _configurationReadyPromise: Promise<void>;
            this._symbolsStorage = null;
            this._datafeedURL = datafeedURL;
            this._requester = requester;
            this._historyProvider = new HistoryProvider(datafeedURL, this._requester);
            this._quotesProvider = quotesProvider;
            this._dataPulseProvider = new DataPulseProvider(this._historyProvider, updateFrequency);
            this._quotesPulseProvider = new QuotesPulseProvider(this._quotesProvider);
            // this._configurationReadyPromise = this._requestConfiguration()
            // 	.then((configuration: UdfCompatibleConfiguration | null) => {
            // 		if (configuration === null) {
            // 			configuration = defaultConfiguration();
            // 		}
            // 		this._setupWithConfiguration(configuration);
            // 	});
        }
        onReady(callback) {
            // this._configurationReadyPromise.then(() => {
            setTimeout(() => {
                callback(this._configuration);
            }, 10);
            // });
        }
        getQuotes(symbols, onDataCallback, onErrorCallback) {
            this._quotesProvider.getQuotes(symbols).then(onDataCallback).catch(onErrorCallback);
        }
        subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
            this._quotesPulseProvider.subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid);
        }
        unsubscribeQuotes(listenerGuid) {
            this._quotesPulseProvider.unsubscribeQuotes(listenerGuid);
        }
        getMarks(symbolInfo, from, to, onDataCallback, resolution) {
            if (!this._configuration.supports_marks) {
                return;
            }
            const requestParams = {
                symbol: symbolInfo.ticker || '',
                from: from,
                to: to,
                resolution: resolution,
            };
            this._send('marks', requestParams)
                .then((response) => {
                if (!Array.isArray(response)) {
                    const result = [];
                    for (let i = 0; i < response.id.length; ++i) {
                        result.push({
                            id: extractField(response, 'id', i),
                            time: extractField(response, 'time', i),
                            color: extractField(response, 'color', i),
                            text: extractField(response, 'text', i),
                            label: extractField(response, 'label', i),
                            labelFontColor: extractField(response, 'labelFontColor', i),
                            minSize: extractField(response, 'minSize', i),
                        });
                    }
                    response = result;
                }
                onDataCallback(response);
            })
                .catch((error) => {
                logMessage(`UdfCompatibleDatafeed: Request marks failed: ${getErrorMessage(error)}`);
                onDataCallback([]);
            });
        }
        getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
            if (!this._configuration.supports_timescale_marks) {
                return;
            }
            const requestParams = {
                symbol: symbolInfo.ticker || '',
                from: from,
                to: to,
                resolution: resolution,
            };
            this._send('timescale_marks', requestParams)
                .then((response) => {
                if (!Array.isArray(response)) {
                    const result = [];
                    for (let i = 0; i < response.id.length; ++i) {
                        result.push({
                            id: extractField(response, 'id', i),
                            time: extractField(response, 'time', i),
                            color: extractField(response, 'color', i),
                            label: extractField(response, 'label', i),
                            tooltip: extractField(response, 'tooltip', i),
                        });
                    }
                    response = result;
                }
                onDataCallback(response);
            })
                .catch((error) => {
                logMessage(`UdfCompatibleDatafeed: Request timescale marks failed: ${getErrorMessage(error)}`);
                onDataCallback([]);
            });
        }
        getServerTime(callback) {
            if (!this._configuration.supports_time) {
                return;
            }
            this._send('time')
                .then((response) => {
                const time = parseInt(response);
                if (!isNaN(time)) {
                    callback(time);
                }
            })
                .catch((error) => {
                logMessage(`UdfCompatibleDatafeed: Fail to load server time, error=${getErrorMessage(error)}`);
            });
        }
        searchSymbols(userInput, exchange, symbolType, onResult) {
            
            if (this._configuration.supports_search) {
                const params = {
                    limit: 30 /* SearchItemsLimit */,
                    query: userInput.toUpperCase(),
                    type: symbolType,
                    exchange: exchange,
                };
                this._send('search', params)
                    .then((response) => {
                    if (response.s !== undefined) {
                        logMessage(`UdfCompatibleDatafeed: search symbols error=${response.errmsg}`);
                        onResult([]);
                        return;
                    }
                    onResult(response);
                })
                    .catch((reason) => {
                    logMessage(`UdfCompatibleDatafeed: Search symbols for '${userInput}' failed. Error=${getErrorMessage(reason)}`);
                    onResult([]);
                });
            }
            else {
                if (this._symbolsStorage === null) {
                    throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
                }
                this._symbolsStorage.searchSymbols(userInput, exchange, symbolType, 30 /* SearchItemsLimit */)
                    .then(onResult)
                    .catch(onResult.bind(null, []));
            }
        }
        resolveSymbol(symbolName, onResolve, onError, extension) {
            const currencyCode = extension && extension.currencyCode;
            const unitId = extension && extension.unitId;
            function onResultReady(symbolInfo) {
                onResolve(symbolInfo);
            }
            if (!this._configuration.supports_group_request) {
                // const params: RequestParams = {
                // 	// symbol: symbolName,
                // 	pairs: window.localStorage.getItem(symbolName) || '',
                // };
                // if (currencyCode !== undefined) {
                // 	params.currencyCode = currencyCode;
                // }
                // if (unitId !== undefined) {
                // 	params.unitId = unitId;
                // }
                // this._send<ResolveSymbolResponse | UdfErrorResponse>('symbols', params)
                // 	.then((response: ResolveSymbolResponse | UdfErrorResponse) => {
                // 		if (response.s !== undefined) {
                // 			onError('unknown_symbol');
                // 		} else {
                // 			onResultReady(response);
                // 		}
                // 	})
                // 	.catch((reason?: string | Error) => {
                // 		logMessage(`UdfCompatibleDatafeed: Error resolving symbol: ${getErrorMessage(reason)}`);
                // 		onError('unknown_symbol');
                // 	});
                const returnData = {
                    name: symbolName,
                    full_name: symbolName,
                    description: '',
                    type: 'coin',
                    session: '24x7',
                    timezone: 'Etc/UTC',
                    exchange: '',
                    listed_exchange: '',
                    format: 'price',
                    pricescale: 10000,
                    minmov: 1,
                    supported_resolutions: [
                        '1',
                        '3',
                        '5',
                        '15',
                        '30',
                        '1H',
                        '4H',
                        '12H',
                        '1D',
                        '1W',
                        '1M',
                    ],
                    volume_precision: 2,
                    data_status: 'pulsed',
                    has_intraday: true,
                };
                setTimeout(() => {
                    onResultReady(returnData);
                }, 10);
            }
            else {
                if (this._symbolsStorage === null) {
                    throw new Error('UdfCompatibleDatafeed: inconsistent configuration (symbols storage)');
                }
                this._symbolsStorage.resolveSymbol(symbolName, currencyCode, unitId).then(onResultReady).catch(onError);
            }
        }
        getBars(symbolInfo, resolution, periodParams, onResult, onError) {
            this._historyProvider.getBars(symbolInfo, resolution, periodParams)
                .then((result) => {
                onResult(result.bars, result.meta);
            })
                .catch(onError);
        }
        subscribeBars(symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
            
            this._dataPulseProvider.subscribeBars(symbolInfo, resolution, onTick, listenerGuid);
        }
        unsubscribeBars(listenerGuid) {
            this._dataPulseProvider.unsubscribeBars(listenerGuid);
        }
        _requestConfiguration() {
            return this._send('config')
                .catch((reason) => {
                logMessage(`UdfCompatibleDatafeed: Cannot get datafeed configuration - use default, error=${getErrorMessage(reason)}`);
                return null;
            });
        }
        _send(urlPath, params) {
            return this._requester.sendRequest(this._datafeedURL, urlPath, params);
        }
    }
    function defaultConfiguration() {
        return {
            supports_search: false,
            supports_group_request: false,
            supported_resolutions: [
                '1',
                '3',
                '5',
                '15',
                '30',
                // '60' as ResolutionString,
                '1H',
                '4H',
                '12H',
                '1D',
                // '1W' as ResolutionString,
                // '1M' as ResolutionString,
            ],
            supports_marks: false,
            supports_timescale_marks: false,
        };
    }

    class QuotesProvider {
        constructor(datafeedUrl, requester) {
            this._datafeedUrl = datafeedUrl;
            this._requester = requester;
        }
        getQuotes(symbols) {
            return new Promise((resolve, reject) => {
                this._requester.sendRequest(this._datafeedUrl, 'quotes', { symbols: symbols })
                    .then((response) => {
                    if (response.s === 'ok') {
                        resolve(response.d);
                    }
                    else {
                        reject(response.errmsg);
                    }
                })
                    .catch((error) => {
                    const errorMessage = getErrorMessage(error);
                    reject(`network error: ${errorMessage}`);
                });
            });
        }
    }

    class Requester {
        constructor(headers) {
            if (headers) {
                this._headers = headers;
            }
        }
        sendRequest(datafeedUrl, urlPath, params) {
            if (params !== undefined) {
                const paramKeys = Object.keys(params);
                if (paramKeys.length !== 0) {
                    urlPath += '?';
                }
                urlPath += paramKeys.map((key) => {
                    return `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`;
                }).join('&');
            }
            // Send user cookies if the URL is on the same origin as the calling script.
            const options = { credentials: 'same-origin' };
            if (this._headers !== undefined) {
                options.headers = this._headers;
            }
            return fetch(`${datafeedUrl}/${urlPath}`, options)
                .then((response) => response.text())
                .then((responseTest) => JSON.parse(responseTest));
        }
    }

    class UDFCompatibleDatafeed extends UDFCompatibleDatafeedBase {
        constructor(datafeedURL, updateFrequency = 10 * 1000) {
            const requester = new Requester();
            const quotesProvider = new QuotesProvider(datafeedURL, requester);
            super(datafeedURL, quotesProvider, requester, updateFrequency);
        }
    }

    exports.UDFCompatibleDatafeed = UDFCompatibleDatafeed;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
