function submitQuery(textareaID,filenameID){
	// once the button is hit, disable the submit button until data comes back later!!
	
	$(".loading").show();
	
	var queryString = $(textareaID).val();
	var queryTerm = $("#social-media").find(':selected').val();
	var filename = $(filenameID).val();
	
	if (queryTerm === 'queryTweet'){
		var prefix = 'twitter-Tweet';
		var params = parameters.tweet;
		var pages = -999;
	}else if (queryTerm === 'queryUser'){
		var prefix = 'twitter-User' ;
		var params = parameters.twtUser;
		var pages = parseInt($("#twtUser-count").val())/20;
		//var pages = parameters['twtUser']['pageNum:'] 	
	}else if (queryTerm === 'streamTweet'){
		var prefix = 'twitter-Stream'
		var params = parameters.es;
		var pages = parseInt($("#perPage").val())/1000;
		//var pages = parameters['es']['pageNum:'];	
	}else if (queryTerm === 'queryReddit'){
		var prefix = 'reddit-Search';
		var params = parameters.rdSearch ;	
		var pages = 10;		
	}else if (queryTerm === 'redditPost'){
		var prefix = 'reddit-Post';
		var params = parameters.rdPost ;	
		var pages = -999;		
	}else if (queryTerm === 'redditComment'){
		var prefix = 'reddit-Comment';
		var params = parameters.rdComment ;	
		var pages = -999;		
	}else if (queryTerm === 'pushshiftPost'){
		var prefix = 'reddit-Historical-Post';
		var params = parameters.psPost ;	
		var pages = -999;		
	}else if (queryTerm === 'pushshiftComment'){
		var prefix = 'reddit-Historical-Comment';
		var params = parameters.psComment ;	
		var pages = -999;		
	}
	
	$.ajax({
		url:"query",
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
									author_lang
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
								  author_lang
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
									  author_lang
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
		
	}else if (queryTerm === 'queryReddit'){
		var queryString = `{
								reddit{
								search(query:"` + keyword +`",time:"all",sort:"relevance"){
								  archived
								  author_name
								  brand_safe
								  contest_mode
								  clicked
								  created
								  created_utc
								  domain
								  downs
								  edited
								  gilded
								  hidden
								  hide_score
								  id
								  is_self
								  locked
								  name
								  over_18
								  permalink
								  quarantine
								  saved
								  score
								  stickied
								  spoiler
								  subreddit_display_name
								  subreddit_id
								  subreddit_type
								  subreddit_name_prefixed
								  title
								  url
								  ups
								  visited
								}
							  }
							}`;
		var filename = $(filenameID).val();
		var prefix = 'reddit-Search';
		var pages = 10;
		var params = parameters.rdSearch;
	}else if (queryTerm === 'redditPost'){
		var queryString = `{
							  reddit {
								getNew(subredditName:"`+ keyword + `", extra: 2000) {
								  archived
								  author_name
								  brand_safe
								  contest_mode
								  clicked
								  created
								  created_utc
								  domain
								  downs
								  edited
								  gilded
								  hidden
								  hide_score
								  id
								  is_self
								  locked
								  name
								  over_18
								  permalink
								  quarantine
								  saved
								  score
								  stickied
								  spoiler
								  subreddit_display_name
								  subreddit_id
								  subreddit_type
								  subreddit_name_prefixed
								  title
								  url
								  ups
								  visited
								}
							  }
							}`;
		var filename = $(filenameID).val();
		var prefix = 'reddit-Post';
		var pages = -999;
		var params = parameters.rdPost;
	}else if (queryTerm === 'pushshiftPost'){
		var queryString = `{
								reddit{
									pushshiftPost(q:"`+ keyword + `"){
										_id
										_type
										_index
										_score
										_source{
											author_name
											created_utc
											domain
											id
											is_self
											locked
											num_comments
											over_18
											permalink
											full_link
											pinned
											retrieved_on
											score
											stickied
											spoiler
											subreddit_display_name
											subreddit_id
											subreddit_name_prefixed
											title
											url
										}
									}
								}
							}`;
		var filename = $(filenameID).val();
		var prefix = 'reddit-Historical-Post';
		var pages = -999;
		var params = parameters.psPost;
	}else if (queryTerm === 'redditComment'){
		var queryString = `{
							reddit{
							getNewComments(subredditName:"`+keyword + `",extra:2000){
							  comment_author_name
							  archived
							  body
							  body_html
							  subreddit_display_name
							  created_utc
							  comment_created
							  controversiality
							  comment_downs
							  edited
							  gilded
							  comment_id
							  link_id
							  link_author
							  link_title
							  link_permalink
							  link_url
							  comment_over_18
							  parent_id
							  quarantine
							  saved
							  comment_score
							  subreddit_id
							  subreddit_display_name
							  subreddit_name_prefixed
							  score_hidden
							  stickied
							  subreddit_type
							  comment_ups
							}
						  }
						}`;
		var filename = $(filenameID).val();
		var prefix = 'reddit-Comment';
		var pages = -999;
		var params = parameters.rdComment;
	}else if (queryTerm === 'pushshiftComment'){
		var queryString = `{
							  reddit {
								pushshiftComment(q: "`+ keyword + `") {
								  comment_author_name
								  author_flair_text
								  author_flair_css_class
								  body
								  comment_created
								  id
								  link_id
								  parent_id
								  comment_score
								  subreddit_display_name
								  subreddit_name_prefixed
								  subreddit_id
								}
							  }
							}`;
		var filename = $(filenameID).val();
		var prefix = 'reddit-Historical-Comment';
		var pages = -999;
		var params = parameters.psComment;
	}
	
	$.ajax({
		url:"query",
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
	$("#modal-download").append(`<ul style="margin:5px 5px;"><form action='download' name='download' method='post'>
						<input type="hidden" value=`+data.URL+` name="downloadURL" /><button type="submit" class="link-button"><span class="glyphicon glyphicon-download-alt"></span> `
						+'DOWNLOAD ' + data.fname+`</button></form></ul>`);
	$("#success").modal('show');
	
	// construct previews
	$("#grid").empty();
	$("#grid").append(`<div style="align-item:left;margin-top:100px;">
									<button class="btn btn-default" id="togglePreview" onclick="togglepreview();"><span id="togggleIcon" class="glyphicon glyphicon-minus style="position:inherit;"></span>Preview</button>
									<button class="btn btn-primary" id="export" onclick="showSuccess();"><span class="glyphicon glyphicon-export" style="position:inherit;"></span>Export</button>
									
								</div>
								<div id="grid"></div>`)
	if (prefix === 'twitter-Tweet' || prefix === 'twitter-Stream'){
		$.each(data.rendering, function(i,val){
			
			if (val.user !== undefined){
				var img_url = val.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val.user.name || 'Not Provided';
				var screen_name =  val.user.screen_name || 'Not Provided';
			}else if (val._source.user !== undefined){
				var img_url = val._source.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val._source_user.name || 'Not Provided';
				var screen_name =  val._source.user.screen_name || 'Not Provided';
			}else{	
				var img_url = 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = 'Not Provided';
				var screen_name = 'NotProvided';
			}
			
			var created_at = val.created_at || val._source.created_at || 'Not Provided' ;
			
			if (val.retweet_count !== undefined){
				var retweet_count = val.retweet_count || 'Not Provided';
			}else if (val._source.retweet_count !== undefined ){
				var retweet_count = val._source.retweet_count || 'Not Provided';
			}else{
				var retweet_count = 'Not Provided';
			}
			
			if (val.favorite_count !== undefined){
				var favorite_count = val.favorite_count ||'Not Provided';
			}else if (val._source.favorite_count !== undefined){
				var favorite_count = val._source.favorite_count || 'Not Provided';
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
									<p style="margin-top:10px;"><span class="glyphicon glyphicon-retweet" style="position:inherit;"></span>&nbsp;`+ retweet_count + 
									`&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-heart" style="position:inherit;"></span>&nbsp;` +favorite_count +`</p>
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
	}else if (prefix === 'reddit-Search' || prefix === 'reddit-Post' || prefix === 'reddit-Historical-Post'){
		$.each(data.rendering, function(i,val){
			var author_name = val.author_name || val._source.author_name || 'Not Provided';
			var subreddit_name_prefixed = val.subreddit_name_prefixed || val._source.subreddit_name_prefixed || 'NotProvided';
			var url = val.url || val._source.url || 'Not Provided';
			var title = val.title || val._source.title || 'Not Provided';
			var permalink = val.permalink || val._source.permalink || 'Not Provided';
			var score = val.score || val._source.score || 'Not Provided';
			if (val.created_utc !== undefined){
				var created_utc = timeConverter(val.created_utc);
			}else if (val._source.created_utc !== undefined){
				var created_utc = timeConverter(val._source.created_utc);
			}else{
				var created_utc = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
					<div style="margin-top:10px;">
						<p style="display:inline;font-size:15px;"><b>` + author_name + `‏</b></p> 
						<p style="display:inline;color:green;">&nbsp;&bull;`+ subreddit_name_prefixed + `</p>
						<p style="display:inline;color:grey;">&nbsp;&bull;` + created_utc + `</p>
					</div>
					<a target="_blank" href="` + url + `" style="margin-top:10px;display:block;">`+ title + `</a>
					<a target="_blank" href="https://www.reddit.com` + permalink + `" style="margin-top:20px;margin-bottom:20px;display:block;color:black;">Go to this Reddit Thread
						<span class="glyphicon glyphicon-share-alt" style="position:inherit;"></span></a>
					<p style="margin-top:10px;"><span class="glyphicon glyphicon-heart" style="position:inherit;"></span>`+score +`</p>
				</div>`);
				
		});
	}else if (prefix === 'reddit-Comment' || prefix === 'reddit-Historical-Comment'){
		$.each(data.rendering, function(i,val){
			var author_name = val.comment_author_name || 'Not Provided';
			var subreddit_name_prefixed = val.subreddit_name_prefixed || 'NotProvided';
			var body = val.body || 'Not Provided';
			if (body.length >= 300){
				body = body.slice(0,300) + '...';
			}
			var permalink = val.link_permalink || 'Not Provided';
			var score = val.comment_score || 'Not Provided';
			if (val.comment_created !== undefined){
				var created_utc = timeConverter(val.comment_created);
			}else{
				var created_utc = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
					<div style="margin-top:10px;">
						<p style="display:inline;font-size:15px;"><b>` + author_name + `‏</b></p> 
						<p style="display:inline;color:green;">&nbsp;&bull;`+ subreddit_name_prefixed + `</p>
						<p style="display:inline;color:grey;">&nbsp;&bull;` + created_utc + `</p>
					</div>
					<p style="margin-top:10px;display:block;color:#428bca;">`+ body + `</p>
					<a target="_blank" href="` + permalink + `" style="margin-top:20px;margin-bottom:20px;display:block;color:black;">Go to this Reddit Thread
						<span class="glyphicon glyphicon-share-alt" style="position:inherit;"></span></a>
					<p style="margin-top:10px;"><span class="glyphicon glyphicon-heart" style="position:inherit;"></span>`+score +`</p>
				</div>`);
				
		});
	}
		
	
	$("#grid").show();

}

	
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
