// Global variable currPrevNum
currPreviewNum = 0;

//corresponding to query.pug and searchbox.pug
function init(){
	
	// initialization
	$("#searchbox").prop('disabled',true);
	$("#dropdownButton").prop('disabled',true);
	$("#boolean-toggle").prop('disabled',true);
	$("#simple-search-btn").prop('disabled',true);
	
	queryTerm = '';
	Query ='';
	parameters = { 	tweet: {},
					twtUser: {},
					es: {},
					rdSearch: {},
					rdComment:{},
					rdPost:{},
					psPost:{},
					psComment:{}	
				};

	// save modal popup
	$("#adv-search-btn").on('click', function(e){
		modalPopUp('#input');
	});	
	$("#simple-search-btn").on('click', function(e){
		modalPopUp('#searchbox');
	});
	$("#searchbox").on('keypress', function(e){
		if ( (e.keyCode == 13 || e.keycode == 10 )&& !$("#simple-search-btn").attr('disabled')){
			e.preventDefault();
			modalPopUp('#searchbox');
		}
	});
	
	// save modal click
	$("#saveButton").on('click',function(e){
		saveModalClick()
	});
	$("#sn-filename").on('keypress',function(e){
		if (e.keyCode === 13 || e.keycode == 10){
			e.preventDefault(); 
			saveModalClick()
		}
	});
	
	$("#sn-filename").on("keyup",function(e){
		if (e.keyCode !== 13 && e.keyCode!== 10){
			$('#display-savefiles').empty();
			$('#display-savefiles').append(`<p style="text-align:left;padding-top:7px;">` + $(this).val() + '.csv' + `</p>` );
		}
	});
			
	// customize dropdown
	$('#dropdownButton').on('click',function(event){
		if ($("#searchbox").val() !== '' && $("#searchbox").val() !== undefined ){
			$(this).parent().toggleClass('open');
			if ($(this).parent().attr('class') === 'dropdown dropdown-lg open'){
				// disable search and enable advanced search
				$("#simple-search-btn").prop('disabled',true);
				
				// toggle css effect
				pushDropdown('on');
			}else{
				$("#simple-search-btn").prop('disabled',false);
				pushDropdown('off');
			}
			
			// initialize the advanced panel
			// escape doule quotation mark
			var keyword =  $("#searchbox").val();
			var keyword = keyword.replace(/[\"]+/g, `\\"`);
			
			parameters['tweet']['q:'] = keyword;
			parameters['tweet']['count:'] = 100;
			parameters['tweet']['pages:'] = parseInt($("#tweet-count").val())/100;
			parameters['tweet']['fields'] = `\n\t\t\tid\n\t\t\tid_str\n\t\t\tcreated_at\n\t\t\ttext\n\t\t\tretweet_count`+
			`\n\t\t\tfavorite_count\n\t\t\tfavorited\n\t\t\ttruncated\n\t\t\tlang\n\t\t\tis_quote_status\n\t\t\tsource`+
			`\n\t\t\tin_reply_to_user_id_str\n\t\t\tin_reply_to_status_id_str\n\t\t\tin_reply_to_screen_name\n\t\t\tuser{`+
			`\n\t\t\t\tauthor_id\n\t\t\t\tauthor_id_str\n\t\t\t\tname\n\t\t\t\tscreen_name\n\t\t\t\tdescription\n\t\t\t\tauthor_created_at`+
			`\n\t\t\t\tprofile_image_url\n\t\t\t\tprofile_banner_url\n\t\t\t\turl\n\t\t\t\tlocation\n\t\t\t\ttweets_count`+
			`\n\t\t\t\tfollowers_count\n\t\t\t\tfriends_count\n\t\t\t\tstatuses_count\n\t\t\t\ttime_zone\n\t\t\t\tprotected`+
			`\n\t\t\t\tverified\n\t\t\t\tis_translator\n\t\t\t\tcontributors_enabled\n\t\t\t\tgeo_enabled\n\t\t\t\tauthor_lang`+
			`\n\t\t\t}\n\t\t\tentities{\n\t\t\t\turls\n\t\t\t\thashtags\n\t\t\t\tuser_mentions{\n\t\t\t\t\tauthor_id`+
			`\n\t\t\t\t\tscreen_name\n\t\t\t\t}\n\t\t\t}`;
			
			parameters['twtUser']['q:'] = keyword;
			parameters['twtUser']['count:'] = 20;
			parameters['twtUser']['fields'] = `\n\t\t\tauthor_id\n\t\t\tauthor_id_str\n\t\t\tname\n\t\t\tscreen_name\n\t\t\tdescription`+
			`\n\t\t\tauthor_created_at\n\t\t\tprofile_image_url\n\t\t\tprofile_banner_url\n\t\t\turl\n\t\t\tlocation\n\t\t\ttweets_count`+
			`\n\t\t\tfollowers_count\n\t\t\tfriends_count\n\t\t\tlisted_count\n\t\t\tfavourites_count\n\t\t\tstatuses_count\n\t\t\ttime_zone`+
			`\n\t\t\tprotected\n\t\t\tverified\n\t\t\tis_translator\n\t\t\tcontributors_enabled\n\t\t\tgeo_enabled\n\t\t\tauthor_lang\n\t\t\ttimeline{`+
			`\n\t\t\t\tid\n\t\t\t\tcreated_at\n\t\t\t\ttext\n\t\t\t\tretweet_count\n\t\t\t}`;
				
			parameters['es']['q:'] = keyword;
			parameters['es']['perPage:'] =  1000;
			parameters['es']['fields'] = `\n\t\t\t_id\n\t\t\t_type\n\t\t\t_index\n\t\t\t_score\n\t\t\t_source{`+
			`\n\t\t\t\tid\n\t\t\t\tid_str\n\t\t\t\tcreated_at\n\t\t\t\ttext\n\t\t\t\tretweet_count\n\t\t\t\tfavorite_count`+
			`\n\t\t\t\tretweeted\n\t\t\t\tfavorited\n\t\t\t\tpossibly_sensitive\n\t\t\t\ttruncated\n\t\t\t\tlang\n\t\t\t\tin_reply_to_user_id_str`+
			`\n\t\t\t\tin_reply_to_status_id_str\n\t\t\t\tin_reply_to_screen_name\n\t\t\t\ttimestamp_ms\n\t\t\t\tmentions\n\t\t\t\thashtags`+
			`\n\t\t\t\turls\n\t\t\t\tis_quote_status\n\t\t\t\temoticons\n\t\t\t\tsource\n\t\t\t\tsentiments\n\t\t\t\tfilter_level\n\t\t\t\tuser{`+
			`\n\t\t\t\t\tauthor_id\n\t\t\t\t\tauthor_id_str\n\t\t\t\t\tname\n\t\t\t\t\tscreen_name\n\t\t\t\t\tdescription\n\t\t\t\t\tauthor_created_at`+
			`\n\t\t\t\t\tprofile_image_url\n\t\t\t\t\tprofile_banner_url\n\t\t\t\t\turl\n\t\t\t\t\tlocation\n\t\t\t\t\ttweets_count\n\t\t\t\t\tfollowers_count`+
			`\n\t\t\t\t\tfriends_count\n\t\t\t\t\tlisted_count\n\t\t\t\t\tfavourites_count\n\t\t\t\t\tstatuses_count\n\t\t\t\t\ttime_zone\n\t\t\t\t\tprotected`+
			`\n\t\t\t\t\tverified\n\t\t\t\t\tis_translator\n\t\t\t\t\tcontributors_enabled\n\t\t\t\t\tgeo_enabled\n\t\t\t\t\tauthor_lang`+
			`\n\t\t\t\t}\n\t\t\t\tcoordinates{\n\t\t\t\t\tlat\n\t\t\t\t\tlon\n\t\t\t\t}\n\t\t\t}`;
			
			parameters['rdSearch']['query:'] = keyword;
			parameters['rdSearch']['time:'] =  'all';
			parameters['rdSearch']['sort:'] =  'relevance';
			parameters['rdSearch']['fields'] = `\n\t\t\tarchived\n\t\t\tauthor_name\n\t\t\tbrand_safe\n\t\t\tcontest_mode\n\t\t\tclicked`+
			`\n\t\t\tcreated\n\t\t\tcreated_utc\n\t\t\tdomain\n\t\t\tdowns\n\t\t\tedited\n\t\t\tgilded\n\t\t\thidden\n\t\t\thide_score`+
			`\n\t\t\tid\n\t\t\tis_self\n\t\t\tlink_flair_text\n\t\t\tlocked\n\t\t\tname\n\t\t\tover_18\n\t\t\tpermalink\n\t\t\tquarantine\n\t\t\tsaved\n\t\t\tscore`+
			`\n\t\t\tstickied\n\t\t\tspoiler\n\t\t\tsubreddit_display_name\n\t\t\tsubreddit_id\n\t\t\tsubreddit_type\n\t\t\tsubreddit_name_prefixed`+
			`\n\t\t\ttitle\n\t\t\turl\n\t\t\tups\n\t\t\tvisited`;
			
			parameters['rdPost']['subredditName:'] = keyword;
			parameters['rdPost']['extra:'] = 2000;
			parameters['rdPost']['fields'] = `\n\t\t\tarchived\n\t\t\tauthor_name\n\t\t\tbrand_safe\n\t\t\tcontest_mode\n\t\t\tclicked`+
			`\n\t\t\tcreated\n\t\t\tcreated_utc\n\t\t\tdomain\n\t\t\tdowns\n\t\t\tedited\n\t\t\tgilded\n\t\t\thidden\n\t\t\thide_score`+
			`\n\t\t\tid\n\t\t\tis_self\n\t\t\tlink_flair_text\n\t\t\tlocked\n\t\t\tname\n\t\t\tover_18\n\t\t\tpermalink\n\t\t\tquarantine\n\t\t\tsaved\n\t\t\tscore`+
			`\n\t\t\tstickied\n\t\t\tspoiler\n\t\t\tsubreddit_display_name\n\t\t\tsubreddit_id\n\t\t\tsubreddit_type\n\t\t\tsubreddit_name_prefixed`+
			`\n\t\t\ttitle\n\t\t\turl\n\t\t\tups\n\t\t\tvisited`;
			
			parameters['rdComment']['subredditName:'] = keyword;
			parameters['rdComment']['extra:'] = 2000;
			parameters['rdComment']['fields'] = `\n\t\t\tcomment_author_name\n\t\t\tarchived\n\t\t\tbody\n\t\t\tbody_html\n\t\t\tsubreddit_display_name`+
			`\n\t\t\tcreated_utc\n\t\t\tcomment_created\n\t\t\tcontroversiality\n\t\t\tcomment_downs\n\t\t\tedited\n\t\t\tgilded\n\t\t\tcomment_id`+
			`\n\t\t\tlink_id\n\t\t\tlink_author\n\t\t\tlink_title\n\t\t\tlink_permalink\n\t\t\tlink_url\n\t\t\tcomment_over_18\n\t\t\tparent_id`+
			`\n\t\t\tquarantine\n\t\t\tsaved\n\t\t\tcomment_score\n\t\t\tsubreddit_id\n\t\t\tsubreddit_display_name\n\t\t\tsubreddit_name_prefixed`+
			`\n\t\t\tscore_hidden\n\t\t\tstickied\n\t\t\tsubreddit_type\n\t\t\tcomment_ups`;
			
			parameters['psPost']['q:'] = keyword;
			parameters['psPost']['size:'] = 1000;
			parameters['psPost']['fields']=`\n\t\t\t_index\n\t\t\t_id\n\t\t\t_type\n\t\t\t_score\n\t\t\t_source{\n\t\t\t\tauthor_name\n\t\t\t\tcreated_utc`+
			`\n\t\t\t\tdomain\n\t\t\t\tid\n\t\t\t\tis_self\n\t\t\t\tlocked\n\t\t\t\tnum_comments\n\t\t\t\tover_18\n\t\t\t\tpermalink\n\t\t\t\tfull_link`+
			`\n\t\t\t\tpinned\n\t\t\t\tretrieved_on\n\t\t\t\tscore\n\t\t\t\tstickied\n\t\t\t\tspoiler\n\t\t\t\tsubreddit_display_name\n\t\t\t\tsubreddit_id`+
			`\n\t\t\t\tsubreddit_name_prefixed\n\t\t\t\ttitle\n\t\t\t\turl\n\t\t\t}`;
				
			parameters['psComment']['q:'] = keyword;
			parameters['psComment']['fields']=`\n\t\t\tcomment_author_name\n\t\t\tbody\n\t\t\tcomment_created\n\t\t\tid\n\t\t\tlink_id\n\t\t\tparent_id`+
			`\n\t\t\tcomment_score\n\t\t\tsubreddit_display_name\n\t\t\tsubreddit_name_prefixed\n\t\t\tsubreddit_id`;
			
			Query =updateString(queryTerm,parameters);
			$("#input").val(`{\n\n` + Query +`\n\n}`);
			
		}else{
			$("#modal-message").append(`<h4>Advanced search disabled unless you provide some search keywords!</h4>`);
			$("#alert").modal('show');
			$("#searchbox").focus();
		}
	});
	
	// customize selectpicker
	$('.selectpicker').selectpicker({ style: 'btn-info', size: 10 });

	// customize multiselectbox
	$('.fields').multiselect({
		enableFiltering: true,
		filterBehavior: 'value',
		dropUp:true,
		maxHeight:600,
		buttonWidth:'600px',
		maxWidth:600,
		includeSelectAllOption: true,		
		enableCollapsibleOptGroups: true,			
		});
	
	// select box enable search/boolean/advanced
	$("#social-media").change(function(){
		$("#searchbox").prop('disabled',false);
		$("#dropdownButton").prop('disabled',false);
		$("#boolean-toggle").prop('disabled',false);
		$("#simple-search-btn").prop('disabled',false);
		
		$(".tweet").hide();
		$(".user").hide();
		$(".es-tweet").hide();
		$(".reddit-search").hide();
		$(".reddit-post").hide();
		$(".reddit-comment").hide();
		$(".pushshift-post").hide();
		$(".pushshift-comment").hide();
		
		$(".form-group.geocode").hide();
		$(".form-group.dateRange").hide();
		$(".form-group.es-geocode").hide();
		$(".form-group.es-dateRange").hide();
		$(".form-group.es-popularity").hide();
		$(".form-group.rd-subreddit").hide();
		$(".form-group.ps-subreddit").hide();
		$(".form-group.ps-author").hide();
		$(".form-group.ps-dateRange").hide();
		$(".form-group.ps-cm-subreddit").hide();
		$(".form-group.ps-cm-author").hide();
		$(".form-group.ps-cm-dateRange").hide();

        queryTerm = $(this).find(':selected').val();
		if ( queryTerm === 'queryTweet'){
			$(".tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");

			// tooltip to show twitter rules
            $("boolean").attr('data-original-title',
				"Twitter API supports a list of standard search operators to modify the behavior of the query. For example, " +
				"<b>SPACE, OR, MINUS SIGN, HASHTAG and etc</b>. <br>Details please refer to the&nbsp" +
				"<a href='https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators.html' target='_blank'>" +
				"standard operators</a>")
                .tooltip('fixTitle')
                .tooltip('show');
		}
		else if ( queryTerm === 'queryUser'){
			$(".user").show();
			$("#searchbox").attr("placeholder","Username keywords that you wish to search...");
            $("boolean").tooltip('hide');
        }
        else if ( queryTerm === 'streamTweet'){
			$(".es-tweet").show();
			$("#searchbox").attr("placeholder","Tweet keywords that you wish to search...");
            $("boolean").tooltip('hide');
        }
        else if ( queryTerm === 'queryReddit'){
			$(".reddit-search").show();
			$("#searchbox").attr("placeholder","Keywords for the Reddit posts that you wish to search...");

            // tooltip to show twitter rules
            $("boolean").attr('data-original-title',
                "Reddit search supports the boolean operators <b>AND, OR, and NOT</b> (case sensitive) as well as parenthesis. Details please refer to the&nbsp" +
                "<a href='https://www.reddit.com/wiki/search' target='_blank'>" +
                "rules</a>")
                .tooltip('fixTitle')
                .tooltip('show');
		}
		else if ( queryTerm === 'redditPost'){
			$(".reddit-post").show();
			$("#searchbox").attr("placeholder","The subreddit name you wish to get posts from...");
            $("boolean").tooltip('hide');
		}
		else if ( queryTerm === 'redditComment'){
			$(".reddit-comment").show();
			$("#searchbox").attr("placeholder","The subreddit name you wish to get comments from...");
            $("boolean").tooltip('hide');
		}
		else if ( queryTerm === 'pushshiftPost'){
			$(".pushshift-post").show();
			$("#searchbox").attr("placeholder","Keyword that you wish to search...");
            $("boolean").tooltip('hide');
		}
		else if ( queryTerm === 'pushshiftComment'){
			$(".pushshift-comment").show();
			$("#searchbox").attr("placeholder","Keyword that you wish to search...");
            $("boolean").tooltip('hide');
		}
		else if (queryTerm === 'crimsonHexagon'){
		    window.location.href = 'query-crimson'
        }
	
		Query = updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
		
		if ( $('.dropdown.dropdown-lg.open').length ){
			pushDropdown('on');
		}else{
			pushDropdown('off');
		}
	});

	/* documentation */
	$("#expandDoc").click(function(){
		$("#documentation").toggleClass("expand");
		$("#docIframe").height($(window).height());
		$("#searchPage").toggleClass("shrink");
	});
	
	/* everything related to date!!!!!!!!! */
	var current = new Date();
	current.setDate(current.getDate()-6);
	var until_start = current.toISOString().slice(0,10);
	$("#until-start").val(until_start);
			
	/*---------------------------------------global search term---------------------------------------------------------------------------*/
	$("#searchbox").on('keyup', function(e){
		
		if ( e.keyCode !== 13 && e.keycode !== 10 ){
			// escape doule quotation mark
			var keyword =  $("#searchbox").val();
			var keyword = keyword.replace(/[\"]+/g, `\\"`);
			
			parameters['tweet']['q:'] = keyword;
			parameters['twtUser']['q:'] = keyword;
			parameters['es']['q:'] = keyword;
			parameters['rdSearch']['query:'] = keyword;
			parameters['rdPost']['subredditName:']= keyword;
			parameters['rdComment']['subredditName:'] = keyword;
			parameters['psPost']['q:'] = keyword;
			parameters['psComment']['q:'] = keyword;
			
			Query =updateString(queryTerm,parameters);
			$("#input").val(`{\n\n` + Query +`\n\n}`);
		}
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
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			parameters['tweet']['until:'] = '';	
			$(".form-group.dateRange").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
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
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		
		}else{
			parameters['tweet']['geocode:'] = '';
			$(".form-group.geocode").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	// tweet
	$("#tweet-count").change(function(){
		parameters['tweet']['count:'] = 100;
		parameters['tweet']['pages:'] = parseInt($("#tweet-count").val())/100;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	$("#twtTweetFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[],AuthorInformation:[],TweetEntities:[]};
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
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
			
		}else{
			parameters['es']['startDate:']='';
			parameters['es']['endDate:']  = '';
			$(".form-group.es-dateRange").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
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
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		
		}else{
			parameters['es']['lat:'] =  ''
			parameters['es']['lon:'] =  ''
			parameters['es']['distance:'] =  ''
			$(".form-group.es-geocode").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
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
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		
		}else{
			parameters['es']['followers_count:'] = '';
			parameters['es']['statuses_count:'] =  '';
			$(".form-group.es-popularity").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	// perPage
	$("#perPage").change(function(){
		parameters['es']['perPage:'] = 1000;
		//parameters['es']['pageNum:']= parseInt($("#perPage").val())/1000;
		Query =updateString(queryTerm,parameters);
		//console.log(Query);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
		
	$("#twtStreamFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[],ElasticSearchMetadata:[],AuthorInformation:[],GeoLocation:[]};
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
		parameters['twtUser']['count:'] = 20;
		//parameters['twtUser']['pageNum:'] = parseInt($("#twtUser-count").val())/20;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
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
			fields_string += '\n\t\t\ttimeline{' ;
			$.each(fields['UserTimeline'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});
			fields_string += '\n\t\t\t}' ;
		}
		
		parameters['twtUser']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	
	
	/*----------------------------------------------------- Reddit Search-------------------------------------------------------*/
	$("input[name='time']").change(function(){
		parameters['rdSearch']['time:'] = $(this).val();
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	$("input[name='sort']").change(function(){
		parameters['rdSearch']['sort:'] = $(this).val();
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	//toggle restrict to subreddit checkbox
	$("#rd-subreddit").change(function(){
		if ($("#rd-subreddit").is(':checked')){
			
			$(".form-group.rd-subreddit").show();
			
			parameters['rdSearch']['restrictSr:'] = true;
			$("#subreddit").change(function(){
				parameters['rdSearch']['subreddit:'] = $(this).val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			$("#subreddit").val("");
			parameters['rdSearch']['restrictSr:'] = '';
			parameters['rdSearch']['subreddit:'] =  '';
			$(".form-group.rd-subreddit").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	
	$("#redditSearchFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[]};
		$.each($(this).find(':selected'),function(i,val){
			fields_string += '\n\t\t\t' + val.value;
		});		
		parameters['rdSearch']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	/*------------------------------pushshift Post ------------------------------------*/
	$("#ps-size").change(function(){
		parameters['psPost']['size:'] = parseInt($("#ps-size").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#ps-subreddit").change(function(){
		if ($("#ps-subreddit").is(':checked')){
			$(".form-group.ps-subreddit").show();
			
			$("#ps-subreddit-name").change(function(){
				parameters['psPost']['subreddit:'] = $(this).val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			$("#ps-subreddit-name").val("");
			parameters['psPost']['subreddit:'] =  '';
			$(".form-group.ps-subreddit").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	$("#ps-author").change(function(){
		if ($("#ps-author").is(':checked')){
			$(".form-group.ps-author").show();
			
			$("#ps-author-name").change(function(){
				parameters['psPost']['author:'] = $(this).val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			$("#ps-author-name").val("");
			parameters['psPost']['author:'] =  '';
			$(".form-group.ps-author").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#ps-dateRange").change(function(){
		if ($("#ps-dateRange").is(':checked')){
			$(".form-group.ps-dateRange").show();
			
			$("#ps-start").change(function(){
				parameters['psPost']['after:'] = epochTime($("#ps-start").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#ps-end").change(function(){
				parameters['psPost']['before:'] = epochTime($("#ps-end").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			parameters['psPost']['before:'] =  '';
			parameters['psPost']['after:'] =  '';
			$(".form-group.ps-dateRange").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	

	$("#psPostFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[],psMetadata:[]};
		$.each($(this).find(':selected'),function(i,val){
			var label = $(val.parentNode)[0].label;
			fields[label].push(val.value);
			//fields_string += '\n\t\t\t' + val.value;
		});

		if (fields['psMetadata'].length !== 0){
			$.each(fields['psMetadata'],function(i,val){
				fields_string += '\n\t\t\t' + val;
			});
		}

		if(fields['BasicFields'].length !== 0){
			fields_string += '\n\t\t\t_source{' ;
			$.each(fields['BasicFields'],function(i,val){
				fields_string += '\n\t\t\t\t' + val;
			});	
			fields_string += '\n\t\t\t}' ;	
		}
		
		parameters['psPost']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	
		/*------------------------------pushshift Comment ------------------------------------*/
	$("#ps-cm-subreddit").change(function(){
		if ($("#ps-cm-subreddit").is(':checked')){
			$(".form-group.ps-cm-subreddit").show();
			
			$("#ps-cm-subreddit-name").change(function(){
				parameters['psComment']['subreddit:'] = $(this).val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}else{
			$("#ps-cm-subreddit-name").val("");
			parameters['psComment']['subreddit:'] =  '';
			$(".form-group.ps-cm-subreddit").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});	
	$("#ps-cm-author").change(function(){
		if ($("#ps-cm-author").is(':checked')){
			$(".form-group.ps-cm-author").show();
			
			$("#ps-cm-author-name").change(function(){
				parameters['psComment']['author:'] = $(this).val();
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
			
		}else{
			$("#ps-author-name").val("");
			parameters['psComment']['author:'] =  '';
			$(".form-group.ps-cm-author").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#ps-cm-dateRange").change(function(){
		if ($("#ps-cm-dateRange").is(':checked')){
			$(".form-group.ps-cm-dateRange").show();
			$("#ps-cm-start").change(function(){
				parameters['psComment']['after:'] = epochTime($("#ps-cm-start").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			$("#ps-cm-end").change(function(){
				parameters['psComment']['before:'] = epochTime($("#ps-cm-end").val());
				Query =updateString(queryTerm,parameters);
				$("#input").val(`{\n\n` + Query +`\n\n}`);
			});
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
			
		}else{
			parameters['psComment']['before:'] =  '';
			parameters['psComment']['after:'] =  '';
			$(".form-group.ps-cm-dateRange").hide();
			
			if ( $('.dropdown.dropdown-lg.open').length ){
				pushDropdown('on');
			}
		}
		
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#psCommentFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[]};
		$.each($(this).find(':selected'),function(i,val){
			fields_string += '\n\t\t\t' + val.value;
		});		
		parameters['psComment']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	/*------------------------------Reddit Post-----------------------------------------*/
	$("#rdPostCount").change(function(){
		parameters['rdPost']['extra:'] = parseInt($("#rdPostCount").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	
	$("#redditPostFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[]};
		$.each($(this).find(':selected'),function(i,val){
			fields_string += '\n\t\t\t' + val.value;
		});		
		parameters['rdPost']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	
	
	/*------------------------------Reddit Comment-----------------------------------------*/
	$("#rdCommentCount").change(function(){
		parameters['rdComment']['extra:'] = parseInt($("#rdCommentCount").val());
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);
	});
	$("#redditCommentFields").change(function(){
		fields_string = '';
		
		fields = {BasicFields:[]};
		$.each($(this).find(':selected'),function(i,val){
			fields_string += '\n\t\t\t' + val.value;
		});		
		parameters['rdComment']['fields'] = fields_string;
		Query =updateString(queryTerm,parameters);
		$("#input").val(`{\n\n` + Query +`\n\n}`);

	});
	
	/*----------------------set intervals--------------------------------------------*/
	$('input[name=histogram-interval]').change(function(){
		setHitogramInterval($("input[name=histogram-interval]:checked").val());
	});
	
	/*---------------------- toggle css effect on dropdown----------------------*/
	
}

function epochTime(datestring){
	return new Date(datestring).getTime() / 1000
}

function constructQuery(parameterObj){
	//console.log(parameterObj);
	var keys = [];
	$.each(Object.keys(parameterObj),function(i,item){
		if (item !== 'fields' && parameterObj[item] !== '' && item !=='pageNum:'){
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
	}else if (queryTerm === 'queryReddit'){
		query =  `\treddit{\n\t\tsearch(`+  constructQuery(parameters.rdSearch) +  `\n\t\t}\n\t}`;  
	}else if (queryTerm === 'redditPost'){
		query =  `\treddit{\n\t\tgetNew(`+  constructQuery(parameters.rdPost) +  `\n\t\t}\n\t}`;  
	}else if (queryTerm === 'redditComment'){
		query =  `\treddit{\n\t\tgetNewComments(`+  constructQuery(parameters.rdComment) +  `\n\t\t}\n\t}`;  
	}else if (queryTerm === 'pushshiftPost'){
		query =  `\treddit{\n\t\tpushshiftPost(`+  constructQuery(parameters.psPost) +  `\n\t\t}\n\t}`;  
	}else if (queryTerm === 'pushshiftComment'){
		query =  `\treddit{\n\t\tpushshiftComment(`+  constructQuery(parameters.psComment) +  `\n\t\t}\n\t}`;  
	}
	
	return query;
}


/* save file modal */
function modalPopUp(searchID){
	if ( formValid(searchID)){
		$("#save").modal('show');
	}	
	
	//pass the searchID to somewhere
	$("#saveButton").attr('name',searchID);
}

/* save file modal click events */
function saveModalClick(){
	var searchID = $("#saveButton").attr('name');
	
	if (searchID === '#searchbox'){
		if (saveValid('#sn-filename')){ 
			submitSearchbox(`#searchbox`,`#sn-filename`);					
		}
					
	}
	else if (searchID === '#input'){
		if (saveValid('#sn-filename')){
			submitQuery(`#input`,`#sn-filename`);
		}
	}
}

/* until setting */
function setDate(){
	var current = new Date();
	var max = current.toISOString().slice(0,10);
	current.setDate(current.getDate()-6);
	var min = current.toISOString().slice(0,10);
	
	$("#until").attr('min', min);
	$("#until").attr('max', max);
}

function setHitogramInterval(freq){
	var filename = $("#sn-filename").val();
	
	if (s3FolderName == undefined) s3FolderName = 'local';
	
	var queryTerm = $("#social-media").find(':selected').val();
	if (queryTerm === 'queryTweet'){
		var prefix = 'twitter-Tweet';
	}else if (queryTerm === 'queryUser'){
		var prefix = 'twitter-User';
	}else if (queryTerm === 'streamTweet'){
		var prefix = 'twitter-Stream';
	}else if (queryTerm === 'queryReddit'){
		var prefix = 'reddit-Search';
	}else if (queryTerm === 'redditPost'){
		var prefix = 'reddit-Post';
	}else if (queryTerm === 'redditComment'){
		var prefix = 'reddit-Comment';
	}else if (queryTerm === 'pushshiftPost'){
		var prefix = 'reddit-Historical-Post';
	}else if (queryTerm === 'pushshiftComment'){
		var prefix = 'reddit-Historical-Comment';
	}
	
	if (prefix === undefined || filename === '' || filename === undefined){
		$("#modal-message").append(`<h4>Incomplete information for histogram. Please make sure you have specified a data source, as well as retrieved data first.</h4>`);
		$("#alert").modal('show');
	}else{
		
		$("#img-container").empty();
		$("#histogram-panel .loading").show();
		
		$.ajax({
			type:'POST',
			url:'histogram', 
			data: JSON.stringify({'s3FolderName': s3FolderName,
					'filename':filename + '.csv',
					'remoteReadPath': s3FolderName + '/GraphQL/' + prefix + '/' + filename,
					'interval': freq }),	
			contentType: "application/json",			
			success:function(data){
				$("#histogram-panel .loading").hide();
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
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
								<div class="x_content">`+data.histogram+`</div>`);
				}
			},
			error: function(jqXHR, exception){
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');				
			} 
		}); 
	}
}

function pushDropdown(state){
	if (state === 'on'){
		var height = $('.dropdown-menu.dropdown-menu-right').height();
		$(".input-group-addon-btn").css('margin-bottom',height);
	}else if (state === 'off'){
		$(".input-group-addon-btn").css('margin-bottom','0px');
	}
}

