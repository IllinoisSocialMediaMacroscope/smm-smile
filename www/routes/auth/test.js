var fetch = require('node-fetch');

fetch('https://rest.synthesio.com/mention/v2/reports/38298/_analytics', {method:'POST',
											headers:{
												'Authorization': 'Bearer ***REMOVED***',
												'Content-Type': 'application/json',
												'user-agent': 'cwang138 testing various things v0.1',
											},
											body:{
													
												}

		}).then(function(response){
			return response.json();
		}).then(function(json){
			console.log(json);
		});