/**
 * Created by neulion-qa on 15/5/17.
 */
var InvalidModel = function(code, reason){
	if(code){
		var model = {
			invalidCode: code,
			invalidReason: reason?reason:"代码格式不正确"
		};
		return model;
	}else{
		console.log('return null, because the code parameter is null or undefined.');
		return null;
	}
};

module.exports = InvalidModel;