$("#rdCommentReq").on('click',function(){
	if (s3FolderName == undefined) s3FolderName = 'local'
	
	if (checkRedditReq()){
		$.ajax({
			type:'post',
			url:'reddit-expand', 
			data: {"prefix":$(".dataset").val(), 
					"email":$("#email-alert").val(),
					"s3FolderName":s3FolderName,
					"sessionURL": sessionURL},
			success:function(data){
				if (data === 'done'){
					$("#reddit-expand").modal('hide');
					$("#reddit-expand-confirmation").modal('show');
				}else if (data === 'pop alert'){
					$("#reddit-expand-exist").modal('show');
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
});

$("#rdCommentYes").on('click',function(){
	console.log('click');
	if (s3FolderName == undefined) s3FolderName = 'local'
	
	if (checkRedditReq()){
		$.ajax({
			type:'post',
			url:'reddit-expand', 
			data: {"prefix":$(".dataset").val(), 
					"email":$("#email-alert").val(),
					"s3FolderName":s3FolderName,
					"consent":true,
                	"sessionURL": sessionURL
			},
			success:function(data){
				if (data === 'done'){
					$("#reddit-expand").modal('hide');
					$("#reddit-expand-exist").modal('hide');
					$("#reddit-expand-confirmation").modal('show');
				}else{
					console.log(data);
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
});

$("#rdCommentNo").on('click',function(){
	$("#reddit-expand").modal('hide');
	$("#reddit-expand-exist").modal('hide');
});

$("#email-alert").on('keypress',function(e){
	if (e.keyCode === 13 || e.keycode == 10){
		e.preventDefault(); 

		if (s3FolderName == undefined) s3FolderName = 'local'
		
		if (checkRedditReq()){
			$.ajax({
				type:'post',
				url:'reddit-expand', 
				data: {"prefix":$(".dataset").val(), 
						"email":$("#email-alert").val(),
						"s3FolderName":s3FolderName,
                    	"sessionURL": sessionURL},
				success:function(data){
					if (data === 'done'){
						$("#reddit-expand").modal('hide');
						$("#reddit-expand-confirmation").modal('show');
					}else if (data === 'pop alert'){
						$("#reddit-expand-exist").modal('show');
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
	}
});
	
	
function checkRedditReq(){
	if($(".dataset").val() === '' || $(".dataset").val() === undefined){
		$("#modal-message").append(`<h4>This Reddit Post you select is invalid.</h4>`);
		$("#alert").modal('show');
		return false
	}
	
	if($(".length").val() === '' 
		|| $(".length").val() === undefined
		|| $(".length").val() === 0){
			$("#modal-message").append(`<h4>This Reddit Post you select has no data!</h4>`);
			$("#alert").modal('show');
			return false
	}
	
	if($("#email-alert").val() === '' 
		|| $("#email-alert").val() === undefined 
		|| $("#email-alert").val().indexOf('@')<= -1){
			$("#modal-message").append(`<h4>Please provide a valid email address so we can reach to you once your collection has completed!</h4>`);
			$("#alert").modal('show');
			return false
	}
	
	return true
}
