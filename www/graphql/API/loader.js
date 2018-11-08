var DataLoader = require('dataloader');
var Promise = require('bluebird');
const snoowrap = require('snoowrap');
var fs = require('fs');
var path = require('path');
var rootDIR = path.resolve('.');

const replyLoader = new DataLoader(function(ids){
	
	const snoowrap = require('snoowrap');
	r = new snoowrap({
			userAgent: 	'social monitoring research',
			accessToken: JSON.parse(ids[0])['token']
	});
	
	var promise_array = [];
	for (var i=0, length=ids.length; i<length; i++){
		wait(4000); // synchronized block!
		promise_array.push(getCompleteReplies(ids[i]));
	}

	return Promise.all(promise_array);
});


function getCompleteReplies(id){
	return new Promise((resolve,reject) =>{
		r.getSubmission(JSON.parse(id)['id']).expandReplies({limit:100,depth:1}).then(data =>  {
				agg_comments = [];
				for (var i = 0, length=data.comments.length; i< length; i++){
					commentTreeFlaten(data.comments[i]);
				}
				resolve(agg_comments);
			}).catch((err) => { console.log(err);reject(err);
				});
		});	
}

function commentTreeFlaten(o){
		
		currentNode = o;
		if (currentNode !== null && currentNode['replies']!== null){
			var children = currentNode['replies'];
			delete currentNode['replies'];
			agg_comments.push(currentNode);
			
			for (var i=0, length =children.length; i< length; i++){
				commentTreeFlaten(children[i])
			}
		}else if (currentNode !== null && currentNode['replies'] === null){
			var children = currentNode['replies'];
			delete currentNode['replies'];
			agg_comments.push(currentNode);
		}
		
}

function wait(ms){
	var start = Date.now(), now = start;
	while(now - start < ms){
		now = Date.now();
	}
}

module.exports = {replyLoader};
