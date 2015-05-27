var UI = require('ui');
var Settings = require('settings');
var util2 = require('util2');
var StockDetail = require('robinkam/chinastock/stock-detail');
var DataLoader = require('robinkam/chinastock/data-loader');

var StockMenu = function(stockIDs){
  this.stockIDs = stockIDs;
  this.menu = new UI.Menu({
    sections: [{
      title: 'Stock',
      items: []
    },{
      title: 'Index',
      items: []
    },{
      title: 'Invalid',
      items: []
    }]
  });
  var theInstance = this;
  this.menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    var detail = new StockDetail(e.item.stockData);
    detail.show();
  });
  this.menu.on('longSelect', function(e) {
    //console.log('Long Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    //console.log('The item is titled "' + e.item.title + '"');
    console.log('stockIDs: ' + stockIDs);
    theInstance.loadData(stockIDs);
  });
  this.menu.on('show', function() {
    console.log('Menu is shown!');
    theInstance.startAutoRefresh();
  });

  this.menu.on('hide', function() {
    console.log('Menu is hidden!');
    theInstance.stopAutoRefresh();
  });
};

StockMenu.prototype.show = function(){
  this.menu.show();
  this.loadData(this.stockIDs);
};

StockMenu.prototype.loadData = function(stockIDs){
  this.stockIDs = stockIDs;
  var theMenu = this.menu;
  if(stockIDs==undefined){
    theMenu.items(0, [{title: '请添加股票', subtitle: '先在手机上设置'}]);
    return;
  }
  theMenu.items(0, [{title: '正在载入...', subtitle: '请耐心等待'}]);
  theMenu.items(1, [{title: '正在载入...', subtitle: '请耐心等待'}]);
  theMenu.items(2, []);

  DataLoader.loadStockData(
    stockIDs,
    function(stockArray){
      if(stockArray.length==0){
        theMenu.items(0, [{title: '没有数据', subtitle: '请稍后重试'}]);
        return;
      }
      var menuItemsForStock = [];
      var menuItemsForIndex = [];
      var menuItemsForInvalid = [];
      for(var i=0; i<stockArray.length; i++){
        var stockData = stockArray[i];
        var menuItem = {title: "无数据", subtitle: "请检查股票代码", stockData:null};
        if(stockData.stockCode){
          if(stockData.stockName){
            var delta = stockData.currentPrice-stockData.closingPriceYesterday;
            var deltaPercent = delta/stockData.closingPriceYesterday*100;
            var symbol = deltaPercent>=0?'+':'';
            var stockPrice = stockData.currentPrice+' '+symbol+delta.toFixed(2)+' '+symbol+deltaPercent.toFixed(2)+'%';
            menuItem = {title: stockData.stockName, subtitle: stockPrice, stockData:stockData};
            menuItemsForStock.push(menuItem);
          }else{
            menuItem = {title: stockData.invalidCode, subtitle: stockData.invalidReason, stockData:stockData};
            menuItemsForInvalid.push(menuItem);
          }
          //console.log('Menu item is: ' + util2.toString(menuItem));
        }else if(stockData.indexCode){
          if(stockData.indexName){
            var symbol = stockData.deltaToday>=0?"+":"";
            var indexValue = symbol+stockData.currentValue+' '+symbol+stockData.percentDeltaToday+'%';
            menuItem = {title: stockData.indexName, subtitle: indexValue, stockData:stockData};
            menuItemsForIndex.push(menuItem);
          }else{
            menuItem = {title: stockData.indexCode, subtitle: "代码格式有误", stockData:stockData};
            menuItemsForInvalid.push(menuItem);
          }
          //console.log('Menu item is: ' + util2.toString(menuItem));
        }else{
          menuItem = {title: stockData.invalidCode, subtitle: stockData.invalidReason, stockData:stockData};
          //console.log('Invalid Menu Item is: ' + util2.toString(menuItem));
          menuItemsForInvalid.push(menuItem);
        }
      }
      theMenu.items(0, menuItemsForStock);
      theMenu.items(1, menuItemsForIndex);
      theMenu.items(2, menuItemsForInvalid);
    },
    function(error){

    }
  );
};

StockMenu.prototype.stopAutoRefresh = function(){
  clearInterval(this.autoRefreshInterval);
};

StockMenu.prototype.startAutoRefresh = function(){
  var theInstance = this;
  if(Settings.option('shouldAutoRefresh')){
    this.autoRefreshInterval = setInterval(function() {
      theInstance.loadData(theInstance.stockIDs);
    }, Settings.option('autoRefreshInterval')*1000);
  }
};


module.exports = StockMenu;