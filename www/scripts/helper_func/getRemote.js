var fs = require('fs');
var request = require('request');

function getMultiRemote(endpoint){
	
	if (endpoint.slice(-1) === '\r'){
		endpoint = endpoint.slice(0,-1)
	}						
	
	return new Promise((resolve,reject) =>{
		request.get(endpoint, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = body;
				resolve(data);
			}else{
				reject('error');
			}
		});
	});
		
}


module.exports = getMultiRemote;
