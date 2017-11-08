$(document).ready(function(){
	$(".train").hide();
	$(".split").hide();
	$(".predict").hide();
	$(".uuid").hide();
	
	$("#selectFile").on('change',function(){
		var foldername = $(this).children(":selected").attr("id");
		var directory = $(this).children(":selected").attr("class");
				
		$("#selectFilePreview-container").empty();
		$("#selectFileHeader-container").empty();
		$.ajax({
			type:'POST',
			url:'render', 
			data: {"foldername":foldername, "directory":directory},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#loading").hide();
						$("#background").show();
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						var allowed_field_list = [
							// tweet
							'text',
							// stream
							'_source.text',
							// twtUser
							'description', 
							// reddit
							'title','body'];
						
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
	
	$("#labeled").on('change',function(){
		if ($("#labeled").get(0).files[0] === undefined){
			var fname = '';
		}else{
			var fname = $("#labeled").get(0).files[0].name;
		}
		$("#labeled-fname").text(fname);
	});
	
	$("#task").on('change',function(){
		var task = $(this).children(":selected").attr("value");
		if (task === 'split'){
			// enable file selection and hide "train" and "predict" configuration
			$("#selectFile").prop('disabled',false);
			$(".split").show();
			$(".train").hide();
			$(".uuid").hide();
			$(".predict").hide();
		}
		else if (task === 'train'){
			// disable sselect file and hide "split" and "predict" configuration
			$("#selectFile").prop('disabled',true);
			$(".train").show();
			$(".split").hide();
			$(".uuid").show();
			$(".predict").hide();
		}
		else if (task === 'predict'){
			// disable sselect file and hide "split" and "predict" configuration
			$("#selectFile").prop('disabled',true);
			$(".train").hide();
			$(".split").hide();
			$(".uuid").show();
			$(".predict").show();
		}else{
			$("#selectFile").prop('disabled',false);
		}
			
	});
	
});

function addUUID(uuid){
	if (uuid !== ''){
		$("#ID-code h3").text(uuid);
		$("#uuid-modal").modal('show');
	}
}

function showUUID(){
	$("#uuid-modal").modal('show');
}

function appendInstruction(ID, len_training, len_testing){
	$(ID).empty();
	$(ID).append(`<h2>Instruction</h2>
								<div id="split-stats" style="padding:40px 100px;background-color:white;">
									<p style="font-size:20px;">
										<b>Please download the training set, labeling your trainig set following the description below, and uploading this labeled file in the next step:</b> <br><br> 
										We train the text classification model to recognize the category of a certain piece of text by offering them examples, and
										Labeling the training set is the step to create such examples. Labels can be obtained by asking humans to make judgments 
										about a given piece of unlabeled data. 
										<br>
										<br>For example:<br> 
										<i>"Does this tweet contain a horse or a cow?" -- You can put <b>"cow"</b> or <b>"horse"</b> in the "category" column in the training set</i><br>
										<i>"Is this tweet a original tweet, retweet, or mentions someone?" -- You can put <b>"original"</b>,<b>"retweet"</b> or <b>"mentions"</b> in the "category" column in the training set</i>
									</p>
									<h2 style="color:black;">labeling in excel:<h2>
									<img src="bootstrap/img/gifs/labeling.gif" style="display:block; margin:auto;"/>
								</div>`);
}
/*-----------------------split --------------------------------------------*/
function split(){
	
	var foldername = $("#selectFile").children(":selected").attr("id");
	var directory = $("#selectFile").children(":selected").attr("class");
	var ratio = $("#ratio").val();
	var data = "ratio=" + ratio + "&filename="+ directory + "/" + foldername + "/" + foldername + ".csv&foldername=" + foldername;
	
	if (formValidation('split')){
		
		$(".loading").show();
		$.ajax({
			type:'POST',
			url:'text-classification-split', 
			data:data,				
			success:function(data){
				if ('ERROR' in data){
					$(".loading").hide();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$(".loading").hide();
					addUUID(data.uuid);
					appendInstruction("#gaudge",data.len_training, data.len_testing);
					
					appendDownload("#side-download",data.download);
					appendImg("#img-container",data.img);
					appendPreview('#result-container','');
					
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

/*-----------------------train -------------------------------------------*/
function train(){
	
	if (formValidation('train')){
		
		
		var file = $("#labeled").get(0).files[0];
		var formData = new FormData();
		formData.append('labeled', file, file.name);
		formData.append('uuid', $("#uuid").val());
		formData.append('classifier',$("#classifier option:selected").val());
		
		$(".loading").show();
		$.ajax({
			type:'POST',
			url:'text-classification-train', 
			data:formData,	
			processData:false,
			contentType:false,
			async: true,
			cache:false,
			success:function(data){
				if ('ERROR' in data){
					$(".loading").hide();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$(".loading").hide();
					addUUID(data.uuid);
					$("#gaudge").empty();
					
					appendImg("#img-container",data.img);
					appendDownload("#side-download",data.download);
					appendPreview('#result-container',data.preview);
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

/*-----------------------train -------------------------------------------*/
function predict(){
	
	if (formValidation('predict')){
		
		var data = "uuid=" + $("#uuid").val();
		$(".loading").show();
		$.ajax({
			type:'POST',
			url:'text-classification-predict', 
			data:data,	
			success:function(data){
				if ('ERROR' in data){
					$(".loading").hide();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$(".loading").hide();
					$("#gaudge").empty();
					
					addUUID(data.uuid);
					appendImg("#img-container",data.img);
					appendDownload("#side-download",data.download);
					appendPreview('#result-container',data.preview);
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
/*----------------------form validation ----------------------------*/
function formValidation(task){
	
	if (task === 'split'){
		if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
			$("#modal-message").append(`<h4>Please select a csv file from your folder!</h4>`);
			$("#alert").modal('show');
			$("#selectFile").focus();
			return false;
		}
		
		if ($("#selectFileTable thead tr").find('th').text() === ''){
			$("#modal-message").append(`<h4>This dataset you selected is empty, please select another one!</h4>`);
			$("#alert").modal('show');
			$("#selectFile").focus();
			return false;
		}
	}else if (task === 'train'){
		if	($("#labeled").val() == '' || $("#labeled").val()=== undefined){
			$("#modal-message").append(`<h4>Please upload a LABELED csv file!</h4>`);
			$("#alert").modal('show');
			return false;
		}
		if ($("#classifier option:selected").val() === 'Please Select...' || $("#classifier option:selected").val() === undefined){
			$("#modal-message").append(`<h4>You must select a classification algorithm</h4>`);
			$("#alert").modal('show');
			$("#classifier").focus();
			return false;
		}
		if ($("#uuid").val() == '' || $("#uuid").val() === undefined){
			$("#modal-message").append(`<h4>Please input the identification code from Step 1. If you don't have it anymore, please go back to last step and generate a new one.</h4>`);
			$("#alert").modal('show');
			return false;
		}
		
	}
	else if (task === 'predict'){
		if ($("#uuid").val() == '' || $("#uuid").val() === undefined){
			$("#modal-message").append(`<h4>Please input the identification code from Step 1. If you don't have it anymore, please go back to last step and generate a new one.</h4>`);
			$("#alert").modal('show');
			return false;
		}
	}
	return true;
	
}