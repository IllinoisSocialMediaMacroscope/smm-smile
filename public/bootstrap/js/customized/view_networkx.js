$(document).ready(function(){
	
	$("#model").on('change',function(){
		//these model does not allow you to specify how many clusters
		var model = $(this).find(':selected').val()
		//console.log(model);
		if (model === 'AffinityPropagation' || model === 'DBSCAN' || model === 'MeanShift'){
			$("#clusters").hide();
		}else{
			$("#clusters").show();
		}
	});
	
	
	$("#selectFile").on('change',function(){
		var foldername = $(this).children(":selected").attr("id");
		var directory = $(this).children(":selected").attr("class");
		$("#selectFilePreview-container").empty();
		//$("#selectFileHeader-container").empty();
		$.ajax({
			type:'POST',
			url:'/render', 
			data: {"foldername":foldername, "directory":directory},				
			success:function(data){
				if (data){
					var allowed_field_list = [
						// tweet
						'text',
						// stream
						'_source.text'];
					
					var index = [];
					$.each(data.preview[0],function(i,val){
						if (allowed_field_list.indexOf(val) >=0){
							index.push(i)
						}
					});
					var numCat_data = [];
						$.each(data.preview,function(i,val){
							var line = [];
							$.each(index,function(i,indice){
								line.push(val[indice]);
							});
							numCat_data.push(line); 
						});
					
					$("#selectFilePreview-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
					$("#selectFilePreview").append(arrayToTable(numCat_data,'#selectFileTable'));
					//$("#selectFileTable").DataTable();
					
					
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
});

/*----------------------form validation ----------------------------*/
function formValidation(){
	
	if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
		alert("Please select a csv file from your folder!");
		$("#selectFile").focus();
		return false;
	}
	if ($("#relationships option:selected").val() === '' || $("#relationships option:selected").val() === undefined){
		alert("Please select a model to perform!");
		$("#relationships").focus();
		return false;
	}
	if ($("#layout option:selected").val() === '' || $("#layout option:selected").val() === undefined){
		alert("Please select a model to perform!");
		$("#layout").focus();
		return false;
	}
	if ($("#node_size").val()< 5 || $("#node_size").val() > 50){
		alert("The valid number of node size is between 5 to 50!");
		$("#node_size").focus();
		return false;
	}
	if ($("#edge_width").val()< 0.1 || $("#edge_width").val() > 5){
		alert("The valid number of edge width is between 0.1 to 5!");
		$("#edge_width").focus();
		return false;
	}
	
	return true;
	
}