function drawIframe(name,fname){
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
	$('#chart_div').append(`<iframe src="../../pyLDAvis/` + fname + `" style="background:#FFFFFF;display:block; width:100%; height:900px;">`);
}

$(document).ready(function(){
	$("#selectZip").on('change',function(){
		
		$("#selectFilePreview-container").empty();
		$.ajax({
			type:'POST',
			url:'/render', 
			data: "filename=" + this.value,				
			success:function(data){
				if (data){		
					$("#selectFilePreview-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">files within this .zip</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)	
					$("#selectFilePreview").append(arrayToTable(data,'#selectFileTable'));
					$("#selectFileTable").DataTable();
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
	
	if ($("#selectZip").val() === 'Please Select...' || $("#selectZip").val() === undefined){
		alert("Please upload a corpus in .zip format!");
		$("#selectZip").focus();
		return false;
	}
	
	if ($("#vectorizer option:selected").val() === '' || $("#vectorizer option:selected").val() === undefined){
		alert("Please select a vectorize method!");
		$("#vectorizer").focus();
		return false;
	}
	
	if ($("#n_features").val() < 10 || $("#n_features").val() > 1000){
		alert("The valid range of features is between 10 to 1000!");
		$("#n_features").focus();
		return false;
	}
	
	if ($("#n_topics").val() < 2 || $("#n_topics").val() > 50){
		alert("The valid range of topics is between 2 to 50!");
		$("#n_topics").focus();
		return false;
	}
	
	return true;
	
}
