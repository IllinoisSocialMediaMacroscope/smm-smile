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
	var cleanData = function(){
		return new Promise(function(resolve, reject) {
			$.ajax({
                type:'delete',
                url:'history',
				data:JSON.stringify({"type":"local"}),
                contentType: "application/json",
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
				error:function(jqXHR, exception){
					$("#error").val(jqXHR.responseText);
					$("#warning").modal('show');
					reject(jqXHR.responseText);
				}
			})
		})
	};

	cleanData().then(function(){
        window.location = "http://socialmediamacroscope.org/tools/smiletest/stop?sess=" + sessionID;
	}).catch(function(error){
        $("#error").val(JSON.stringify(error));
        $("#warning").modal('show');
	})
}
