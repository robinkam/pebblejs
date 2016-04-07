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

	function getFormattedNumber (number){
		return parseFloat(number).toFixed(2);
	}

	var dataString = line.substring(firstQuoteIndex+1, lastQuoteIndex);
	var dataParts = dataString.split(",");
	if(dataParts.length>5){
		var symbol = dataParts[2]>=0?"+":"";
		var model = {
			indexCode: "",
			indexName: dataParts[0],
			currentValue: getFormattedNumber(dataParts[1]),
			deltaToday: symbol+getFormattedNumber(dataParts[2]),
			percentDeltaToday: symbol+dataParts[3]+'%',
			tradedAmountOfStock: getFormattedNumber(dataParts[4]/1000000)+'亿手',
			tradedAmountOfMoney: getFormattedNumber(dataParts[5]/10000)+'亿元'
		};
		return model;
	}else{
		console.log('return null, because (dataParts.length>31)');
		return null;
	}
};

module.exports = IndexModel;