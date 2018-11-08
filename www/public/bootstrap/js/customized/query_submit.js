function submitQuery(textareaID,filenameID){
	currPreviewNum = 0;
	
	// clear out preview and histogram here
	$("#img-container").empty();
	$("#grid").empty();
	
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
	
	if (s3FolderName == undefined) s3FolderName = 'local';
	$.ajax({
		url:"query",
		type:"post",
		data:{"query":queryString,
				"filename":filename,
				"params":JSON.stringify(params),
				"pages":pages,
				"prefix":prefix,
				"s3FolderName":s3FolderName
			},
		success:function(data){
			// if error then prompt user to rename
			$(".loading").hide();
			if ('ERROR' in data){				
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
			}else{
				renderDownload(data.URLs, data.fname)
				renderPreview(data.rendering, prefix);
				if ('histogram' in data){
					$("#histogram-panel").show();
					renderHistogram(data.histogram);
				}
			}
		},
		error: function(jqXHR, exception){
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');
			}  
	});	
} 

function submitSearchbox(searchboxID, filenameID){
	currPreviewNum = 0;
	
	// clear out preview and histogram here
	$("#img-container").empty();
	$("#grid").empty();
	$(".loading").show();
	
	// escape doule quotation mark
	var keyword = $(searchboxID).val();
	var keyword = keyword.replace(/[\"]+/g, `\\"`);	
	
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
								  link_flair_text
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
								  link_flair_text
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
	
	if (s3FolderName == undefined) s3FolderName = 'local';
	$.ajax({
		url:"query",
		type:"post",
		data:{"query":queryString,
				"filename":filename,
				"params":JSON.stringify(params),
				"pages":pages,
				"prefix":prefix,
				"s3FolderName":s3FolderName
			},
		success:function(data){
			$(".loading").hide();
			if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
			}else{
				renderDownload(data.URLs, data.fname)
				renderPreview(data.rendering, prefix);
				if ('histogram' in data){
					$("#histogram-panel").show();
					renderHistogram(data.histogram);
				}
			}
		},
		error: function(jqXHR, exception){	
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');
			} 
	});
}

function renderHistogram(histogram){
	$("#img-container").append(`<div class="x_content">
									<div class="note">
										<li><b>click, drag, and mouseover</b> the graph will give you more information</li>
										<li><b>hover</b> over top-right corner of the chart will present various operations</li>
										<li>details please consult 
											<a href="https://plot.ly/" target="_blank">
												<img src="bootstrap/img/logo/plotly.png" width="18px"/>Plotly
											</a>
										</li>
									</div>
								</div>
								<div class="x_content">`+histogram+`</div>`);
}

function renderDownload(URLs, fname){
	// hide the saving modal
	$("#save").modal('hide');
		
	// append modal-download in the background								
	$("#modal-download").empty();
	$("#modal-download").append(`<ul style="margin:5px 5px;">
									<a href="` + URLs[0] + `" style="color:red;"><span class="glyphicon glyphicon-download-alt"></span>`+ `DOWNLOAD ` +  fname + `</a>
									<p hidden>` + URLs[1] +`</p>
								</ul>`);
	$("#success").modal('show');
	
	$("#rendering").find('a[class="btn btn-info"]').attr('href',URLs[0]);
}

function renderPreview(rendering,prefix){
	// construct previews
	if (prefix === 'twitter-Tweet' || prefix === 'twitter-Stream'){
		$.each(rendering, function(i,val){
			if (val.user !== undefined){
				var img_url = val.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val.user.name || 'Not Provided';
				var screen_name =  val.user.screen_name || 'Not Provided';
			}else if (val._source !== undefined && val._source.user !== undefined){
				var img_url = val._source.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val._source.user.name || 'Not Provided';
				var screen_name =  val._source.user.screen_name || 'Not Provided';
			}else{	
				var img_url = 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = 'Not Provided';
				var screen_name = 'NotProvided';
			}
			
			var created_at = val.created_at || val._source.created_at || 'Not Provided' ;
			
			if (val.retweet_count !== undefined){
				var retweet_count = val.retweet_count;
			}else if (val._source !== undefined){
				var retweet_count = val._source.retweet_count || 'Not Provided';
			}else{
				var retweet_count = 'Not Provided';
			}
			
			if (val.favorite_count !== undefined){
				var favorite_count = val.favorite_count;
			}else if (val._source !== undefined){
				var favorite_count = val._source.favorite_count || 'Not Provided';
			}else{
				var favorite_count = 'Not Provided';
			}
			
			if (val.text !== undefined){
				var text = val.text;
			}else if (val._source !== undefined){
				var text = val._source.text || 'Not Provided';
			}else{
				var text = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img"/>
									<div style="margin-top:10px;">
										<p style="display:inline;font-size:15px;"><b>` + user_name + `‏</b></p> 
										<p style="display:inline;color:green;"><i>&nbsp;&bull;@`+ screen_name + `</i></p>
										<p style="display:inline;color:grey;">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p style="margin-top:10px;">`+ text + `</p>
									<p style="margin-top:10px;"><span class="glyphicon glyphicon-retweet" style="position:inherit;"></span>&nbsp;`+ retweet_count + 
									`&nbsp;&nbsp;&nbsp;&nbsp;<span class="glyphicon glyphicon-heart" style="position:inherit;"></span>&nbsp;` +favorite_count +`</p>
							</div>`);
		});
	}
	
	else if (prefix === 'twitter-User'){
		$.each(rendering, function(i,val){
			
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
	
	else if (prefix === 'reddit-Search' || prefix === 'reddit-Post' || prefix === 'reddit-Historical-Post'){
		$.each(rendering, function(i,val){
			
			if (val.author_name !== undefined){
				var author_name = val.author_name;
			}else if (val._source !== undefined){
				var author_name = val._source.author_name || 'Not Provided';
			}else{
				var author_name = 'Not Provided';
			}
			
			if (val.subreddit_name_prefixed !== undefined){
				var subreddit_name_prefixed = val.subreddit_name_prefixed;
			}else if (val._source !== undefined){
				var subreddit_name_prefixed = val._source.subreddit_name_prefixed || 'Not Provided';
			}else{
				var subreddit_name_prefixed = 'Not Provided';
			}
			
			if (val.url !== undefined){
				var url = val.url;
			}else if (val._source !== undefined){
				var url = val._source.url || 'Not Provided';
			}else{
				var url = 'Not Provided';
			}
			
			if (val.title !== undefined){
				var title = val.title;
			}else if (val._source !== undefined){
				var title = val._source.title || 'Not Provided';
			}else{
				var title = 'Not Provided';
			}
			
			if (val.permalink !== undefined){
				var permalink = val.permalink;
			}else if (val._source !== undefined){
				var permalink = val._source.permalink || 'Not Provided';
			}else{
				var permalink = 'Not Provided';
			}
			
			if (val.score !== undefined){
				var score = val.score;
			}else if (val._source !== undefined){
				var score = val._source.score || 'Not Provided';
			}else{
				var score = 'Not Provided';
			}
			
			if (val.created_utc !== undefined){
				var created_utc = timeConverter(val.created_utc);
			}else if (val._source !== undefined && val._source.created_utc !== undefined){
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
					<img src="` + url + `" height="120px"/>
					<a target="_blank" href="https://www.reddit.com` + permalink + `" style="margin-top:20px;margin-bottom:20px;display:block;">`
						+ title + `</a>
					<p style="margin-top:10px;"><span class="glyphicon glyphicon-heart" style="position:inherit;"></span>`+score +`</p>
				</div>`);
				
		});
	}else if (prefix === 'reddit-Comment' || prefix === 'reddit-Historical-Comment'){
		$.each(rendering, function(i,val){
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
		
	
	$("#rendering").show();

}

function renderPreviewPagination(whichButton){
	
	if (whichButton == 'prev'){
		currPreviewNum -= 100;
	}else if (whichButton == 'next'){
		currPreviewNum += 100;
	}

	// the .json URL is hidden in the download modal
	var fileURL = $("#success").find("#modal-download").find('p:hidden').text();

	$.ajax({
		url:"render-json",
		type:"post",
		data:{"fileURL":fileURL,
				"begin": currPreviewNum
			},
		success:function(data){
			if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
					$(".loading").hide();
					
					// if failed, revert the currNumber back
					if (whichButton == 'prev'){
						currPreviewNum += 100;
					}else if (whichButton == 'next'){
						currPreviewNum -= 100;
					}
			}else{
				$("#grid").empty();
				renderPreview(data.preview, data.prefix);
			}
		},
		error: function(jqXHR, exception){	
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');
			} 
	});
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
