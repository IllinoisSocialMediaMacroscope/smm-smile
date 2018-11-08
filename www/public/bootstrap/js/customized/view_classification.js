$(document).ready(function(){
	$(".train").hide();
	$(".split").hide();
	$(".predict").hide();
	$(".uuid").hide();
	
	// for select
	if (s3FolderName == undefined) s3FolderName = 'local';
	$.ajax({
		type:'POST',
		url:'list', 
		data: {"s3FolderName":s3FolderName},			
		success:function(data){
			if (data){
				if ('ERROR' in data){
					$("#loading").hide();
					$("#background").show();
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					$.each(data, function(key,val){
						$("#selectFile").append($("<optgroup></optgroup>")
							.attr("label",key));
						$.each(val, function(key2,val2){
							$("#selectFile").find(`optgroup[label='` +key +`']`).after($("<option></option>")
								.attr("value", val2)
								.attr("class", key)
								.attr("id", key2)
								.text(key2));
						});
					});	
					// show select and hide loading bar 4
					$("#selectFile").show();
					$("#selectLoading").hide();
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
	
	// for preview
	$("#selectFile").on('change',function(){
		var prefix = $(this).children(":selected").val();
		var directory = $(this).children(":selected").attr("class");
		
		$("#selectFilePreview-container").empty();
		$("#selectFileHeader-container").empty();
		
		// add loading bar here for preview
		$("#preview-loading").show();
		
		// for select
		$.ajax({
			type:'POST',
			url:'render', 
			data: {"prefix":prefix},				
			success:function(data){
				if (data){
					if ('ERROR' in data){
						$("#loading").hide();
						$("#background").show();
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						if (directory == 'twitter-Tweet' || directory == 'twitter-Stream' || directory == 'twitter-User'){
							var allowedFieldList = ['text', '_source.text', 'description'];
						}
						else if (directory == 'reddit-Post' || directory =='reddit-Search' || directory == 'reddit-Comment'
						|| directory == 'reddit-Historical-Comment' || directory == 'reddit-Historical-Post'){
							var allowedFieldList = ['title','body','_source.body','_source.title'];
						}
						else if (directory == 'crimson-Hexagon'){
							var allowedFieldList = ['contents'];
						}
                        text_data = previewSelectedFile(allowedFieldList, data);

						// hide loading bar
						$("#preview-loading").hide();
						
						$("#selectFilePreview-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
						$("#selectFilePreview").append(arrayToTable(text_data.slice(0,11),'#selectFileTable'));
												
						// hidden field here to divide using aws lambda or batch
						$(".length").val(text_data.length-1);
						$(".dataset").val(prefix);
						
						// offer crawling for reddit comments modal
						if(directory === 'reddit-Post' || directory === 'reddit-Historical-Post' || directory === 'reddit-Search'){
							$("#getComment").show();
						}else{
							$("#getComment").hide();
						}
						
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
	
	$("#task").on('change',function(){
		$("#citation-container").hide();
		$("#citation-notice").empty();
		if ($("#task option:selected").val() !== 'Please Select...'){
			$("#citation-notice").append(
				`<p><b>Thank you for using our tool, if you use these results please cite it and the Python Scikit Library:</b></p>
				<ul>
					<li>Yun, J. T., Vance, N., Wang, C., Troy, J., Marini, L., Booth, R., Nelson, T., Hetrick, A., Hodgekins, H. (2018). 
					The Social Media Macroscope. In Gateways 2018.&nbsp<a href="https://doi.org/10.6084/m9.figshare.6855269.v2" target="_blank">
					https://doi.org/10.6084/m9.figshare.6855269.v2</a>
					</li>
					<li><a href="https://scholar.google.com/scholar?hl=en&as_sdt=0%2C14&q=Scikit-learn%3A+Machine+learning+in+Python&btnG=" target="_blank">
					Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Vanderplas, J. (2011). Scikit-learn: 
					Machine learning in Python. Journal of Machine Learning Research, 12(Oct), 2825-2830.</a>
					</li>
				</ul>`
			);
			$("#citation-container").show();
		}
	});
	
});

function addUUID(uuid){
	if (uuid !== ''){
		$("#ID-code h3").text(uuid);
	}
}

function showUUID(){
	$("#uuid-modal").modal('show');
}

function appendInstruction(ID, len_training, len_testing){
	$(ID).empty();
	$(ID).append(`<h2>Instruction</h2>
								<div id="split-stats" style="padding:40px 100px;background-color:white;overflow:auto;">
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
	var prefix = $("#selectFile").children(":selected").val();
	var ratio = $("#ratio").val();
	if (s3FolderName == undefined) s3FolderName = 'local'
	var data = "ratio=" + ratio 
	+ "&s3FolderName=" + s3FolderName
	+ "&prefix="+ prefix;
	
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
					$("#uuid-modal").modal('show');

                    appendIntermediateDownload("#intermediate-download", data.download)
					appendInstruction("#gaudge",data.len_training, data.len_testing);
					appendDownload("#side-download",data.download);
					appendImg("#img-container",data.img);
					appendPreview('#result-container','');
					
					// ADD to tag
					$("#jobId").val(data.uuid);	
					
					// ADD TO CLOWDER MODAL
					$("#clowder-files-list").empty();
					clowderFileGen(data.download);
					clowderFileMeta();
					$('.fileTags').tagsinput({ freeInput: true });
					
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
		if (s3FolderName == undefined) s3FolderName = 'local'
		var formData = new FormData();
		formData.append('labeled', file, file.name);
		formData.append('uuid', $("#uuid").val());
		formData.append('classifier',$("#classifier option:selected").val());
		formData.append('s3FolderName',s3FolderName);
		
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
					$("#uuid-modal").modal('show');
					$("#gaudge").empty();

                    appendIntermediateDownload("#intermediate-download", data.download)
					appendImg("#img-container",data.img);
					appendDownload("#side-download",data.download);
					appendPreview('#result-container',data.preview);
					
					// ADD to tag
					$("#jobId").val(data.uuid);	
					
					// ADD TO CLOWDER MODAL
					$("#clowder-files-list").empty();
					clowderFileGen(data.download);
					clowderFileMeta();
					$('.fileTags').tagsinput({ freeInput: true });
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

/*-----------------------predict -------------------------------------------*/
function predict(){
	
	if (formValidation('predict')){
		
		if (s3FolderName == undefined) s3FolderName = 'local'
		var prefix = $("#selectFile").children(":selected").val();
		var data = "uuid=" + $("#uuid").val() + "&s3FolderName=" + s3FolderName  + "&prefix=" + prefix;
		
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
					
					// addUUID(data.uuid);
					// $("#uuid-modal").modal('show');
					appendImg("#img-container",data.img);
					appendDownload("#side-download",data.download);
					appendPreview('#result-container',data.preview);
					
					$("#jobId").val(data.uuid);	
					
					// ADD TO CLOWDER MODAL
					$("#clowder-files-list").empty();
					clowderFileGen(data.download);
					clowderFileMeta();
					$('.fileTags').tagsinput({ freeInput: true });
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
		
	if (task === 'train'){
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
