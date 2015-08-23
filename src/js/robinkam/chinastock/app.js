var WindowStack = require('ui/windowstack');
var Settings = require('settings');
var util2 = require('util2');
var Clock = require('clock');
var Wakeup = require('wakeup');
var StockMenu = require('robinkam/chinastock/stock-menu');

var App = function(arg){
	//Settings.reset();
	if(Settings.option('shouldAutoRefresh')===undefined)
		Settings.option('shouldAutoRefresh', false);
	if(Settings.option('autoRefreshInterval')===undefined)
		Settings.option('autoRefreshInterval', 3600);
	if(Settings.option('shouldAutoWakeUp')===undefined)
		Settings.option('shouldAutoWakeUp', false);

	var stockCodes = Settings.option('stockCodes');
	this.menu = new StockMenu(stockCodes);
	var theMenu = this.menu;

	var scheduleCallback = function(e) {
		if (e.failed) {
			// Log the error reason
			console.log('Wakeup set failed: ' + e.error);
		} else {
			console.log('Wakeup set! Event ID: ' + e.id);
		}
	};
	var setWakeUpSchedule = function (e) {
		Wakeup.cancel('all');
		var shouldAutoWakeUp = Settings.option('shouldAutoWakeUp');
		console.log("shouldAutoWakeUp="+shouldAutoWakeUp);
		if(shouldAutoWakeUp){
			var currentWeekday = (new Date()).getDay();
			for(var i=0; i<4; i++){
				var validWeekday = currentWeekday+i+1;
				if(validWeekday>5)
					validWeekday = validWeekday-5;
				console.log("validWeekday="+validWeekday);
				Wakeup.schedule({time: Clock.weekday(validWeekday, 9, 30),data: { time: '9:30' }},scheduleCallback);
				Wakeup.schedule({time: Clock.weekday(validWeekday, 13, 0),data: { time: '13:00' }},scheduleCallback);
			}
		}
	};
	setWakeUpSchedule();

	var getSettingsServiceURL = function(){
		var deviceToken = Pebble.getWatchToken();
		//var settingsServiceURL = 'http://192.168.31.245:3000/form?appName=ChinaStock&deviceID='+deviceToken;
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
			var shouldAutoWakeUp = Settings.option('shouldAutoWakeUp');
			if(shouldAutoWakeUp===undefined)
				shouldAutoWakeUp = false;
			params.push("shouldAutoWakeUp="+shouldAutoWakeUp);

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
			var shouldAutoWakeUp = e.options.shouldAutoWakeUp;
			if(shouldAutoWakeUp!==undefined)
				Settings.option('shouldAutoWakeUp', shouldAutoWakeUp);

			var topIndex = WindowStack.index(WindowStack.top());
			console.log('topIndex: ' + topIndex);
			if(topIndex!=0){
				WindowStack.pop();
			}
			setWakeUpSchedule(e);
			theMenu.loadData(stockCodes);
			theMenu.stopAutoRefresh();
			theMenu.startAutoRefresh();
		}
	);
};

App.prototype.start = function(){
	this.menu.show();
};

module.exports = App;




