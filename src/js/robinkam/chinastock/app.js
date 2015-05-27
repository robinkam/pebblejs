var WindowStack = require('ui/windowstack');
var Settings = require('settings');
var util2 = require('util2');
var StockMenu = require('robinkam/chinastock/stock-menu');

var App = function(arg){
	//Settings.reset();
	if(Settings.option('shouldAutoRefresh')===undefined)
		Settings.option('shouldAutoRefresh', false);
	if(Settings.option('autoRefreshInterval')===undefined)
		Settings.option('autoRefreshInterval', 3600);

	var stockCodes = Settings.option('stockCodes');
	this.menu = new StockMenu(stockCodes);
	var theMenu = this.menu;

	var getSettingsServiceURL = function(){
		var deviceToken = Pebble.getWatchToken();
		//var settingsServiceURL = 'http://192.168.0.110:3000/form?appName=ChinaStock&deviceID='+deviceToken;
		//var settingsServiceURL = 'http://192.168.199.100:3000/form?appName=ChinaStock&deviceID='+deviceToken;
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
			var params = [];
			if(stockCodes){
				for(var i=0; i<stockCodes.length; i++){
					params.push("stockCode="+stockCodes[i]);
				}
			}
			var shouldAutoRefresh = Settings.option('shouldAutoRefresh');
			if(shouldAutoRefresh===undefined)
				shouldAutoRefresh = false;
			params.push("shouldAutoRefresh="+shouldAutoRefresh);
			var autoRefreshInterval = Settings.option('autoRefreshInterval');
			if(autoRefreshInterval===undefined)
				autoRefreshInterval = 600;
			params.push("autoRefreshInterval="+autoRefreshInterval);
			var url = e.url+"&"+params.join("&");
			console.log('settings service URL: '+url);
			return url;
		},
		function(e) {
			console.log('closed configurable');
			// Show the raw response if parsing failed or canceled.
			if (e.failed) {
				console.log('e.failed: '+e.response);
				return;
			}
			// Show the parsed response
			console.log('e.options: '+JSON.stringify(e.options));
			stockCodes = e.options.stockCodes;
			if(stockCodes!==undefined)
				Settings.option('stockCodes', stockCodes);
			var shouldAutoRefresh = e.options.shouldAutoRefresh;
			if(shouldAutoRefresh!==undefined)
				Settings.option('shouldAutoRefresh', shouldAutoRefresh);
			var autoRefreshInterval = e.options.autoRefreshInterval;
			if(autoRefreshInterval!==undefined)
				Settings.option('autoRefreshInterval', autoRefreshInterval);

			var topIndex = WindowStack.index(WindowStack.top());
			console.log('topIndex: ' + topIndex);
			if(topIndex!=0){
				WindowStack.pop();
			}
			theMenu.loadData(stockCodes);
			theMenu.stopAutoRefresh();
			theMenu.startAutoRefresh();
		}
	);
};

App.prototype.start = function(){
	this.menu.show();
}

module.exports = App;




