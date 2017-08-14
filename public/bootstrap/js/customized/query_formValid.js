/*form validation */
function saveValid(filenameID){
	//check filename is legal or not
	// no empty, no space and . allowed
	// must be English
	var regexp1 =/^[A-Za-z0-9__-]+$/;
	
	if ($(filenameID).val() === '' || $(filenameID).val()=== undefined){
		alert('filename must not be empty!')
		$(filenameID).focus();
		return false
	}else if (!regexp1.test($(filenameID).val())){
		alert('filename illegal!');
		$(filenameID).focus();
		return false
	}else if ($(filenameID).val()>=72){
		alert('filename exceed 72 characters!');
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
		
		alert("Please select a platform!");
		$("#social-media").focus();
		return false
		
	}else if (!regx.test($("#searchbox").val()) || $("#searchbox").val()>=72){
		
		alert("Please type in search keyword in the form of English words/number/or any combination of them! Length shouldn't exceed 72 characters!");
		$("#searchbox").focus();
		return false
		
	}
	
	// extra search for advanced
	if (searchID === '#input'){
		if ($("#social-media option:selected").val() === 'queryTweet'){
			if ( $("#dateRange").is(':checked') && ($("#until").val() === '' ||$("#until").val() === undefined)){
				alert("Please select a search time frame");
				$("#until").focus();
				return false
			} 
			if ( $("#geocode").is(':checked') && ($("#lat").val() === '' || $("#lon").val() === '' || $("#radius").val() === '' )){
				alert("Please fill in the geolocation information");
				$("#lat").focus();
				return false
			} 
			if ($("#twtTweetFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#twtTweetFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'queryUser'){
			if ($("#twtUserFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#twtUserFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'streamTweet'){
			if ($("#es-dateRange").is(':checked') && ($("#start").val() === '' || $("#end").val() === '')){
				alert("Please select start time and end time");
				$("#start").focus();
				return false
			} 
			if ($("#es-geocode").is(':checked') && ($("#es-lat").val() === '' || $("#es-lat").val() === '' || $("#es-radius").val() === '')){
				alert("Please fill in the geolocation information");
				$("#es-lat").focus();
				return false
			} 
			if ($("#es-popularity").is(':checked') && ($("#followers_count").val() === '' || $("#statuses_count").val() === '')){
				alert("Please select followers and statuses range");
				$("#followers_count").focus();
				return false
			} 
			if ($("#twtStreamFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#twtStreamFields").focus();
				return false
			}
			
		}
	}
	
	return true
}