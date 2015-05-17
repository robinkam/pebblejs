var UI = require('ui');
var util2 = require('util2');
var DataLoader = require('robinkam/chinastock/data-loader')

var StockDetail = function(stockData){
	this.main = new UI.Card({
		title: '数据无效',
		subtitle: '请返回上一页面',
		body: '再试试别的股票',
		scrollable:true,
		style: "small"
	});
	console.log('this.main: ' + util2.toString(this.main));
  if(stockData){
		this.updateInfo(stockData);
	}
	this.main.delegate = this;
	this.main.on('click', 'select', function(e) {
		console.log('Reload data for stock: ' + e.title);
		e.card.delegate.loadData(stockData.stockCode);
	});
};

StockDetail.prototype.show = function(){
  this.main.show();
};

StockDetail.prototype.updateInfo = function(stockData){
	console.log('updateInfo: ' + stockData.stockCode);
	if(stockData.stockName==undefined){
		theCard.state.subtitle = "没有数据";
		theCard.state.body = "请检查股票代码是否正确";
		return;
	}
	var subtitle = '现价'+stockData.currentPrice+"元";
	var lines = [
		"今开盘价"+stockData.openingPriceToday+"元",
		"昨收盘价"+stockData.closingPriceYesterday+"元",
		"今最高价"+stockData.highestPriceToday+"元",
		"今最低价"+stockData.lowestPriceToday+"元",
		"竞买价"+stockData.buyPrice+"元",
		"竞卖价"+stockData.sellPrice+"元",
		"成交量\n"+stockData.tradedAmountOfStock+"股",
		"成交金额\n"+stockData.tradedAmountOfMoney/10000+"万元",
		"数据时间\n"+stockData.date+" "+stockData.time
	];
	var body = lines.join("\n");
	this.main.state.title = stockData.stockName;
	this.main.state.subtitle = subtitle;
	this.main.state.body = body;
}

StockDetail.prototype.loadData = function(stockID){
	var theCard = this.main;
	theCard.state.subtitle = "正在刷新数据";
	theCard.state.body = "请耐心等待...";
	DataLoader.loadStockData(
		[stockID],
		function(stockArray){
			if(stockArray.length>0){
				var stockData = stockArray[0];
				console.log('Stock data is: ' + util2.toString(stockData));
				theCard.delegate.updateInfo(stockData);
			}else{
				var stockData = {stockCode: stockID};
				this.updateInfo(stockData);
			}
		},
		function(error){

		}
	);
};

module.exports = StockDetail;