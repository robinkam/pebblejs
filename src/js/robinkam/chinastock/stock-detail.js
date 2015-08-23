var UI = require('ui');
var Accel = require('ui/accel');
var Settings = require('settings');
var util2 = require('util2');
var DataLoader = require('robinkam/chinastock/data-loader');

var StockDetail = function(stockData){
	this.main = new UI.Card({
		title: '数据无效',
		subtitle: '请返回上一页面',
		body: '再试试别的股票',
		scrollable:false,
		style: "small"
	});
	this.pageIndex = 0;
	//console.log('this.main: ' + util2.toString(this.main));
  if(stockData){
		this.updateInfo(stockData, 0);
	}
	var theInstance = this;
	var reloadData = function(e) {
		if(e.title)
			console.log('Reload data for stock: ' + e.title);
		if(stockData.stockCode)
			theInstance.loadData(stockData.stockCode);
		else
			theInstance.loadData(stockData.indexCode);
	};

	//扭动手腕看表的时候刷新数据
	Accel.init();
	this.main.on('accelTap', reloadData);

	this.main.on('click', 'select', reloadData);
	this.main.on('click', 'up', function(e) {
		console.log('Show previous page');
		theInstance.updateInfo(stockData, theInstance.pageIndex-1);
	});
	this.main.on('click', 'down', function(e) {
		console.log('Show next page');
		theInstance.updateInfo(stockData, theInstance.pageIndex+1);
	});
	this.main.on('show', function() {
		console.log('Card is shown!');
		if(Settings.option('shouldAutoRefresh')){
			theInstance.autoRefreshInterval = setInterval(function() {
				if(stockData.stockCode)
					theInstance.loadData(stockData.stockCode);
				else
					theInstance.loadData(stockData.indexCode);
			}, Settings.option('autoRefreshInterval')*1000);
		}
	});
	this.main.on('hide', function() {
		console.log('Card is hidden!');
		clearInterval(theInstance.autoRefreshInterval);
	});
};

StockDetail.prototype.show = function(){
  this.main.show();
};

StockDetail.prototype.updateInfo = function(stockData, pageIndex){
	pageIndex = (pageIndex+5)%5;
	this.pageIndex = pageIndex;
	if(stockData.stockCode){
		console.log('updateInfo: ' + stockData.stockCode + "["+pageIndex+"/5]");
		if(stockData.stockName==undefined){
			this.main.subtitle("没有数据");
			this.main.body("请检查股票代码是否正确");
			return;
		}
		var delta = stockData.currentPrice-stockData.closingPriceYesterday;
		var deltaPercent = delta/stockData.closingPriceYesterday*100;
		var symbol = deltaPercent>=0?'+':'';
		var pageSubtitles = [
			'现价'+stockData.currentPrice+"元\n"+symbol+delta.toFixed(2)+' '+symbol+deltaPercent.toFixed(2)+'%',
			'现价'+stockData.currentPrice+"元\n"+symbol+delta.toFixed(2)+' '+symbol+deltaPercent.toFixed(2)+'%',
			'现价'+stockData.currentPrice+"元\n"+symbol+delta.toFixed(2)+' '+symbol+deltaPercent.toFixed(2)+'%',
			'买1 ~ 买5',
			'卖1 ~ 卖5'
		];
		var pageBodies = [
			[
				"今开盘价"+stockData.openingPriceToday+"元",
				"今最高价"+stockData.highestPriceToday+"元",
				"今最低价"+stockData.lowestPriceToday+"元",
				stockData.date+" "+stockData.time
			],
			[
				"成交量\n"+stockData.tradedAmountOfStock/10000+"万股",
				"成交金额\n"+stockData.tradedAmountOfMoney/10000+"万元"
			],
			[
				"昨收盘价"+stockData.closingPriceYesterday+"元",
				"竞买价"+stockData.buyPrice+"元",
				"竞卖价"+stockData.sellPrice+"元"
			],
			[
				"1 "+stockData.buyers[0].stock+"股 "+stockData.buyers[0].price+"元",
				"2 "+stockData.buyers[1].stock+"股 "+stockData.buyers[1].price+"元",
				"3 "+stockData.buyers[2].stock+"股 "+stockData.buyers[2].price+"元",
				"4 "+stockData.buyers[3].stock+"股 "+stockData.buyers[3].price+"元",
				"5 "+stockData.buyers[4].stock+"股 "+stockData.buyers[4].price+"元"
			],
			[
				"1 "+stockData.sellers[0].stock+"股 "+stockData.sellers[0].price+"元",
				"2 "+stockData.sellers[1].stock+"股 "+stockData.sellers[1].price+"元",
				"3 "+stockData.sellers[2].stock+"股 "+stockData.sellers[2].price+"元",
				"4 "+stockData.sellers[3].stock+"股 "+stockData.sellers[3].price+"元",
				"5 "+stockData.sellers[4].stock+"股 "+stockData.sellers[4].price+"元"
			]
		];
		this.main.title(stockData.stockName);
		this.main.subtitle(pageSubtitles[pageIndex]);
		this.main.body(pageBodies[pageIndex].join("\n"));
	}else if(stockData.indexCode){
		console.log('updateInfo: ' + stockData.indexCode);
		if(stockData.indexName==undefined){
			this.main.subtitle("没有数据");
			this.main.body("请检查指数代码是否正确");
			return;
		}
		var symbol = stockData.deltaToday>=0?"+":"";
		var lines = [
			"今日涨跌\n"+symbol+stockData.percentDeltaToday+"% "+symbol+stockData.deltaToday,
			"成交量"+stockData.tradedAmountOfStock+"手",
			"成交额\n"+stockData.tradedAmountOfMoney+"万元"
		];
		this.main.title(stockData.indexName);
		this.main.subtitle('当前'+stockData.currentValue);
		this.main.body(lines.join("\n"));
	}else{
		console.log('updateInfo: ' + stockData.invalidCode);
		if(stockData.invalidCode==undefined){
			this.main.subtitle("没有数据");
			this.main.body("请检查指数代码是否正确");
			return;
		}
		this.main.title(stockData.invalidCode);
		this.main.subtitle(stockData.invalidReason);
	}
};

StockDetail.prototype.loadData = function(stockID){
	var theInstance = this;
	var theCard = this.main;
	theCard.subtitle("正在刷新数据");
	theCard.body("请耐心等待...");
	DataLoader.loadStockData(
		[stockID],
		function(stockArray){
			if(stockArray.length>0){
				var stockData = stockArray[0];
				theInstance.updateInfo(stockData, 0);
			}else{
				var stockData = {stockCode: stockID};
				theInstance.updateInfo(stockData, 0);
			}
		},
		function(error){

		}
	);
};

module.exports = StockDetail;