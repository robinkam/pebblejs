/**
 * Created by neulion-qa on 15/5/17.
 */

var ajax = require('ajax');
var util2 = require('util2');
var StockModel = require('robinkam/chinastock/stock-model');
var IndexModel = require('robinkam/chinastock/index-model');
var InvalidModel = require('robinkam/chinastock/invalid-model');

var session = Pebble.getWatchToken()+"@"+Date.now();

var DataLoader = {};

DataLoader.loadStockData = function(stockCodeArray, successCallback, errorCallback){
	var requestUrl = 'http://hq.sinajs.cn/list=' + stockCodeArray.join(',');
	console.log('Request URL: ' + requestUrl);
	//var hq_str_[a-z]{2}[0-9]{6}=\".*\";/i; //用正则表达式匹配：var hq_str_sh600389="江山股份,15.31,15.74,15.68,16.02,15.16,15.68,15.69,4044916,62900903,3350,15.68,9700,15.60,1000,15.57,2384,15.56,2100,15.54,13100,15.69,73100,15.70,1000,15.72,4000,15.74,14200,15.75,2013-01-11,14:14:24,00";
	var getStockArrayFromRawData = function(data){
		var stockArray = [];
		for(var i=0; i<stockCodeArray.length; i++){
			var stockCode = stockCodeArray[i];
			if(stockCode.length==0)
				continue;

			var stockData;
			var re = new RegExp('.*'+stockCode+'=\"\";.*', 'gi');
			var lines = data.match(re);
			//console.log('invalidLine='+lines);
			if(lines && lines.length>0){
				stockData = new InvalidModel(stockCode);
			}else{
				re = new RegExp('.*'+stockCode+'.*', 'gi');
				lines = data.match(re);
				if(lines && lines.length>0){//found matched line in the results.
					if(stockCode.match(/s_[a-z]{2}[0-9]{6}/gi)){
						stockData = new IndexModel(lines[0]);
						stockData.indexCode = stockCode;
					}else{
						stockData = new StockModel(lines[0]);
						stockData.stockCode = stockCode;
					}
				}else{//did not find matched line in the results.
					stockData = new InvalidModel(stockCode);
				}
			}
			//console.log('Stock data is: ' + util2.toString(stockData));
			stockArray.push(stockData);
		}
		return stockArray;
	};

	ajax(
		{
			url: requestUrl
		},
		function(data, status, request) {
			//console.log('Response data is: ' + data);
			var stockArray = getStockArrayFromRawData(data);
			//DataLoader.trackEvent('loadStockDataSuccess', {stockCodeArray:stockCodeArray});
			successCallback(stockArray);
		},
		function(error, status, request) {
			console.log('The ajax request failed: ' + error);
			DataLoader.trackEvent('loadStockDataError', {stockCodeArray:stockCodeArray});
			errorCallback(error);
		}
	);
};

DataLoader.trackEvent = function (eventName, param) {
	var token = Pebble.getWatchToken();
	var watch = Pebble.getActiveWatchInfo ? Pebble.getActiveWatchInfo() : null;
	var client = {id:token, app_version:"0.8"};
	if(watch) {
		// Information is available!
		client.platform = watch.platform;
		client['device_model'] = watch.device_model;
		client['os_version'] = watch.firmware.major+'.'+watch.firmware.minor+'.'+watch.firmware.patch+'.'+watch.firmware.suffix;
	} else {
		// Not available, handle gracefully
		client.platform = 'unknown';
		client['device_model'] = 'unknown';
		client['os_version'] = 'unknown';
	}

	param = param || {};
	param.event = token;

	console.log("tracking "+eventName+" for WatchToken: "+token);

	var event = {
		"client": client,
		"session": {"id":session},
		"events": [
			{
				"event": eventName,
				"attributes": param
			}
		]
	};

	ajax(
		{
			url: "https://api.leancloud.cn/1.1/stats/open/collect",
			method: 'post',
			type: 'json',
			data: event,
			headers: {
				"Content-Type":"text/plain",
				"X-LC-Id": "vqqvc9itn9mc0tcyjpq1zmhmcgjk3e78sgeimo7gti1rzpvt",
				"X-LC-Key": "2vo6ysvzd37hlt79iymxy3v1qc0i4ua0norxpt52xqstaxir"
			}
		},
		function(data, status, request) {
			console.log('trackEvent succeeded');
		},
		function(error, status, request) {
			console.log('trackEvent failed: ' + JSON.stringify(error));
		}
	);
};

module.exports = DataLoader;
