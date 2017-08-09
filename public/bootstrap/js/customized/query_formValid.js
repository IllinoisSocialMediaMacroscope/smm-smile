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
			/* if ($("#until").val() === '' ||$("#until").val() === undefined){
				alert("Please select a search time frame");
				$("#until").focus();
				return false
			} */
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
			if ($("#twtStreamFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#twtStreamFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'searchContent'){
			if ($("#time option:selected").val()===undefined){
				alert("Please select an option for the field Time");
				$("#time").focus();
				return false
			}
			if ($("#sort option:selected").val()===undefined){
				alert("Please select an option for the field Sort");
				$("#sort").focus();
				return false
			}
			if ($("#rdSearchFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#rdSearchFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'getNewComments'){
			if ($("#rdCommentFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#rdCommentFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'searchSubreddits'){ 
			if ($("#rdSubFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#rdSubFields").focus();
				return false
			}
		}
		else if ($("#social-media option:selected").val() === 'getCompleteReplies'){
			if ($("#rdReplyFields option:selected").val()===undefined){
				alert("Please select at least one Field of the search result");
				$("#rdReplyFields").focus();
				return false
			}
		}
	}
	
	return true
}