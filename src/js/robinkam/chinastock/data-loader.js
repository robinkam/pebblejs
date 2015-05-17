/**
 * Created by neulion-qa on 15/5/17.
 */

var ajax = require('ajax');
var util2 = require('util2');
var StockModel = require('robinkam/chinastock/stock-model');

var DataLoader = {};

DataLoader.loadStockData = function(stockCodeArray, successCallback, errorCallback){
	var requestUrl = 'http://hq.sinajs.cn/list=' + stockCodeArray.join(',');
	console.log('Request URL: ' + requestUrl);
	//var hq_str_[a-z]{2}[0-9]{6}=\".*\";/i; //用正则表达式匹配：var hq_str_sh600389="江山股份,15.31,15.74,15.68,16.02,15.16,15.68,15.69,4044916,62900903,3350,15.68,9700,15.60,1000,15.57,2384,15.56,2100,15.54,13100,15.69,73100,15.70,1000,15.72,4000,15.74,14200,15.75,2013-01-11,14:14:24,00";
	var getStockArrayFromRawData = function(data){
		var lines = data.split("\n");
		var stockArray = [];
		for(var i=0; i<stockCodeArray.length; i++){
			var stockCode = stockCodeArray[i];
			var re = new RegExp('.*'+stockCode+'.*', 'gi');
			var lines = data.match(re);
			var stockData;
			if(lines.length>0){
				stockData = new StockModel(lines[0]);
			}else{
				stockData = new StockModel();
			}
			stockData.stockCode = stockCode;
			console.log('Stock data is: ' + util2.toString(stockData));
			stockArray.push(stockData);
		}
		return stockArray;
	}
	ajax(
		{
			url: requestUrl
		},
		function(data, status, request) {
			console.log('Response data is: ' + data);
			var stockArray = getStockArrayFromRawData(data);
			successCallback(stockArray);
		},
		function(error, status, request) {
			console.log('The ajax request failed: ' + error);
			errorCallback(error);
		}
	);
};

module.exports = DataLoader;
