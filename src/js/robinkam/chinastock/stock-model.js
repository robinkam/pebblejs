/**
 * Created by neulion-qa on 15/5/17.
 */
var StockModel = function(line){
	var firstQuoteIndex = line.indexOf('"');
	var lastQuoteIndex = line.lastIndexOf('"');
	if(firstQuoteIndex==-1 || firstQuoteIndex==lastQuoteIndex){
		console.log('return null, because (firstQuoteIndex==-1 || firstQuoteIndex==lastQuoteIndex)');
		return null;
	}
	var dataString = line.substring(firstQuoteIndex+1, lastQuoteIndex);
	//	console.log('Stock line is: ' + dataString);
	var dataParts = dataString.split(",");
	//	console.log('Stock data array is: ' + dataParts);
	if(dataParts.length>31){
		var model = {
			stockCode: "",
			stockName: dataParts[0],
			openingPriceToday: dataParts[1],
			closingPriceYesterday: dataParts[2],
			currentPrice: dataParts[3],
			highestPriceToday: dataParts[4],
			lowestPriceToday: dataParts[5],
			buyPrice: dataParts[6],
			sellPrice: dataParts[7],
			tradedAmountOfStock: dataParts[8],
			tradedAmountOfMoney: dataParts[9],
			date: dataParts[30],
			time: dataParts[31]
		};
		return model;
	}else{
		console.log('return null, because (dataParts.length>31)');
		return null;
	}
};

module.exports = StockModel;