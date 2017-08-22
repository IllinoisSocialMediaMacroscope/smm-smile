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
			}else{
				renderPreview(data, prefix);
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
			}else{				
				renderPreview(data,prefix);					
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

	
// export button click revoke download modal
function showSuccess(){
	$("#success").modal('show');
}

function togglepreview(){
	if ($(".grid-element").css('display') !== 'none'){
		$(".grid-element").hide('slow');
		$("#togggleIcon").attr('class', 'glyphicon glyphicon-plus');
	}else{
		$(".grid-element").show('slow');
		$("#togggleIcon").attr('class', 'glyphicon glyphicon-minus');
	}
}

function renderPreview(data,prefix){
	
	// hide the saving modal
	$("#save").modal('hide');
	$(".loading").hide();
	
	// append modal-download in the background								
	$("#modal-download").empty();
	$("#modal-download").append(`<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
						<input type="hidden" value=`+data.URL[0]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
						+data.fname[0]+`</button></form></ul>
						<ul style="margin:5px 5px;"><form action='/download' name='download' method='post'>
						<input type="hidden" value=`+data.URL[1]+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
						+data.fname[1]+`</button></form></ul>`);
	$("#success").modal('show');
	
	// construct previews
	$("#grid").empty();
	$("#grid").append(`<div style="align-item:left;margin-top:100px;">
									<button class="btn btn-default" id="togglePreview" onclick="togglepreview();"><span id="togggleIcon" class="glyphicon glyphicon-minus"></span>Preview</button>
									<button class="btn btn-primary" id="export" onclick="showSuccess();"><span class="glyphicon glyphicon-export"></span>Export</button>
									
								</div>
								<div id="grid"></div>`)
	if (prefix === 'twitter-Stream'){
		$.each(data.rendering, function(i,val){
			
			var img_url =  val._source.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
			var user_name =  val._source.user.name || 'Not Provided';
			var screen_name = val._source.user.screen_name || 'NotProvided';
			var created_at =  val._source.created_at || 'Not Provided';
			
			if (val._source.retweet_count !== undefined){
				var retweet_count = val._source.retweet_count;
			}else{
				var retweet_count = 'Not Provided';
			}
			
			if (val._source.favorite_count !== undefined){
				var favorite_count = val._source.favorite_count;
			}else{
				var favorite_count = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img"/>
									<div style="margin-top:10px;">
										<p style="display:inline;font-size:15px;"><b>` + user_name + `‏</b></p> 
										<p style="display:inline;color:green;"><i>&nbsp;&bull;@`+ screen_name + `</i></p>
										<p style="display:inline;color:grey;">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p style="margin-top:10px;">`+ val._source.text + `</p>
									<p style="margin-top:10px;"><span class="glyphicon glyphicon-retweet"></span>`+ retweet_count + 
									`&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-heart"></span>` +favorite_count +`</p>
							</div>`);
		});
	}else if (prefix === 'twitter-Tweet'){
		$.each(data.rendering, function(i,val){
			
			if (val.user === undefined){
				var img_url = 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = 'Not Provided';
				var screen_name = 'NotProvided';
			}else{
				var img_url = val.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val.user.name || 'Not Provided';
				var screen_name =  val.user.screen_name || 'NotProvided';
			}
			var created_at = val.created_at || 'Not Provided' ;
			
			if (val.retweet_count !== undefined){
				var retweet_count = val.retweet_count;
			}else{
				var retweet_count = 'Not Provided';
			}
			
			if (val.favorite_count !== undefined){
				var favorite_count = val.favorite_count;
			}else{	
				var favorite_count = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img"/>
									<div style="margin-top:10px;">
										<p style="display:inline;font-size:15px;"><b>` + user_name + `‏</b></p> 
										<p style="display:inline;color:green;"><i>&nbsp;&bull;@`+ screen_name + `</i></p>
										<p style="display:inline;color:grey;">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p style="margin-top:10px;">`+ val.text + `</p>
									<p style="margin-top:10px;"><span class="glyphicon glyphicon-retweet"></span>&nbsp;`+ retweet_count + 
									`&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-heart"></span>&nbsp;` +favorite_count +`</p>
							</div>`);
		});
	}else if (prefix === 'twitter-User'){
		$.each(data.rendering, function(i,val){
			
			var img_url = val.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
			var user_name = val.name || 'Not Provided';
			var screen_name = val.screen_name || 'NotProvided';
			var created_at = val.author_created_at || 'Not Provided';
			var url = val.url || 'Not Provided';
			var description = val.description || 'Not Provided';
			
			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img"/>
									<div style="margin-top:10px;">
										<p style="display:inline;font-size:15px;"><b>` + user_name + `‏</b></p> 
										<p style="display:inline;color:green;"><i>&nbsp;&bull;@`+ screen_name + `</i></p>
										<p style="display:inline;color:grey;">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p style="margin-top:10px;">`+ description + `<br><a href="` + url + `">`+ url + `</a></p>
							</div>`);
		});
	}
	
	$("#grid").show();

}
