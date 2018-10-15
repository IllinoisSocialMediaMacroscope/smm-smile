var platforms = ['twitter', 'reddit', 'crimson'];

$.each(platforms,function(i,platform){
    if (platform === 'twitter'){
        // newPath has already been calculated in the parse_session.js
        $(".twitter-auth").find('a').attr("href","login/twitter?currentURL=" + newPath);
	}
	else if (platform === 'reddit'){
		$("#reddit-agree").attr("href", "login/reddit?currentURL=" + newPath)
	}

	clickEffect(platform);
});

function clickEffect(platform){
	// two ways to hide an authorization button
	// 1. actually authorize it. this will show the search and also enable the dropdown in the search success cookie
	// 2. click later button which shows the search page but without opening that specific search later cookie
	if ($.cookie(platform + "-later") === "true"){
		$("#" + platform + "-auth").hide();
	}
    
    if ($.cookie(platform+ "-success") === "true"){
		// click the icon to authorize hide
		$("." + platform + "-auth").hide();
		$("#" + platform + "-authorized").show();
		//console.log("#" + platform + "-authorized");

		if (platform === 'twitter'){
			$("#social-media option[value='queryTweet']").removeAttr('disabled');
			$("#social-media option[value='queryUser']").removeAttr('disabled');
		}else if (platform === 'reddit'){
			$("#social-media option[value='queryReddit']").removeAttr('disabled');
			$("#social-media option[value='redditPost']").removeAttr('disabled');
			$("#social-media option[value='redditComment']").removeAttr('disabled');
		}else if (platform === 'crimson'){
            $("#social-media option[value='crimsonHexagon']").removeAttr('disabled');
		}
	}
	
	// if there's no visible auth button, show the search page!
	if($('#auth-panel').children(':visible').length == 1) {
			$("#auth-panel").hide();
			$("#searchPage").show();
		}
	
	// if click "later" button, set the later cookie to true for 1 day so it doesn't bother the user anymore
	$("." +platform+ "-auth").find(".button-later").on("click",function(){
		$.cookie(platform + '-later',true, { expires: 1});
		$("#" + platform + "-auth").hide();
		if($('#auth-panel').children(':visible').length == 1) {
			$("#auth-panel").hide();
			$("#searchPage").show();
		}
	});
}

/****************************** CRIMSON Hexagon ******************************/
$(".crimson-auth").find(".button").on('click', function(e){
	e.preventDefault();
    $("#crimson").modal('show');
});

$(".crimson-auth").find("#crimson-icon-button").on('click', function(e){
    e.preventDefault();
    $("#crimson").modal('show');
});

/****************************** TWITTER ******************************/
// display twitter pin callback input
$(".twitter-auth").find('a').on('click', function(){
	$("#twitter-callback").modal('show');
});

//***************************** REDDIT ******************************/
$(".reddit-auth").find('a').on('click', function(){
	$("#reddit-callback").modal('show');
});
