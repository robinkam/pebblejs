/**
 * Created by neulion-qa on 15/5/17.
 */
var IndexModel = function(line){
	var firstQuoteIndex = line.indexOf('"');
	var lastQuoteIndex = line.lastIndexOf('"');
	if(firstQuoteIndex==-1 || firstQuoteIndex==lastQuoteIndex){
		console.log('return null, because (firstQuoteIndex==-1 || firstQuoteIndex==lastQuoteIndex)');
		return null;
	}
	var dataString = line.substring(firstQuoteIndex+1, lastQuoteIndex);
	var dataParts = dataString.split(",");
	if(dataParts.length>5){
		var model = {
			indexCode: "",
			indexName: dataParts[0],
			currentValue: dataParts[1],
			deltaToday: dataParts[2],
			percentDeltaToday: dataParts[3],
			tradedAmountOfStock: dataParts[4],
			tradedAmountOfMoney: dataParts[5]
		};
		return model;
	}else{
		console.log('return null, because (dataParts.length>31)');
		return null;
	}
};

module.exports = IndexModel;