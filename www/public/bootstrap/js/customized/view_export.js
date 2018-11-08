//get currentPage name for dropbox and read the ?dropbox=success
$("#box-auth").on('click',function(){
	$("#box-auth").attr("href","login/box?pageURL=" + currPage + "&currentURL=" + newPath);
});

// box authorization success
if(getParameterByName('box') === 'success'){
	$("#box-export").show();
	$("#export-modal").modal('show');
}else{
	$("#error").val(getParameterByName('box'));
	$("#warning").modal('show');
	$("#export-modal").modal('hide');
}
	
// trigger export
$("#topbar-export").on('click',function(){
	exportOptions('export');
});
//authorize
$("#googleDrive #google-auth").on('click', function(){
	// clear the text area and show input box
	$("#googleDrive .auth-code").val(''); 
	$("#googleDrive .auth-code").css('display','block');
	
	//hide loading bar
	$("#googleDrive .export-loading").css('display','none');
	
	//hide success bar
	$("#googleDrive .export-success").css('display','none');
	
	//hide the link
	$("#googleDrive #embedded-link").hide();
});

$("#dropbox #dropbox-auth").on('click', function(){
	// clear the text area and show input box
	$("#dropbox .auth-code").val(''); 
	$("#dropbox .auth-code").css('display','block');
	
	//hide loading bar
	$("#dropbox .export-loading").css('display','none');
	
	//hide success bar
	$("#dropbox .export-success").css('display','none');
	
	//hide the link
	$("#dropbox #embedded-link").hide();
});

$("#box #box-auth").on('click', function(){
	//hide loading bar
	$("#box .export-loading").css('display','none');
	
	//hide success bar
	$("#box .export-success").css('display','none');
	
	//hide the link
	$("#box #embedded-link").hide();
});

//code change to access token	
$("#googleDrive .auth-code").on("keyup",function(e){
	if (e.keyCode == 13 || e.keyCode == 10){
		
		$.ajax({
			type:'post',
			url:'login/google', 
			data: {"authorizeCode":$("#googleDrive .auth-code").val()},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#googleDrive .auth-code").val(''); //clear the text area
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						// if success, show export button and hide the authorize code session
						$("#googleDrive .auth-code").hide();
						$("#googleDrive-export").show();
					}
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

$("#dropbox .auth-code").on("keyup",function(e){
	if (e.keyCode == 13 || e.keyCode == 10){
		
		$.ajax({
			type:'post',
			url:'login/dropbox', 
			data: {"authorizeCode":$("#dropbox .auth-code").val()},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#dropbox .auth-code").val(''); //clear the text area
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						// if success, show export button and hide the authorize code session
						$("#dropbox .auth-code").hide();
						$("#dropbox-export").show();
					}
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

function exportFiles(id){
	if (id ===  'googleDrive-export'){
		$("#googleDrive-export").hide();
		$("#googleDrive .export-loading").css('display','inline-block');
	}else if (id==='dropbox-export'){
		$("#dropbox-export").hide();
		$("#dropbox .export-loading").css('display','inline-block');
	}else if (id==='box-export'){
		$("#box-export").hide();
		$("#box .export-loading").css('display','inline-block');
	}
	if (s3FolderName === undefined) s3FolderName='local';
	//console.log(s3FolderName);
	$.ajax({
		type:'post',
		url:'export', 
		data: {"id":id, "s3FolderName":s3FolderName},				
		success:function(data){
			if (id ===  'googleDrive-export') $("#googleDrive .export-loading").css('display','none');
			else if(id==='dropbox-export') $("#dropbox .export-loading").css('display','none');
			else if(id==='box-export') $("#box .export-loading").css('display','none');
			
			if (data){
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					// if success, and put on the success gif
					if (id ===  'googleDrive-export'){
						$("#googleDrive .export-success").css('display','inline-block');
						$("#googleDrive #embedded-link").attr("href",data.alternateLink);
						$("#googleDrive #embedded-link").text(data.alternateLink);
						$("#googleDrive #embedded-link").css('display','block');
					}
					else if(id==='dropbox-export'){
						$("#dropbox .export-success").css('display','inline-block');
						$("#dropbox #embedded-link").attr("href",'https://www.dropbox.com/personal?preview=' + data.name);
						$("#dropbox #embedded-link").text('https://www.dropbox.com/personal?preview=' + data.name);
						$("#dropbox #embedded-link").css('display','block');
					}
					else if(id==='box-export'){
						console.log(data);
						$("#box .export-success").css('display','inline-block');
						$("#box #embedded-link").attr("href", 'https://uofi.app.box.com/file/'+ data.entries[0].id);
						$("#box #embedded-link").text('https://uofi.app.box.com/file/'+ data.entries[0].id);
						$("#box #embedded-link").css('display','block');
					}
				}
			}
		},
		error: function(jqXHR, exception){
			$("#googleDrive .export-loading").css('display','none');
			$("#dropbox .export-loading").css('display','none');
			
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
