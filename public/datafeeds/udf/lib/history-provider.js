import { getErrorMessage,
// UdfErrorResponse,
// UdfOkResponse,
// UdfResponse,
 } from './helpers';
export class HistoryProvider {
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
            this._requester.sendRequest(this._datafeedUrl, 'candleChartData', requestParams)
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
