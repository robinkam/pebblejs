var UI = require('ui');
var Accel = require('ui/accel');
var Settings = require('settings');
var util2 = require('util2');
var StockDetail = require('robinkam/chinastock/stock-detail');
var DataLoader = require('robinkam/chinastock/data-loader');

var StockMenu = function(stockIDs){
  this.stockIDs = stockIDs;
  this.stockSectionTitle = "Stock";
  this.indexSectionTitle = "Index";
  this.menuItemsForStock = [];
  this.menuItemsForIndex = [];
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
  //扭动手腕看表的时候刷新数据
  Accel.init();
  this.menu.on('accelTap', function (e) {
    console.log('stockIDs: ' + stockIDs);
    theInstance.loadData(stockIDs);
  });
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

StockMenu.prototype.showLoading = function () {
  console.log('show loading');
  var loadingCharacter = ".", loadingCount = 1, _this = this;
  clearInterval(this.loadingTimer);
  this.loadingTimer = setInterval(function () {
    var loadingIndicator = "";
    for(var i=0; i<loadingCount%4; i++){
      loadingIndicator += loadingCharacter;
    }
    _this.menu.section(0, {title:_this.stockSectionTitle+loadingIndicator});
    loadingCount++;
  }, 250);
};

StockMenu.prototype.hideLoading = function () {
  console.log('hide loading');
  clearInterval(this.loadingTimer);
  this.menu.section(0, this.stockSectionTitle);
};

StockMenu.prototype.loadData = function(stockIDs){
  this.stockIDs = stockIDs;
  var _this = this;
  var theMenu = this.menu;
  if(stockIDs==undefined){
    theMenu.items(0, [{title: '请添加股票', subtitle: '先在手机上设置'}]);
    return;
  }
  if(this.menuItemsForStock.length==0){
    theMenu.items(0, [{title: '正在载入...', subtitle: '请耐心等待'}]);
  }
  if(this.menuItemsForIndex.length==0){
    theMenu.items(1, [{title: '正在载入...', subtitle: '请耐心等待'}]);
  }
  theMenu.items(2, []);

  _this.showLoading();
  DataLoader.loadStockData(
    stockIDs,
    function(stockArray){
      _this.hideLoading();
      if(stockArray.length==0){
        theMenu.items(0, [{title: '没有数据', subtitle: '请稍后重试'}]);
        return;
      }
      var menuItemsForStock = [];
      var menuItemsForIndex = [];
      var menuItemsForInvalid = [];
      var line1, line2;
      for(var i=0; i<stockArray.length; i++){
        var stockData = stockArray[i];
        var menuItem = {title: "无数据", subtitle: "请检查股票代码", stockData:null};
        if(stockData.stockCode){
          if(stockData.stockName){
            line1 = stockData.currentPrice+'    '+stockData.deltaPrice;
            line2 = stockData.stockName+'  '+stockData.deltaPercent;
            menuItem = {title: line1, subtitle: line2, stockData:stockData};
            menuItemsForStock.push(menuItem);
          }else{
            menuItem = {title: stockData.invalidCode, subtitle: stockData.invalidReason, stockData:stockData};
            menuItemsForInvalid.push(menuItem);
          }
          //console.log('Menu item is: ' + util2.toString(menuItem));
        }else if(stockData.indexCode){
          if(stockData.indexName){
            line1 = stockData.currentValue+' '+stockData.deltaToday;
            line2 = stockData.indexName+' '+stockData.percentDeltaToday;
            menuItem = {title: line1, subtitle: line2, stockData:stockData};
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
      if(menuItemsForStock.length>0){
        _this.stockSectionTitle = 'Stock (at '+menuItemsForStock[0].stockData.time+')';
        theMenu.section(0, {title:_this.stockSectionTitle});
      }
      if(menuItemsForIndex.length>0){
        _this.indexSectionTitle = 'Index (at '+menuItemsForStock[0].stockData.time+')';
        theMenu.section(1, {title:_this.indexSectionTitle});
      }
      theMenu.items(0, menuItemsForStock);
      theMenu.items(1, menuItemsForIndex);
      theMenu.items(2, menuItemsForInvalid);
      _this.menuItemsForStock = menuItemsForStock;
      _this.menuItemsForIndex = menuItemsForIndex;
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