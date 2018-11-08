/*form validation */
function saveValid(filenameID){
	//check filename is legal or not
	// no empty, no space and . allowed
	// must be English
	var regexp1 =/^[A-Za-z0-9__-]+$/;
	
	if ($(filenameID).val() === '' || $(filenameID).val()=== undefined){
		$("#modal-message").append(`<h4>filename must not be empty!</h4>`)
		$("#alert").modal('show');
		$(filenameID).focus();
		return false
	}else if (!regexp1.test($(filenameID).val())){
		$("#modal-message").append(`<h4>filename illegal!<br> Legal Filename should only include <i>Alphabet, Number,
		Underscore</i> and/or <i>Dash</i>. <b>Example: mySearch-cwang138</b></h4>`);
		$("#alert").modal('show');
		$(filenameID).focus();
		return false
	}else if ($(filenameID).val()>=72){
		$("#modal-message").append(`<h4>filename exceed 72 characters!</h4>`);
		$("#alert").modal('show');
		$(filenameID).focus();
		return false
	}else{
		return true
	}
}

function formValid(searchID){
	
	// check the input box has English words or numbers or not
	// before carry out to save the data part
	// https://developer.twitter.com/en/docs/tweets/search/guides/standard-operators
	var regx = /^[\":?)(#@A-Za-z0-9_ _+-_&_|]+$/;
	if ($("#social-media option:selected").val() === ''){
		
		$("#modal-message").append(`<h4>Please select a platform!</h4>`);
		$("#alert").modal('show');
		$("#social-media").focus();
		return false
		
	}else if (!regx.test($("#searchbox").val()) || $("#searchbox").val()>=500){
		
		$("#modal-message").append(`<h4>Please type in search keyword in the form of <i>English words, number, operators, 
									and/or combinations</i> of them!<br><b>Length shouldn't exceed 500 characters!</b></h4>`);
		$("#alert").modal('show');
		$("#searchbox").focus();
		return false
		
	}
	
	// extra search for advanced
	if (searchID === '#input'){
		if ($("#social-media option:selected").val() === 'queryTweet'){
			if ( $("#dateRange").is(':checked') && ($("#until").val() === '' ||$("#until").val() === undefined)){
				$("#modal-message").append(`<h4>Please select a search time frame!</h4>`);
				$("#alert").modal('show');
				$("#until").focus();
				return false
			} 
			if ( $("#geocode").is(':checked') && ($("#lat").val() === '' || $("#lon").val() === '' || $("#radius").val() === '' )){
				$("#modal-message").append(`<h4>Please fill in the geolocation information!</h4>`);
				$("#alert").modal('show');
				$("#lat").focus();
				return false
			} 
			if ($("#twtTweetFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the search result!</h4>`);
				$("#alert").modal('show');
				$("#twtTweetFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'queryUser'){
			if ($("#twtUserFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the search result!</h4>`);
				$("#alert").modal('show');
				$("#twtUserFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'streamTweet'){
			if ($("#es-dateRange").is(':checked')){
				if ($("#start").val() === '' || $("#end").val() === ''){
					$("#modal-message").append(`<h4>Please select start time and end time!</h4>`);
					$("#alert").modal('show');
					$("#start").focus();
					return false
				}else if($("#start").val() > $("#end").val()){
					$("#modal-message").append(`<h4>Start time cannot be later than end time!</h4>`);
					$("#alert").modal('show');
					$("#start").focus();
					return false
				}
			}
			if ($("#es-geocode").is(':checked') && ($("#es-lat").val() === '' || $("#es-lat").val() === '' || $("#es-radius").val() === '')){
				$("#modal-message").append(`<h4>Please fill in the geolocation information!</h4>`);
				$("#alert").modal('show');
				$("#es-lat").focus();
				return false
			} 
			if ($("#es-popularity").is(':checked') && ($("#followers_count").val() === '' || $("#statuses_count").val() === '')){
				$("#modal-message").append(`<h4>Please select followers and statuses range!</h4>`);
				$("#alert").modal('show');
				$("#followers_count").focus();
				return false
			} 
			if ($("#twtStreamFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the search result!</h4>`);
				$("#alert").modal('show');
				$("#twtStreamFields").focus();
				return false
			}
			
		}
		else if ($("#social-media option:selected").val() === 'queryReddit'){
			if (!$("input[name='time']").is(':checked')){
				$("#modal-message").append(`<h4>Please select a timespan for reddit search!</h4>`);
				$("#alert").modal('show');
				$("input[name='time']").focus();
				return false
			}
			if (!$("input[name='sort']").is(':checked')){
				$("#modal-message").append(`<h4>Please select a sorting method!</h4>`);
				$("#alert").modal('show');
				$("input[name='sort']").focus();
				return false
			}
			if ($("#rd-subreddit").is(':checked') && ($("#subreddit").val() === '')){
				$("#modal-message").append(`<h4>Please sepecify which subreddit!</h4>`);
				$("#alert").modal('show');
				$("#subreddit").focus();
				return false
			} 
			
			if ($("#redditSearchFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the search result!</h4>`);
				$("#alert").modal('show');
				$("#redditSearchFields").focus();
				return false
			}
			
		}
		else if ($("#social-media option:selected").val() === 'redditPost'){
			if ($("#redditPostFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the post!</h4>`);
				$("#alert").modal('show');
				$("#redditPostFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'redditComment'){
			if ($("#redditCommentFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the comment!</h4>`);
				$("#alert").modal('show');
				$("#redditCommentFields").focus();
				return false
			}
		}else if ($("#social-media option:selected").val() === 'pushshiftPost'){
			if ($("#ps-subreddit").is(':checked') && ($("#ps-subreddit-name").val() === '')){
				$("#modal-message").append(`<h4>Please sepecify which subreddit!</h4>`);
				$("#alert").modal('show');
				$("#ps-subreddit-name").focus();
				return false
			} 
			if ($("#ps-author").is(':checked') && ($("#ps-author-name").val() === '')){
				$("#modal-message").append(`<h4>Please sepecify which author!</h4>`);
				$("#alert").modal('show');
				$("#ps-author-name").focus();
				return false
			} 
			if ($("#ps-dateRange").is(':checked') && 
					($("#ps-start").val() === '' || $("#ps-end").val() === '' || $("#ps-start").val()>$("#ps-end").val())){
				$("#modal-message").append(`<h4>Please sepecify a date range, and the start date cannot be later than the end date!</h4>`);
				$("#alert").modal('show');
				return false
			} 
			if ($("#psPostFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the post!</h4>`);
				$("#alert").modal('show');
				$("#psPostFields").focus();
				return false
			}
		}else if ($("#social-media option:selected").val() === 'pushshiftComment'){
			if ($("#ps-cm-subreddit").is(':checked') && ($("#ps-cm-subreddit-name").val() === '')){
				$("#modal-message").append(`<h4>Please sepecify which subreddit!</h4>`);
				$("#alert").modal('show');
				return false
			} 
			if ($("#ps-cm-author").is(':checked') && ($("#ps-cm-author-name").val() === '')){
				$("#modal-message").append(`<h4>Please sepecify which author!</h4>`);
				$("#alert").modal('show');
				return false
			} 
			if ($("#ps-cm-dateRange").is(':checked') && 
					($("#ps-cm-start").val() === '' || $("#ps-cm-end").val() === '' || $("#ps-cm-start").val()>$("#ps-cm-end").val())){
				$("#modal-message").append(`<h4>Please sepecify a date range, and the start date cannot be later than the end date!</h4>`);
				$("#alert").modal('show');
				return false
			} 
			if ($("#psCommentFields option:selected").val()===undefined){
				$("#modal-message").append(`<h4>Please select at least one Field of the post!</h4>`);
				$("#alert").modal('show');
				return false
			}
		}
	}
	
	return true
}