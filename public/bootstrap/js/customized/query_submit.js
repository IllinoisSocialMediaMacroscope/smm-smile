function submitQuery(textareaID,filenameID){
	$(".loading").show();
	
	var queryString = $(textareaID).val();
	
	var queryTerm = $("#social-media").find(':selected').val();
	if (queryTerm === 'queryTweet'){
		var filename = 'twitter-queryTweet-' + $(filenameID).val();
		var params = parameters.tweet;
		var pages = -999;
	}else if (queryTerm === 'queryUser'){
		var filename = 'twitter-queryUser-' + $(filenameID).val();
		var params = parameters.twtUser;	
		var pages = $("#max_pages_user").val();		
	}else if (queryTerm === 'streamTweet'){
		var filename = 'twitter-streaming-' + $(filenameID).val();
		var params = parameters.es;
		var pages = $("#pageNum").val();
	}else if (queryTerm ==='searchSubreddits'){
		var filename = 'reddit-searchSubreddits-' + $(filenameID).val();
		var params = parameters.rdSub;		
	}else if (queryTerm === 'searchContent'){
		var filename = 'reddit-search-' + $(filenameID).val();
		var params = parameters.rdSearch;		
	}else if (queryTerm === 'getNewComments'){
		var filename = 'reddit-getNewComments-' + $(filenameID).val();		
		var params = parameters.rdComment;
	}else if (queryTerm === 'getCompleteReplies'){
		var filename = 'reddit-getCompleteReplies-' + $(filenameID).val();	
		var params = parameters.rdReply;
	}
	
	$.ajax({
		url:"/query",
		type:"post",
		data:{"query":queryString,"filename":filename,"params":JSON.stringify(params),"pages":pages},
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
								queryTweet(q: "trump", count: 10) {
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
		var filename = 'twitter-queryTweet-' + $(filenameID).val();
		var params = parameters.tweet;
		var pages = -999;
	}else if (queryTerm === 'queryUser'){
		var queryString = `{
							  twitter{
								queryUser(q:"Trump"){
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
		var filename = 'twitter-queryUser-' + $(filenameID).val();					
		var params = parameters.twtUser;			
		var pages = 90;
		
	}else if (queryTerm === 'streamTweet'){
		var queryString = `{
							  elasticSearch {
								streamTweet(q:"@ronniecexo", perPage: 10) {
								  _source {
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
		var filename = 'twitter-streaming-' + $(filenameID).val();
		var params = parameters.es;
		var pages = 10;
		
	}else if (queryTerm ==='searchSubreddits'){
		var queryString=`{
							reddit{
								searchSubreddits(query: "`+ keyword +`") {
								  header_img
								  header_title
								  over18
								  public_description
								  created
								  description
								  display_name
								  subscribers
								  subreddit_type
								  title
								  url
								}
							  }
						}`
		var filename = 'reddit-searchSubreddits-' + $(filenameID).val();					
		var params = parameters.rdSub;				
	}else if (queryTerm === 'searchContent'){
		var queryString = `{
							reddit{
									search(query: "`+ keyword + `", time: "all", sort: "relevance", count:1000) {
									  id
									  author_name
									  created
									  name
									  num_reports
									  num_comments
									  over_18
									  permalink
									  score
									  selftext
									  subreddit_id
									  subreddit_name_prefixed
									  thumbnail
									  title
									  url
									  ups
									}
								}
						}`
		var filename = 'reddit-search-' + $(filenameID).val();				
		var params = parameters.rdSearch;
	}else if (queryTerm === 'getNewComments'){
		var queryString = `{
							reddit{
									getNewComments(subredditName:"` +keyword+`",extra:1000){
									  comment_author_name
									  body
									  comment_created
									  controversiality
									  comment_downs
									  comment_id
									  link_url
									  link_permalink
									  likes
									  comment_name
									  comment_num_comments
									  comment_num_reports
									  comment_over_18
									  parent_id
									  comment_score
									  subreddit_id
									  subreddit_display_name
									  subreddit_name_prefixed
									  subreddit_type
									  comment_ups
									}
								  }
							}`
		var filename = 'reddit-getNewComments-' + $(filenameID).val();						
		var params = parameters.rdComment;				
	}else if (queryTerm === 'getCompleteReplies'){
		var queryString = `{
							reddit{
									getCompleteReplies(id:"`+ keyword+	`"){
									  comment_author_name
									  body
									  comment_created
									  controversiality
									  comment_downs
									  comment_id
									  link_url
									  link_permalink
									  likes
									  comment_name
									  comment_num_comments
									  comment_num_reports
									  comment_over_18
									  parent_id
									  comment_score
									  subreddit_id
									  subreddit_display_name
									  subreddit_name_prefixed
									  subreddit_type
									  comment_ups
									}
								  }
						}`
		var filename = 'reddit-getCompleteReplies-' + $(filenameID).val();	
		var params = parameters.rdReply;
	}
	//params['keyword'] = parameters.keyword;
	
	$.ajax({
		url:"/query",
		type:"post",
		data:{"query":queryString,"filename":filename,"params":JSON.stringify(params),"pages":pages},
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

	

/* save file modal */
function modalPopUp(searchID){
	
	// form validation! once it pass, popup modal
	if ( formValid(searchID)){
	
		$("#save").modal('show');
		$("#filename").focus();
		
		if (searchID === '#searchbox'){
			$("#saveButton").click(function(){
				if (saveValid('#filename')){ 
					submitSearchbox(`#searchbox`,`#filename`)
				}
			});
			
			$("#filename").keypress(function(e){
				if (e.which == 13 && saveValid('#filename')){ 
					submitSearchbox(`#searchbox`,`#filename`)
				}
			});
		}else if (searchID === '#input'){
			$("#saveButton").click(function(){
				if (saveValid('#filename')){
					submitQuery(`#input`,`#filename`);
				}
			});
			
			$("#filename").keypress(function(e){
				if (e.which == 13 && saveValid('#filename')){
					submitQuery(`#input`,`#filename`);
				}
			});
		}
	}
	
}

