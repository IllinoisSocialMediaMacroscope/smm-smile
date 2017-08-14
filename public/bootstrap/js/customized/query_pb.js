//corresponding to query.pug and searchbox.pug
function init(){
	
	// initialization
	$("#searchbox").prop('disabled',true);
	$("#dropdownButton").prop('disabled',true);
	$("#simple-search-btn").prop('disabled',true);
	queryTerm = '';
	Query ='';
	parameters = { 	tweet: {},
					twtUser: {},
					es: {},
					rdComment: {},
					rdSearch: {},
					rdReply: {},
					rdSub: {}
				};
	parameters['tweet']['q:'] = $("#searchbox").val();
	parameters['tweet']['count:'] = parseInt($("#tweet-count").val());
	parameters['tweet']['pages:'] = parseInt( $("#max_pages").val());
	parameters['tweet']['fields'] = '';
	
	parameters['twtUser']['q:'] = $("#searchbox").val();
	parameters['twtUser']['count:'] = parseInt($("#twtUser-count").val());
	//parameters['twtUser']['pages:'] = parseInt($("#max_pages_user").val());
	parameters['twtUser']['fields'] = '';
	
	
	parameters['es']['q:'] = $("#searchbox").val();
	parameters['es']['perPage:'] =  parseInt($("#perPage").val());
	//parameters['es']['pageNum:'] =  parseInt($("#pageNum").val());
	parameters['es']['fields'] = '';
	
	
	parameters['rdComment']['subredditName:'] = $("#searchbox").val();
	parameters['rdComment']['extra:'] = parseInt($("#reddit_extra").val());
	parameters['rdComment']['fields'] = '';
	
	
	parameters['rdSearch']['query:'] = $("#searchbox").val();
	parameters['rdSearch']['count:'] = parseInt($("#reddit_count").val());
	parameters['rdSearch']['fields'] = '';
	
	parameters['rdSearch']['time:'] = $("#time").val();
	parameters['rdSearch']['sort:'] = $("#sort").val();
	
	parameters['rdReply']['id:'] = $("#searchbox").val();
	parameters['rdReply']['fields'] = '';
	
	
	parameters['rdSub']['query:'] = $("#searchbox").val();
	parameters['rdSub']['fields'] = '';
	
	// customize dropdown
	$('#dropdownButton').on('click',function(event){
		console.log($("#searchbox").val())
		if ($("#searchbox").val() !== '' && $("#searchbox").val() !== undefined ){
			$(this).parent().toggleClass('open');
			if ($(this).parent().attr('class') === 'dropdown dropdown-lg open'){
				// disable search and enable advanced search
				$("#simple-search-btn").prop('disabled',true);
			}else{
				$("#simple-search-btn").prop('disabled',false);
			}
		}else{
			alert("Please type in search keyword in the form of English words/number/or any combination of them! Length shouldn't exceed 72 characters!");
			$("#searchbox").focus();
		}
	});
	
	// customize selectpicker
	$('.selectpicker').selectpicker({ style: 'btn-info', size: 10 });

	// customize multiselectbox
    $(document).ready(function() {
        $('.fields').multiselect({
			enableFiltering: true,
			filterBehavior: 'value',
			dropUp:true,
			maxHeight:400,
			buttonWidth:'600px',
			includeSelectAllOption: true,		
			enableCollapsibleOptGroups: true,			
			});
    });
	
	// select box enable search
	$("#social-media").change(function(){
		
		$("#searchbox").prop('disabled',false);
		$("#dropdownButton").prop('disabled',false);
		$("#simple-search-btn").prop('disabled',false);
	
		$(".tweet").hide();
		$(".user").hide();
		$(".es-tweet").hide();
		$(".reddit.getNewComments").hide();
		$(".reddit.searchContent").hide();
		$(".reddit.searchSubreddits").hide();
		$(".reddit.getCompleteReplies").hide();
		$(".reddit.extra").hide();
		$(".reddit.count").hide();
		$(".form-group.geocode").hide();
		$(".form-group.dateRange").hide();
		$(".form-group.es-geocode").hide();
		$(".form-group.es-dateRange").hide();
		$(".form-group.es-popularity").hide();
		
		
		queryTerm = $(this).find(':selected').val();
		if ( queryTerm === 'queryTweet'){
			$(".tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");
		}else if ( queryTerm === 'queryUser'){
			$(".user").show();
			$("#searchbox").attr("placeholder","Username keywords that you wish to search...");
		}else if ( queryTerm === 'streamTweet'){
			$(".es-tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");
		}else if (queryTerm === 'searchContent'){
			$(".reddit.count").show();
			$(".reddit.searchContent").show();
			$("#searchbox").attr("placeholder","Reddit post keywords that you wish to search...");
		}else if ( queryTerm === 'getNewComments'){
			$(".reddit.extra").show();
			$(".reddit.getNewComments").show();
			$("#searchbox").attr("placeholder","Type Subreddit name or ALL...");
		}else if (queryTerm === 'getCompleteReplies'){
			$(".reddit.getCompleteReplies").show();
			$("#searchbox").attr("placeholder","Reddit post ID (e.g. mvdg3 )...");
		}
		else if ( queryTerm === 'searchSubreddits'){
			$(".reddit.searchSubreddits").show();
			$("#searchbox").attr("placeholder","Subreddit keywords that you wish to search...");
		}
		
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});

	/* documentation */
	$("#expandDoc").click(function(){
		$("#documentation").toggleClass("expand");
		$("#docIframe").height($(window).height());
		$("#searchPage").toggleClass("shrink");
		
	});
	/*---------------------------------------global search term---------------------------------------------------------------------------*/
	$("#searchbox").change(function(){
		parameters['tweet']['q:'] = $("#searchbox").val();
		parameters['twtUser']['q:'] = $("#searchbox").val();
		parameters['es']['q:'] = $("#searchbox").val();
		parameters['rdComment']['subredditName:'] = $("#searchbox").val();
		parameters['rdSearch']['query:'] = $("#searchbox").val();
		parameters['rdReply']['id:'] = $("#searchbox").val();
		parameters['rdSub']['query:'] = $("#searchbox").val();
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	/*---------------------------------------------query tweet ------------------------------------------------------------------------*/
	// toggle date range checkbox
	$("#dateRange").change(function(){
		
		parameters['tweet']['until:'] = $("#until").val();
		
		if ($("#dateRange").is(':checked')){
			$(".form-group.dateRange").show();
			
			$("#until").change(function(){
				parameters['tweet']['until:'] = $("#until").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
		}else{
			parameters['tweet']['until:'] = '';	
			$(".form-group.dateRange").hide();
		}	
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// toggle geocode checkbox
	$("#geocode").change(function(){
		
		parameters['tweet']['geocode:'] = $("#lat").val() + `,`+ $("#lon").val() + `,`+ $("#radius").val() +`mi`;;
		
		if ($("#geocode").is(':checked')){
			$(".form-group.geocode").show();
			
			lat = lon = radius = '';
			$("#lat").change(function(){
				lat = $("#lat").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#lon").change(function(){
				lon = $("#lon").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#radius").change(function(){
				radius = $("#radius").val();
				parameters['tweet']['geocode:'] = lat + `,`+ lon + `,`+ radius +`mi`;
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			})
		
		}else{
			parameters['tweet']['geocode:'] = '';
			$(".form-group.geocode").hide();
		}
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// tweet
	$("#tweet-count").change(function(){
		parameters['tweet']['count:'] = parseInt($("#tweet-count").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#max_pages").change(function(){
		parameters['tweet']['pages:'] = parseInt($("#max_pages").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#twtTweetFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:['text'],AuthorInformation:[],TweetEntities:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		
		if(fields['BasicFields'].length !== 0){
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if (fields['AuthorInformation'].length !== 0){
			fields_string += '\n\t\t\tuser{' ;
			$.each(fields['AuthorInformation'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
		if (fields['TweetEntities'].length !== 0){
			fields_string += '\n\t\t\tentities{' ;
			$.each(fields['TweetEntities'],function(i,val){
				if (val === 'user_mentions'){
					fields_string += '\n\t\t\t\tuser_mentions{\n\t\t\t\t\tauthor_id\n\t\t\t\t\tscreen_name\n\t\t\t\t}';
				}else{
					fields_string += '\n\t\t\t\t' + val;
				}
			});
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['tweet']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});		
	
	
	/*---------------------------------------------Elastic search ----------------------------------------------------------------------*/
	// toggle es date range checkbox
	$("#es-dateRange").change(function(){
		parameters['es']['startDate:'] = $("#start").val();
		parameters['es']['endDate:'] = $("#end").val();
		
		if ($("#es-dateRange").is(':checked')){
			$(".form-group.es-dateRange").show();
			
			$("#start").change(function(){
				parameters['es']['startDate:'] = $("#start").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#end").change(function(){
				parameters['es']['endDate:'] = $("#end").val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
		}else{
			parameters['es']['startDate:']='';
			parameters['es']['endDate:']  = '';
			$(".form-group.es-dateRange").hide();
		}	
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// toggle es-geocode checkbox
	$("#es-geocode").change(function(){
		parameters['es']['lat:'] =  parseFloat($("#es-lat").val());
		parameters['es']['lon:'] =  parseFloat($("#es-lon").val());
		parameters['es']['distance:'] =  $("#es-radius").val().toString() + 'mi';
		
		if ($("#es-geocode").is(':checked')){
			$(".form-group.es-geocode").show();

			$("#es-lat").change(function(){
				parameters['es']['lat:'] =  parseFloat($("#es-lat").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#es-lon").change(function(){
				parameters['es']['lon:'] =  parseFloat($("#es-lon").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#es-radius").change(function(){
				parameters['es']['distance:'] =  $("#es-radius").val().toString() + 'mi';
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			})
		
		}else{
			parameters['es']['lat:'] =  ''
			parameters['es']['lon:'] =  ''
			parameters['es']['distance:'] =  ''
			$(".form-group.es-geocode").hide();
		}
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	//toggle es-popularity checkbox
	$("#es-popularity").change(function(){
		parameters['es']['followers_count:'] = parseInt($("#followers_count").val());
		parameters['es']['statuses_count:'] =  parseInt($("#statuses_count").val());
		if ($("#es-popularity").is(':checked')){
			$(".form-group.es-popularity").show();
			
			$("#followers_count").change(function(){
				parameters['es']['followers_count:'] = parseInt($("#followers_count").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#statuses_count").change(function(){
				parameters['es']['statuses_count:'] =  parseInt($("#statuses_count").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
		
		}else{
			parameters['es']['followers_count:'] = '';
			parameters['es']['statuses_count:'] =  '';
			$(".form-group.es-popularity").hide();
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	// perPage
	$("#perPage").change(function(){
		parameters['es']['perPage:'] = parseInt($("#perPage").val());
		Query =updateString(queryTerm,parameters);
		//console.log(Query);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// pageNum
	/*$("#pageNum").change(function(){
		parameters['es']['pageNum:'] =  parseInt($("#pageNum").val());
		Query =updateString(queryTerm,parameters);
		//console.log(Query);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});*/
	
	$("#twtStreamFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:['text'],ElasticSearchMetadata:[],AuthorInformation:[],GeoLocation:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		if (fields['ElasticSearchMetadata'].length !== 0){
			$.each(fields['ElasticSearchMetadata'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if(fields['BasicFields'].length !== 0){
			fields_string += '\n\t\t\t_source{' ;
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
		
			if (fields['AuthorInformation'].length !== 0){
				fields_string += '\n\t\t\t\tuser{' ;
				$.each(fields['AuthorInformation'],function(i,val){
					fields_string += '\n\t\t\t\t\t' + val;
				});
				fields_string += '\n\t\t\t\t}' ;
			}
			if (fields['GeoLocation'].length !== 0){
				fields_string += '\n\t\t\t\tcoordinates{' ;
				$.each(fields['GeoLocation'],function(i,val){
					fields_string += '\n\t\t\t\t\t' + val;
				});
				fields_string += '\n\t\t\t\t}' ;
			}
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['es']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});		
	
	
	/*----------------------------------------------------- twitter user-------------------------------------------------------*/
	$("#twtUser-count").change(function(){
		parameters['twtUser']['count:'] = parseInt($("#twtUser-count").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	/*$("#max_pages_user").change(function(){
		parameters['twtUser']['pages:'] = parseInt($("#max_pages_user").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});*/
	$("#twtUserFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[],UserTimeline:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
		});
		
		if(fields['BasicFields'].length !== 0){
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}
		if (fields['UserTimeline'].length !== 0){
			fields_string += '\n\t\t\ttimeline(count:1){' ;
			$.each(fields['UserTimeline'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['twtUser']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
		
		
	});
	
	//-----------------------------------------------reddit getNewComments----------------------------------------------------------------
	$("#reddit_extra").change(function(){
		parameters['rdComment']['extra:'] = parseInt($("#reddit_extra").val());
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	//reddit comments
	$("#rdCommentFields").change(function(){
		fields = '';
		$.each($("#rdCommentFields").val(),function(i,val){
			fields += '\n\t\t\t' + val;
		});
		parameters['rdComment']['fields'] = fields;
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	//-----------------------------------------------reddit search content------------------------------------------------------------------
	$("#reddit_count").change(function(){
		parameters['rdSearch']['count:'] = parseInt($("#reddit_count").val());
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	//reddit search Content
	$("#rdSearchFields").change(function(){ 
		fields_string = '';
		fields = {BasicFields:[],Replies:[]};
			
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);	  		
		});
		
		if(fields['BasicFields'].length !== 0){
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t' + val;
				});
		}
		
		if (fields['Replies'].length !== 0){
			fields_string += '\n\t\t\treplies{' ;
			$.each(fields['Replies'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
 	
		parameters['rdSearch']['fields'] = fields_string;
  		Query = updateString(queryTerm,parameters);	
  		$("#input").val(`{\n\n` + Query +`\n\n}`);		
  	});
	
	$("#time").change(function(){
		parameters['rdSearch']['time:'] = $("#time").val();
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#sort").change(function(){
		parameters['rdSearch']['sort:'] = $("#sort").val();
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	//---------------------------------------------reddit Search subreddits----------------------------------------------------------------
	$("#rdSubFields").change(function(){
		fields = '';
		$.each($("#rdSubFields").val(),function(i,val){
			fields += '\n\t\t\t' + val;
		});
		parameters['rdSub']['fields'] = fields;
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	//------------------------------------------ reddit getCompleteReplies-----------------------------------------------------------------
	$("#rdReplyFields").change(function(){
		fields = '';
		$.each($("#rdReplyFields").val(),function(i,val){
			fields += '\n\t\t\t' + val;
		});
		parameters['rdReply']['fields'] = fields;
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	
	
}

function constructQuery(parameterObj){
	//console.log(parameterObj);
	var keys = [];
	$.each(Object.keys(parameterObj),function(i,item){
		if (item !== 'fields' && parameterObj[item] !== ''){
			keys.push(item);
		}
	});
	
	var query = '';
	$.each(keys, function(i,key){
		if (typeof parameterObj[key] === 'string'){
			query += key + `"` + parameterObj[key] + `"`;
		}else{
			query += key + parameterObj[key];
		}
	
		if (i!==keys.length-1){
			query += `,`;
		}
	});
	
	query +=  `){` + parameterObj.fields;

	return query;

}
		
function updateString(queryTerm,parameters){
	var query = '';
	if (queryTerm == 'queryUser'){
		
		query = `\ttwitter{\n\t\t`	+ queryTerm + `(` +  constructQuery(parameters.twtUser) +  `\n\t\t}\n\t}`;
		
	}else if(queryTerm == 'queryTweet'){ 
		
		query =  `\ttwitter{\n\t\t`	+ queryTerm + `(`+ constructQuery(parameters.tweet)	+ `\n\t\t}\n\t}`;  
		
	}else if (queryTerm === 'streamTweet'){
		
		query =  `\telasticSearch{\n\t\t`+ queryTerm + `(`+  constructQuery(parameters.es) +  `\n\t\t}\n\t}`;  
			
	}else if (queryTerm == 'getNewComments'){
		
		query =  `\treddit{\n\t\t`	+ queryTerm + `(`+ constructQuery(parameters.rdComment)	+  `\n\t\t}\n\t}`;
			
	}else if(queryTerm == 'searchSubreddits'){
		
		query =  `\treddit{\n\t\t`	+ queryTerm + `(`+ constructQuery(parameters.rdSub)	+  `\n\t\t}\n\t}`;
		
	}else if(queryTerm ==='getCompleteReplies'){
		
		query =  `\treddit{\n\t\t` + queryTerm + `(`+ constructQuery(parameters.rdReply)+  `\n\t\t}\n\t}`;
			
	}else if(queryTerm === 'searchContent'){
		
		query =  `\treddit{\n\t\tsearch(`+ constructQuery(parameters.rdSearch)+  `\n\t\t}\n\t}`;

	}
	
	return query;
}


// on key down for search box and save box
$('document').ready(function(){
	$("#searchbox").keypress(function(e){
		if (e.which == 13){
			modalPopUp("#searchbox");
		}
	});
	
	$("#simple-search-btn").click(function(e){
		modalPopUp("#searchbox");
		$("#filename").focus();
	});
	
});