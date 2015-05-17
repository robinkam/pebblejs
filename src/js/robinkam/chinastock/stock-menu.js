var UI = require('ui');
var util2 = require('util2');
var StockDetail = require('robinkam/chinastock/stock-detail');
var DataLoader = require('robinkam/chinastock/data-loader')

var StockMenu = function(stockIDs){
  this.stockIDs = stockIDs;
  this.menu = new UI.Menu({
    sections: [{
      title: 'Stock',
      items: []
    },{
      title: 'Index',
      items: []
    }]
  });
  this.menu.delegate = this;
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
    e.menu.delegate.loadData(stockIDs);
  });
};

StockMenu.prototype.show = function(){
  this.menu.show();
  this.loadData(this.stockIDs);
};

StockMenu.prototype.loadData = function(stockIDs){
  var theMenu = this.menu;
  if(stockIDs==undefined){
    theMenu.items(0, [{title: '请添加股票', subtitle: '先在手机上设置'}]);
    return;
  }
  theMenu.items(0, [{title: '正在载入...', subtitle: '请耐心等待'}]);

  DataLoader.loadStockData(
    stockIDs,
    function(stockArray){
      if(stockArray.length==0){
        theMenu.items(0, [{title: '没有数据', subtitle: '请稍后重试'}]);
        return;
      }
      var menuItems = [];
      for(var i=0; i<stockArray.length; i++){
        var stockData = stockArray[i];
        var stockPrice = stockData.lowestPriceToday+'<= '+stockData.currentPrice+' <='+stockData.highestPriceToday;
        var menuItem = {title: stockData.stockName, subtitle: stockPrice, stockData:stockData};
        console.log('Menu item is: ' + util2.toString(menuItem));
        menuItems.push(menuItem);
      }
      theMenu.items(0, menuItems);
    },
    function(error){

    }
  );
};

module.exports = StockMenu;