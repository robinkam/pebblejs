var UI = require('ui');
var util2 = require('util2');
var SimplyPebble = require('ui/simply-pebble');

var App = function(arg){
	this.main = new UI.Window();
	console.log('App Started');
	this.main.on('click', 'select', function(e) {
		console.log('select button is pressed');
		Pebble.addEventListener('appmessage',	function(e){
			console.log('Received message: ' + JSON.stringify(e.payload));
		});
	});
	//Pebble.addEventListener("ready", App.onReady);
	//Pebble.addEventListener('showConfiguration', App.onOpenConfig);
	//Pebble.addEventListener('webviewclosed', App.onCloseConfig);
};

//Pebble.addEventListener('appmessage',	function(e){
//	console.log('Received message: ' + JSON.stringify(e.payload));
//});
//
//SimplyPebble.onReady = function(){
//	console.log('JS ready');
//};

//SimplyPebble.onAppMessage = function(e) {
//	console.log('Received message: ' + JSON.stringify(e.payload));
//};

//SimplyPebble.onOpenConfig = function(e){
//	console.log('opening config');
//};
//
//SimplyPebble.onCloseConfig = function(e){
//	console.log('closing config');
//};

App.prototype.start = function(){
	this.main.show();
};

module.exports = App;




