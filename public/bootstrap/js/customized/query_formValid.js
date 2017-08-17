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
	var regx = /^[#@A-Za-z0-9_ _+-_&_|]+$/;
	if ($("#social-media option:selected").val() === ''){
		
		$("#modal-message").append(`<h4>Please select a platform!</h4>`);
		$("#alert").modal('show');
		$("#social-media").focus();
		return false
		
	}else if (!regx.test($("#searchbox").val()) || $("#searchbox").val()>=72){
		
		$("#modal-message").append(`<h4>Please type in search keyword in the form of <i>English words, number,
									and/or combinations</i> of them!<br><b>Length shouldn't exceed 72 characters!</b></h4>`);
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
			if ($("#es-dateRange").is(':checked') && ($("#start").val() === '' || $("#end").val() === '')){
				$("#modal-message").append(`<h4>Please select start time and end time!</h4>`);
				$("#alert").modal('show');
				$("#start").focus();
				return false
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
	}
	
	return true
}