var Settings = require('settings');
var StockMenu = require('robinkam/chinastock/stock-menu');

var App = function(arg){
	var deviceToken = Pebble.getWatchToken();
	//var settingsServiceURL = 'http://192.168.199.100:3000/form?appName=ChinaStock&deviceID='+deviceToken;
	var settingsServiceURL = 'http://pebblesettings.avosapps.com/form?appName=ChinaStock&deviceID='+deviceToken;
	console.log('settings service URL: '+settingsServiceURL);

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
			if(e.options.stockCodes!==undefined)
				Settings.option('stockCodes', e.options.stockCodes);
			// Reload stock list
			menu.loadData(Settings.option('stockCodes'));
			// Show the raw response if parsing failed
			if (e.failed) {
				console.log('e.failed: '+e.response);
			}
		}
	);
};

App.prototype.start = function(){
	var stockCodes = Settings.option('stockCodes');
	var menu = new StockMenu(stockCodes);
	menu.show();
}

module.exports = App;




