function submitQuery(textareaID,filenameID, dryrun = false){
	currPreviewNum = 0;
    $("#save-result").hide();
    $(".loading").show();

	var queryString = $(textareaID).val();
	var queryTerm = $("#social-media").find(':selected').val();
	var filename = $(filenameID).val();
	
	if (queryTerm === 'queryTweet'){
		var prefix = 'twitter-Tweet';
		var params = parameters.tweet;
		var pages = parseInt($("#tweet-count").val())/100;
	}else if (queryTerm === 'getTimeline'){
		var prefix = 'twitter-Timeline';
		var params = parameters.twtTimeline;
		var pages = parseInt($("#twtTimeline-count").val())/200;
	}else if (queryTerm === 'queryReddit'){
		var prefix = 'reddit-Search';
		var params = parameters.rdSearch ;	
		var pages = -999;
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

	if (dryrun){
		$("#instruction").hide();
        $("#histogram-panel").hide();
        $("#rendering").hide();

        $.ajax({
            url:'query-dryrun',
            type:"post",
            data:{
            	"query":queryString,
                "prefix":prefix
            },
            success:function(data){
                $(".loading").hide();
                if ('ERROR' in data){
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }else{
                    $("#rendering").find("button").show();
                    renderPreview(data.rendering, prefix);
                    $("#saveButton").removeAttr("disabled");
                    $("#save-result").show();
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
    }
	else {
        $.ajax({
            url:'query',
            type:"post",
            data:{"query":queryString,
                "filename":filename,
                "params":JSON.stringify(params),
                "pages":pages,
                "prefix":prefix
            },
            success:function(data){
                $(".loading").hide();
                if ('ERROR' in data){
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                    $("#save-result").show();
                }else{
                    renderDownload(data.URLs, data.fname);

                    $("#rendering").find("button").show();
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
} 

function submitSearchbox(searchboxID, filenameID, dryrun = false){
	currPreviewNum = 0;
    $("#save-result").hide();
    $(".loading").show();
	
	// escape doule quotation mark
	var keyword = $(searchboxID).val();
	keyword = keyword.replace(/[\"]+/g, `\\"`);

    var filename = $(filenameID).val();
	
	var queryTerm = $("#social-media").find(':selected').val();
	
	if (queryTerm === 'queryTweet'){
		var pages = 18;
		if (dryrun) pages = 1;
		var queryString = `{
							  twitter {
								queryTweet(q:"` + keyword + `", count: 100){
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
								  entities{
								  	media{
								  		media_url
								  	}
								  }
								}
							  }
							}
							`;
		var prefix = 'twitter-Tweet';
		var params = parameters.tweet;
	}
	else if (queryTerm === 'getTimeline'){
        var pages = 5;
        if (dryrun) pages = 1;
		var queryString = `{
							  twitter{
								getTimeline(screen_name:"` + keyword + `", count:200){
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
								  entities{
								  	media{
								  		media_url
								  	}
								  }
								}
							  }
							}`;
		var prefix = 'twitter-Timeline';
		var params = parameters.twtTimeline;

	}
	else if (queryTerm === 'queryTweetV2'){
		var additional_num = 100;
		if (dryrun) additional_num = 0;
		var queryString = `{
							  twitter {
								queryTweetV2(q:"` + keyword + `", additional_num:` + additional_num + `){
								  id
								  text
								  edit_history_tweet_ids
								  attachments {
									poll_ids
									media_keys
								  }
								  author_id
								  conversation_id
								  created_at
								  in_reply_to_user_id
								  lang
								  possibly_sensitive
								  referenced_tweets {
									type
									id
								  }
								  reply_settings
								  source
								  withheld {
									copyright
									country_codes
								  }
								}
							  }
							}
							`;
		var prefix = 'twitterV2-Tweet';
		var pages = -999;
		var params = parameters.tweetV2;
	}
	else if (queryTerm === 'queryReddit'){
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
		var prefix = 'reddit-Search';
		var pages = -999;
		var params = parameters.rdSearch;
	}
	else if (queryTerm === 'redditPost'){
		var extra = 2000;
		if (dryrun) extra=100;
		var queryString = `{
							  reddit {
								getNew(subredditName:"`+ keyword + `", extra: `+ extra + `){
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
		var prefix = 'reddit-Post';
		var pages = -999;
		var params = parameters.rdPost;
	}
	else if (queryTerm === 'pushshiftPost'){
		var queryString = `{
								reddit{
									pushshiftPost(q:"`+ keyword + `"){
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
							}`;
		var prefix = 'reddit-Historical-Post';
		var pages = -999;
		var params = parameters.psPost;
	}
	else if (queryTerm === 'redditComment'){
		var extra = 2000;
		if (dryrun) extra = 100;
		var queryString = `{
							reddit{
							getNewComments(subredditName:"`+keyword + `",extra:` + extra + `){
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
		var prefix = 'reddit-Comment';
		var pages = -999;
		var params = parameters.rdComment;
	}
	else if (queryTerm === 'pushshiftComment'){
		var queryString = `{
							  reddit {
								pushshiftComment(q: "`+ keyword + `"){
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
		var prefix = 'reddit-Historical-Comment';
		var pages = -999;
		var params = parameters.psComment;
	}

	if (dryrun){
		$("#instruction").hide();
        $("#histogram-panel").hide();
        $("#rendering").hide();

        $.ajax({
            url:"query-dryrun",
            type:"post",
            data:{
            	"query":queryString,
                "prefix":prefix
            },
            success:function(data){
                $(".loading").hide();
                if ('ERROR' in data){
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                }else{
                    $("#rendering").find("button").hide();
                    renderPreview(data.rendering, prefix);
                    $("#saveButton").removeAttr("disabled");
                    $("#save-result").show();
                }
            },
            error: function(jqXHR, exception){
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
	}
	else{
        $.ajax({
            url:"query",
            type:"post",
            data:{
            	"query":queryString,
                "filename":filename,
                "params":JSON.stringify(params),
                "pages":pages,
                "prefix":prefix
            },
            success:function(data){
                $(".loading").hide();
                if ('ERROR' in data){
                    $("#error").val(JSON.stringify(data));
                    $("#warning").modal('show');
                    $("#save-result").show();
                }else{
                    renderDownload(data.URLs, data.fname);
                    $("#rendering").find("button").show();
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
}

function renderHistogram(histogram){
    $("#img-container").empty();
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

function renderDownload(URLs){
	$("#save-result").hide();
    $("#download").attr('href',URLs[0]);
    $("#download-json").attr('href',URLs[1]);
	$("#instruction").show();
}

function renderPreview(rendering,prefix){
    $("#grid").empty();
	// construct previews
	if (prefix === 'twitter-Tweet' || prefix === 'twitter-Timeline'){
		$.each(rendering, function(i,val){
			if (val.user !== undefined){
				var img_url = val.user.profile_image_url || 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = val.user.name || 'Not Provided';
				var screen_name =  val.user.screen_name || 'Not Provided';
			}else{	
				var img_url = 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
				var user_name = 'Not Provided';
				var screen_name = 'NotProvided';
			}
			
			var created_at = val.created_at || 'Not Provided' ;
			
			if (val.retweet_count !== undefined){
				var retweet_count = val.retweet_count;
			}
			else{
				var retweet_count = 'Not Provided';
			}
			
			if (val.favorite_count !== undefined){
				var favorite_count = val.favorite_count;
			}else{
				var favorite_count = 'Not Provided';
			}
			
			if (val.text !== undefined){
				var text = val.text;
			}else{
				var text = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img"/>
									<div class="text-block">
										<p class="username"><b>` + user_name + `‏<b></p> 
										<p class="screenname"><i>&nbsp;&bull;@`+ screen_name + `</i></p>
										<p class="utc">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p class="text-block">`+ text + `</p>
									<p class="text-block"><i class="fas fa-retweet" style="color:#94dc41;"></i>&nbsp;`+ retweet_count +
									`&nbsp;&nbsp;&nbsp;&nbsp;<i class="fas fa-heart heart"></i>&nbsp;` +favorite_count +`</p>
							</div>`);
		});
	}
	else if (prefix === 'twitterV2-Tweet'){
		$.each(rendering, function(i,val){
			var img_url = 'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
			var author_id = val.author_id || 'Not Provided';
			var created_at = val.created_at || 'Not Provided' ;
			var text = val.text || 'Not Provided'

			$("#grid").append(`<div class="grid-element">
									<img src="` + img_url + `" class="user-img" alt="user-img"/>
									<div class="text-block">
										<p class="screenname"><b>` + author_id + `‏<b></p>
										<br>
										<p class="utc">&nbsp;&bull;`+ created_at +`</p>
									</div>
									<p class="text-block">`+ text + `</p>
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
				var permalink = val._source.permalink || '';
			}else{
				var permalink = '';
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
					<div class="text-block">
						<p class="username"><b>` + author_name + `‏<b></p> 
						<p class="screenname">&nbsp;&bull;`+ subreddit_name_prefixed + `</p>
						<p class="utc">&nbsp;&bull;` + created_utc + `</p>
					</div>
					<a target="_blank" href="https://www.reddit.com` + permalink + `">`
						+ title + `</a>
					<p class="text-block"><i class="fas fa-heart heart"></i>&nbsp;`+score +`</p>
				</div>`);
				
		});
	}
	else if (prefix === 'reddit-Comment' || prefix === 'reddit-Historical-Comment'){
		$.each(rendering, function(i,val){
			var author_name = val.comment_author_name || 'Not Provided';
			var subreddit_name_prefixed = val.subreddit_name_prefixed || 'NotProvided';
			var body = val.body || 'Not Provided';
			if (body.length >= 200){
				body = body.slice(0,200) + '...';
			}

			if (val.link_permalink === undefined || val.link_permalink === ""){
                var permalink = 'https://reddit.com';
            }
            else{
                var permalink = val.link_permalink;
			}

			var score = val.comment_score || 'Not Provided';
			if (val.comment_created !== undefined){
				var created_utc = timeConverter(val.comment_created);
			}else{
				var created_utc = 'Not Provided';
			}
			
			$("#grid").append(`<div class="grid-element">
					<div class="text-block">
						<p class="username"><b>` + author_name + `‏<b></p> 
						<p class="screenname">&nbsp;&bull;`+ subreddit_name_prefixed + `</p>
						<p class="utc">&nbsp;&bull;` + created_utc + `</p>
					</div>
					<p class="text-block">`+ body + `</p>
					<a target="_blank" href="` + permalink + `">Go to this Reddit Thread&nbsp;
						<i class="fas fa-share"></i></a>
					<p class="text-block"><i class="fas fa-heart heart"></i>&nbsp;`+score +`</p>
				</div>`);
				
		});
	}

	$("#rendering").show();
}

function renderPreviewPagination(whichButton){
	
	if (whichButton === 'prev'){
		currPreviewNum -= 100;
	}else if (whichButton === 'next'){
		currPreviewNum += 100;
	}

	// the .json URL is hidden in the download modal
	var fileURL = $("#download-json").attr('href');
	$.ajax({
		url:"render-json",
		type:"post",
		data:{
			"fileURL":fileURL,
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
  return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
}
