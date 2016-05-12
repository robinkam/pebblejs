var UI = require('ui');
var Accel = require('ui/accel');
var Settings = require('settings');
var util2 = require('util2');
var DataLoader = require('robinkam/chinastock/data-loader');

var StockDetail = function(stockData){
	this.stockData = stockData;
	var color = this.getColor();
	this.main = new UI.Card({
		title: '数据无效',
		subtitle: '请返回上一页面',
		body: '再试试别的股票',
		scrollable:false,
		titleColor:color,
		subtitleColor:color,
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
		DataLoader.trackEvent('clickUp@Detail');
		theInstance.updateInfo(stockData, theInstance.pageIndex-1);
	});
	this.main.on('click', 'down', function(e) {
		console.log('Show next page');
		DataLoader.trackEvent('clickDown@Detail');
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

StockDetail.prototype.getColor = function () {
	var color = 'black';
	var delta = 0;
	if(this.stockData.stockCode){
		delta = this.stockData.currentPrice-this.stockData.closingPriceYesterday;
	}else if(this.stockData.indexCode){
		delta = this.stockData.deltaToday;
	}
	if(delta>0){
		color = 'red';
	}else if(delta<0){
		color = 'green';
	}
	return color;
};

StockDetail.prototype.show = function(){
  this.main.show();
};

StockDetail.prototype.showLoading = function () {
	console.log('show loading');
	var loadingCharacter = ".", loadingCount = 0, _this = this;
	clearInterval(this.loadingTimer);
	this.loadingTimer = setInterval(function () {
		var loadingIndicator = "";
		for(var i=0; i<loadingCount%4; i++){
			loadingIndicator += loadingCharacter;
		}
		if(_this.stockData.stockCode){
			_this.main.title(_this.stockData.stockName+loadingIndicator);
		}else if(_this.stockData.indexCode){
			_this.main.title(_this.stockData.indexName+loadingIndicator);
		}
		loadingCount++;
	}, 250);
};

StockDetail.prototype.hideLoading = function () {
	console.log('hide loading');
	clearInterval(this.loadingTimer);
	if(this.stockData.stockCode){
		this.main.title(this.stockData.stockName);
	}else if(this.stockData.indexCode){
		this.main.title(this.stockData.indexName);
	}
};

StockDetail.prototype.updateInfo = function(stockData, pageIndex){
	pageIndex = (pageIndex+4)%4;
	this.pageIndex = pageIndex;
	if(stockData.stockCode){
		console.log('updateInfo: ' + stockData.stockCode + "["+pageIndex+"/5]");
		if(stockData.stockName==undefined){
			this.main.subtitle("没有数据");
			this.main.body("请检查股票代码是否正确");
			return;
		}

		var pageSubtitles = [
			stockData.currentPrice+' '+stockData.deltaPrice,
			stockData.currentPrice+' '+stockData.deltaPercent,
			'卖5 ~ 卖1',
			'买1 ~ 买5'
		];
		var pageBodies = [
			[
				"今开盘"+stockData.openingPriceToday+"元",
				"昨收盘"+stockData.closingPriceYesterday+"元",
				"成交"+stockData.tradedAmountOfStock,
				"成交"+stockData.tradedAmountOfMoney,
				stockData.date+" "+stockData.time
			],
			[
				"最高"+stockData.highestPriceToday,
				"最低"+stockData.lowestPriceToday,
				"竞买价"+stockData.buyPrice,
				"竞卖价"+stockData.sellPrice
			],
			[
				"5 "+stockData.sellers[4].price+" "+stockData.sellers[4].stock,
				"4 "+stockData.sellers[3].price+" "+stockData.sellers[3].stock,
				"3 "+stockData.sellers[2].price+" "+stockData.sellers[2].stock,
				"2 "+stockData.sellers[1].price+" "+stockData.sellers[1].stock,
				"1 "+stockData.sellers[0].price+" "+stockData.sellers[0].stock
			],
			[
				"1 "+stockData.buyers[0].price+" "+stockData.buyers[0].stock,
				"2 "+stockData.buyers[1].price+" "+stockData.buyers[1].stock,
				"3 "+stockData.buyers[2].price+" "+stockData.buyers[2].stock,
				"4 "+stockData.buyers[3].price+" "+stockData.buyers[3].stock,
				"5 "+stockData.buyers[4].price+" "+stockData.buyers[4].stock
			]
		];

		var color = this.getColor();
		this.main.titleColor(color);
		this.main.subtitleColor(color);

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
		var lines = [
			"今日涨跌",
			stockData.deltaToday+' '+stockData.percentDeltaToday,
			"成交",
			stockData.tradedAmountOfMoney,
			stockData.tradedAmountOfStock
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
	theInstance.showLoading();
	DataLoader.loadStockData(
		[stockID],
		function(stockArray){
			theInstance.hideLoading();
			if(stockArray.length>0){
				theInstance.stockData = stockArray[0];
			}else{
				theInstance.stockData = {stockCode: stockID};
			}
			theInstance.updateInfo(theInstance.stockData, 0);
		},
		function(error){
			theInstance.hideLoading();
		}
	);
};

module.exports = StockDetail;