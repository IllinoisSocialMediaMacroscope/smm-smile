$("#tag").on('click',function(){
	
	$.ajax({
		type:'post',
		url:'tag', 
		data: {"jobId":$("#jobId").val(), 
				"tagName":$("#tagName").val(),
			},				
		success:function(data){
			if(currPage !== 'history'){
				$("#tag-modal").modal('hide');
			}else{
				$("#tag-modal").modal('hide');
				//also immediately update the tag bar in the frontend
				//fake update
				var tagID = $("#jobId").val();
				var tagName = $("#tagName").val();
				if (tagName !== '' && tagName !== undefined){
					$("#" + tagID).empty()
					$("#" + tagID).append(`<kbd>tag: ` + tagName + `</kbd>`);
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
});



$("#tagName").on('keypress',function(e){
	if (e.keyCode === 13 || e.keycode == 10){
		e.preventDefault(); 
		$.ajax({
		type:'post',
		url:'tag', 
		data: {"jobId":$("#jobId").val(), 
				"tagName":$("#tagName").val(),
			},				
		success:function(data){
			if(currPage !== 'history'){
				$("#tag-modal").modal('hide');
			}else{
				$("#tag-modal").modal('hide');
				//also immediately update the tag bar in the frontend
				//fake update
				var tagID = $("#jobId").val();
				var tagName = $("#tagName").val();
				if (tagName !== '' && tagName !== undefined){
					$("#" + tagID).empty()
					$("#" + tagID).append(`<kbd>tag: ` + tagName + `</kbd>`);
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