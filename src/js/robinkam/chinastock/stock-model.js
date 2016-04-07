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

	function getFormattedNumber (number){
		return parseFloat(number).toFixed(2);
	}

	var dataString = line.substring(firstQuoteIndex+1, lastQuoteIndex);
	var dataParts = dataString.split(",");
	if(dataParts.length>31){
		var model = {
			stockCode: "",
			stockName: dataParts[0],
			openingPriceToday: getFormattedNumber(dataParts[1]),
			closingPriceYesterday: getFormattedNumber(dataParts[2]),
			currentPrice: getFormattedNumber(dataParts[3]),
			highestPriceToday: getFormattedNumber(dataParts[4])+'元',
			lowestPriceToday: getFormattedNumber(dataParts[5])+'元',
			buyPrice: getFormattedNumber(dataParts[6])+'元',
			sellPrice: getFormattedNumber(dataParts[7])+'元',
			tradedAmountOfStock: getFormattedNumber(dataParts[8]/1000000)+'万手',
			tradedAmountOfMoney: getFormattedNumber(dataParts[9]/100000000)+'亿元',
			buyers:[
				{stock:dataParts[10]/100+'手', price:getFormattedNumber(dataParts[11])+'元'},
				{stock:dataParts[12]/100+'手', price:getFormattedNumber(dataParts[13])+'元'},
				{stock:dataParts[14]/100+'手', price:getFormattedNumber(dataParts[15])+'元'},
				{stock:dataParts[16]/100+'手', price:getFormattedNumber(dataParts[17])+'元'},
				{stock:dataParts[18]/100+'手', price:getFormattedNumber(dataParts[19])+'元'}
			],
			sellers:[
				{stock:dataParts[20]/100+'手', price:getFormattedNumber(dataParts[21])+'元'},
				{stock:dataParts[22]/100+'手', price:getFormattedNumber(dataParts[23])+'元'},
				{stock:dataParts[24]/100+'手', price:getFormattedNumber(dataParts[25])+'元'},
				{stock:dataParts[26]/100+'手', price:getFormattedNumber(dataParts[27])+'元'},
				{stock:dataParts[28]/100+'手', price:getFormattedNumber(dataParts[29])+'元'}
			],
			date: dataParts[30],
			time: dataParts[31]
		};
		var delta = model.currentPrice-model.closingPriceYesterday;
		var deltaPercent = delta/model.closingPriceYesterday*100;
		var symbol = deltaPercent>=0?'+':'';
		model.deltaPrice = symbol+delta.toFixed(2);
		model.deltaPercent = symbol+deltaPercent.toFixed(2)+'%';
		return model;
	}else{
		console.log('return null, because (dataParts.length>31)');
		return null;
	}
};

module.exports = StockModel;