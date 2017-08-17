function submitQuery(textareaID,filenameID){
	// once the button is hit, disable the submit button until data comes back later!!
	
	$(".loading").show();
	
	var queryString = $(textareaID).val();
	
	var queryTerm = $("#social-media").find(':selected').val();
	if (queryTerm === 'queryTweet'){
		var filename =  $(filenameID).val();
		var prefix = 'twitter-Tweet';
		var params = parameters.tweet;
		var pages = -999;
	}else if (queryTerm === 'queryUser'){
		var filename = $(filenameID).val();
		var prefix = 'twitter-User' ;
		var params = parameters.twtUser;
		var pages = parseInt($("#twtUser-count").val())/20;
		//var pages = parameters['twtUser']['pageNum:'] 	
	}else if (queryTerm === 'streamTweet'){
		var filename = $(filenameID).val();
		var prefix = 'twitter-Stream'
		var params = parameters.es;
		var pages = parseInt($("#perPage").val())/1000;
		//var pages = parameters['es']['pageNum:'];	
	}
	
	$.ajax({
		url:"/query",
		type:"post",
		data:{"query":queryString,
				"filename":filename,
				"params":JSON.stringify(params),
				"pages":pages,
				"prefix":prefix
			},
		success:function(data){
			// if error then prompt user to rename
			if ('ERROR' in data){				
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
					
					$(".loading").hide();
			}else if ('URL' in data){
				$("#modal-download").empty();
				$("#modal-download").append(`<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
									<input type="hidden" value=`+data.URL[0]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
									+data.fname[0]+`</button></form></ul>
									<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
									<input type="hidden" value=`+data.URL[1]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
									+data.fname[1]+`</button></form></ul>`);
				$("#success").modal('show');
				$("#save").modal('hide');
				$(".loading").hide();
			}
		},
		error: function(jqXHR, exception){
				var msg = '';
				if (jqXHR.status === 0) {
					msg = 'Not connect.\n Verify Network.';
				} else if (jqXHR.status == 404) {
					msg = 'Requested page not found. [404]';
				} else if (jqXHR.status == 500) {
					msg = 'Internal Server Error [500].';
				} else if (exception === 'parsererror') {
					msg = 'Requested JSON parse failed.';
				} else if (exception === 'timeout') {
					msg = 'Time out error.';
				} else if (exception === 'abort') {
					msg = 'Ajax request aborted.';
				} else {
					msg = 'Uncaught Error.\n' + jqXHR.responseText;
				}
				
				$("#error").val(msg);
				$("#warning").modal('show');
				
			}  
	});	
} 

function submitSearchbox(searchboxID, filenameID){
	$(".loading").show();
	var keyword = $(searchboxID).val();
	var queryTerm = $("#social-media").find(':selected').val();
	
	if (queryTerm === 'queryTweet'){
		var queryString = `{
							  twitter {
								queryTweet(q:"` + keyword + `", count: 100,pages:18) {
								  id
								  id_str
								  created_at
								  text
								  retweet_count
								  favorite_count
								  retweeted
								  favorited
								  possibly_sensitive
								  truncated
								  lang
								  in_reply_to_screen_name
								  in_reply_to_user_id_str
								  in_reply_to_status_id_str
								  is_quote_status
								  source
								  user {
									author_id
									author_id_str
									name
									screen_name
									description
									author_created_at
									profile_image_url
									profile_banner_url
									url
									location
									tweets_count
									followers_count
									friends_count
									listed_count
									favourites_count
									statuses_count
									time_zone
									protected
									verified
									is_translator
									contributors_enabled
									geo_enabled
									lang
								  }
								}
							  }
							}
							`
		var filename = $(filenameID).val();
		var prefix = 'twitter-Tweet';
		var pages = 18;
		// parameters['tweet']['pages:'] = 18;
		var params = parameters.tweet;
		
	}else if (queryTerm === 'queryUser'){
		var queryString = `{
							  twitter{
								queryUser(q:"` + keyword + `", count:20){
								  author_id
								  author_id_str
								  name
								  screen_name
								  description
								  author_created_at
								  profile_image_url
								  profile_banner_url
								  url
								  location
								  tweets_count
								  followers_count
								  friends_count
								  listed_count
								  favourites_count
								  statuses_count
								  time_zone
								  protected
								  verified
								  is_translator
								  contributors_enabled
								  geo_enabled
								  lang
								}
							  }
							}`
		var filename = $(filenameID).val();	
		var prefix = 'twitter-User';
		var pages = 90;		
		// parameters['twtUser']['pageNum:'] = pages;
		var params = parameters.twtUser;			
		
		
	}else if (queryTerm === 'streamTweet'){
		var queryString = `{
							  elasticSearch {
								streamTweet(q:"` + keyword + `", perPage: 1000) {
								_id
								_type
								_index
								_score
								_source{
									id
									id_str
									created_at
									text
									retweet_count
									favorite_count
									retweeted
									favorited
									possibly_sensitive
									truncated
									lang
									in_reply_to_user_id_str
									in_reply_to_screen_name
									in_reply_to_status_id_str
									timestamp_ms
									mentions
									hashtags
									urls
									is_quote_status
									emoticons
									source
									sentiments
									filter_level
									coordinates{
									  type
									  lon
									  lat
									}
									user{
									  author_id
									  author_id_str
									  name
									  screen_name
									  description
									  author_created_at
									  profile_image_url
									  profile_banner_url
									  url
									  location
									  tweets_count
									  friends_count
									  listed_count
									  favourites_count
									  statuses_count
									  time_zone
									  protected
									  verified
									  is_translator
									  contributors_enabled
									  geo_enabled
									  lang
									}
								  }
								}
							  }
							}
							`;
		var filename = $(filenameID).val();
		var prefix = 'twitter-Stream';
		var pages = 10;
		// params['es']['pageNum:'] = pages;
		var params = parameters.es;
		
	}
	
	$.ajax({
		url:"/query",
		type:"post",
		data:{"query":queryString,
				"filename":filename,
				"params":JSON.stringify(params),
				"pages":pages,
				"prefix":prefix
			},
		success:function(data){
			if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
					$(".loading").hide();
			}else if ('URL' in data){
				$("#modal-download").empty();
				$("#modal-download").append(`<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
									<input type="hidden" value=`+data.URL[0]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
									+data.fname[0]+`</button></form></ul>
									<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
									<input type="hidden" value=`+data.URL[1]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
									+data.fname[1]+`</button></form></ul>`);
				$("#success").modal('show');
				$("#save").modal('hide');
				$(".loading").hide();
			}
		},
		error: function(jqXHR, exception){
				var msg = '';
				if (jqXHR.status === 0) {
					msg = 'Not connect.\n Verify Network.';
				} else if (jqXHR.status == 404) {
					msg = 'Requested page not found. [404]';
				} else if (jqXHR.status == 500) {
					msg = 'Internal Server Error [500].';
				} else if (exception === 'parsererror') {
					msg = 'Requested JSON parse failed.';
				} else if (exception === 'timeout') {
					msg = 'Time out error.';
				} else if (exception === 'abort') {
					msg = 'Ajax request aborted.';
				} else {
					msg = 'Uncaught Error.\n' + jqXHR.responseText;
				}
			
				$("#error").val(msg);
				$("#warning").modal('show');
				
			} 
	});
}

	



