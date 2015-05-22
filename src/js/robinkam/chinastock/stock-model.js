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
	var dataParts = dataString.split(",");
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
			buyers:[
				{stock:dataParts[10], price:dataParts[11]},
				{stock:dataParts[12], price:dataParts[13]},
				{stock:dataParts[14], price:dataParts[15]},
				{stock:dataParts[16], price:dataParts[17]},
				{stock:dataParts[18], price:dataParts[19]},
			],
			sellers:[
				{stock:dataParts[20], price:dataParts[21]},
				{stock:dataParts[22], price:dataParts[23]},
				{stock:dataParts[24], price:dataParts[25]},
				{stock:dataParts[26], price:dataParts[27]},
				{stock:dataParts[28], price:dataParts[29]},
			],
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