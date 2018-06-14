var platforms = ['twitter', 'reddit'];

$.each(platforms,function(i,val){
	clickEffect(val);
});

function clickEffect(platform){
	// newPath has already been calculated in the topbar.pug
	$("." + platform + "-auth").find('a').attr("href","login/"+ platform + "?currentURL=" + newPath);

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
		}

	}
	
	// if there's no visible auth button, show the search page!
	if($('#auth-panel').children(':visible').length == 1) {
			$("#auth-panel").hide();
			$("#searchPage").show();
		}
	
	// if click "later" button, set the later cookie to true for 1 day so it doesn't bother the user anymore
	$("." +platform+ "-auth").find("button").on("click",function(){
		$.cookie(platform + '-later',true, { expires: 1});
		$("#" + platform + "-auth").hide();
		if($('#auth-panel').children(':visible').length == 1) {
			$("#auth-panel").hide();
			$("#searchPage").show();
		}
	});
}

/******************************TWITTER******************************/

// display twitter pin callback input
$(".twitter-auth").find('a').on('click', function(){
	$("#twitter-callback").modal('show');
});

// post the pin to retreive access key and token
$("#twitter-pin-submit").on('click', function(){
	console.log('click');
    $.ajax({
        type:'post',
        url:'login/twitter',
        data:{"twt_pin": $("#twitter-pin").val()},
		success:function(data){
            window.location.replace(data.redirect_url);
		},
        error:function(jqXHR, exception) {
            $("#error").val(jqXHR.responseText);
            $("#warning").modal('show');
        }
    });
});

// post the pin to retreive access key and token
$("#twitter-pin").on('keyup', function(e){
	if (e.keyCode == 13 || e.keyCode == 10){
        $.ajax({
            type:'post',
            url:'login/twitter',
            data:{"twt_pin": $("#twitter-pin").val()},
            success:function(data){
                window.location.replace(data.redirect_url);
			},
            error:function(jqXHR, exception) {
                $("#error").val(jqXHR.responseText);
                $("#warning").modal('show');
            }
        });
	}
});
