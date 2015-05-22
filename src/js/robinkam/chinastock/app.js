var Settings = require('settings');
var StockMenu = require('robinkam/chinastock/stock-menu');

var App = function(arg){
	var stockCodes = Settings.option('stockCodes');
	this.menu = new StockMenu(stockCodes);
	var theMenu = this.menu;

	var getSettingsServiceURL = function(){
		stockCodes = Settings.option('stockCodes');
		var stockCodesQueryParams = [];
		for(var i=0; i<stockCodes.length; i++){
			stockCodesQueryParams.push("stockCode="+stockCodes[i]);
		}
		var stockCodesQueryString = stockCodesQueryParams.join("&");
		if(stockCodesQueryString && stockCodesQueryString.length>0){
			stockCodesQueryString = "&"+stockCodesQueryString;
		}
		var deviceToken = Pebble.getWatchToken();
		//var settingsServiceURL = 'http://192.168.31.100:3000/form?appName=ChinaStock&deviceID='+deviceToken;
		var settingsServiceURL = 'http://pebblesettings.avosapps.com/form?appName=ChinaStock&deviceID='+deviceToken;
		console.log('settings service URL: '+settingsServiceURL);
		return settingsServiceURL;
	};
	var settingsServiceURL = getSettingsServiceURL();
	// Set a configurable with the open callback
	Settings.config(
		{ url: settingsServiceURL },
		function(e) {
			console.log('opening configurable');
		},
		function(e) {
			console.log('closed configurable');
			// Show the parsed response
			console.log('e.options: '+JSON.stringify(e.options));
			stockCodes = e.options.stockCodes;
			if(stockCodes!==undefined)
				Settings.option('stockCodes', stockCodes);
			// Reload stock list
			theMenu.loadData(stockCodes);
			// Show the raw response if parsing failed
			if (e.failed) {
				console.log('e.failed: '+e.response);
			}
		}
	);
};

App.prototype.start = function(){
	this.menu.show();
}

module.exports = App;




