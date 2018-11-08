$("#topbar-hub").on('click',function(e){
	e.preventDefault();
	$("#terminate-modal").modal('show');
});

function exportOptions(whichTrigger){

	if (whichTrigger === 'terminate'){
	
		$("#terminate-modal").modal('hide');
		$("#export-modal").find(".modal-footer").show();
		$("#export-modal").modal('show');
		
	}else if (whichTrigger === 'export'){
		$("#export-modal").find(".modal-footer").hide();
		$("#export-modal").modal('show');
	}
}
	
function terminate(){
	if (s3FolderName === undefined) s3FolderName='local';
	
	var cleanData = function() {
	  return new Promise(function(resolve, reject) {
		//console.log('first delete that session folder');
		$.ajax({
			type:'post',
			url:'delete', 
			data: {"type":"purge",
					"s3FolderName":s3FolderName},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#loading").hide();
						$("#background").show();
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
						reject(data);
					}
					console.log(data);
					resolve(data);
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
					reject(msg);						
				} 
		});
	  });
	};

	cleanData().then(function() {
		window.location = "http://socialmediamacroscope.org/tools/smiletest/stop?sess=" + sessionID;
	}).catch(function(error) {
		console.log('oh no', error);
	});

}