/*------------------------------invoke clowder modal-------------------------------*/
function invoke_clowder(){
	$.ajax({
			type:'POST',
			url:'check-clowder-login', 
			data: {},			
			success:function(data){
				if (data === 'logged'){
					generate_dataset_list();
					$("#clowder-modal").modal('show');
				}else{
					$("#clowder-login-modal").modal('show');
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

function generate_dataset_list(){
	console.log('lalala');
	$.ajax({
			type:'POST',
			url:'list-dataset', 
			data: {},			
			success:function(data){
				if ('ERROR' in data){
					$("#clowder-modal").modal('hide');
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');					
				}else{
					// get a list, and add them to the select dataset options
					$("#selectDataset").empty();
					$("#selectDataset").append(`<option value="Please Select...">Please Select...</option> 
								<option value="newDataset">Create a new dataset</option>`);					
					$.each(data,function(i,val){
						$("#selectDataset").append(`<option value="`+ val.id +`">` + val.name + `</option>`);
					});
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

/*--------------------------------login---------------------------------------------*/
function submit_clowder_login(){
	if (clowder_form_validation('login')){
		var data = {'clowder_username':$("#clowderEmail").val(), 
					'clowder_password':$("#clowderPassword").val()};
		$.ajax({
			type:'POST',
			url:'clowder-login', 
			data: data,			
			success:function(data){
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					//hide login modal and show dataset modal
					$("#clowder-login-modal").modal('hide');
					generate_dataset_list();
					$("#clowder-modal").modal('show');
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

/*-------------------------------create new dataset---------------------------------*/
$("#selectDataset").on('change',function(){
	if ($("#selectDataset option:selected" ).val() === 'newDataset'){
		$("#newDataset-block").show();
	}else{
		$("#newDataset-block").hide();
	};
});

//metadata
$("#datasetMeta select").on('change',function(){
	var selected = $("#datasetMeta select option:selected" );
	
	// need to make sure if this ID has already exist(means this field has already been modified
	if (selected.val() !== 'Please Select...' && $("#" + selected.val()).length == 0){
		
		$("#datasetMeta-block").append(`<div class="form-group" id="`+ selected.val()+ `">
									<div class="col-md-4 col-md-4 col-xs-12">
										<p style="float:right;margin-top:5px;">` + selected.text() +`</p>
									</div>
									<div class="col-md-4 col-md-4 col-xs-12">
										<input type="text" class="form-control" placeholder="field value">
									</div>
									<div class="col-md-4 col-md-4 col-xs-12">
										<button class="btn btn-primary" style="margin:auto 5px;" onclick="saveMeta_D('#` 
											+selected.val()+ `')">Save</button>
										<button class="btn btn-warning" onclick="removeMeta_D('#`
											+selected.val()+ `')">remove</button>
									</div>
								</div>`);
	}else{
		$("#modal-message").append(`<h4>You have already selected this metadata field!</h4>`);
		$("#alert").modal('show');
	};
});

//save metadata
function saveMeta_D(metaID){
	// if value has content, save; if not, do not allow to save
	var value = $(metaID + ' :input[type=text]').val();
	if ( value !== '' && value !== undefined ){
		$(metaID + ' :input[type=text]').prop('disabled', true);
	}else{
		$("#modal-message").append(`<h4>Please enter a value before you save it.</h4>`);
		$("#alert").modal('show');
	}
}

//remote metadata
function removeMeta_D(metaID){
	$(metaID).remove();
}

//tags
$('#datasetTags').tagsinput({
	freeInput: true
});


function clowder_form_validation(caseID){
	switch (caseID){
		case 'dataset':
			if ($("#selectDataset option:selected" ).val() === 'newDataset'){
				if ($("#datasetTitle").val() === '' || $("#datasetTitle").val() ===undefined){
					$("#modal-message").append(`<h4>You must fill in the title for a new dataset.</h4>`);
					$("#alert").modal('show');
					return false;
				}
			}
			break;
			
		case 'login':
			if ( $("#clowderEmail").val() === '' || $("#clowderPassword").val() === '' || $("#clowderEmail").val().indexOf("@") == -1){
				$("#modal-message").append(`<h4>You must have already registered with Clowder and provide us with your valid username and password.</h4>
											<a href="https://socialmediamacroscope.ncsa.illinois.edu/clowder/" target="_blank">Clowder Registration</a>`);
				$("#alert").modal('show');
				return false;
			}
			break;
		
		default:
			return false
	}
	
	return true;
}

function submit_clowder_dataset(){
	
	// if create new dataset
	if ($("#selectDataset option:selected" ).val() === 'newDataset'){
		var data = {}
		// title
		data['title'] = $("#datasetTitle").val();
		
		// descriptions
		if ($("#datasetDesc").val() !== '' && $("#datasetDesc").val() !== undefined){
			data['descriptions'] = $("#datasetDesc").val();
		}
		
		// metadata
		if ($("#datasetMeta-block").children().length > 0){
			data['metadata'] = {};
			$.each($("#datasetMeta-block").children(), function(i,val){
				
				//map it back to the field name in the select
				var metadata_id = val.id;
				var metadata_field = $('#datasetMeta option[value="' + metadata_id +'"]').text();
				var metadata_value = $("#" + metadata_id).find('input:disabled').val();
				
				// field must be saved (disabled)
				if (metadata_value !== '' && metadata_value !== undefined){
					data['metadata'][metadata_field] = metadata_value
				}
			});
		}
		
		// tags
		if ($(".tag.label.label-info")[0]){
			data['tags'] = [];
			$(".tag.label.label-info").each(function(i,val){
				data['tags'].push($(val).text());
			});
		}
		
		if (clowder_form_validation('dataset')){
			$.ajax({
				type:'POST',
				url:'clowder-dataset', 
				data: JSON.stringify(data),	
				contentType: "application/json",			
				success:function(data){
					if ('ERROR' in data){
						$("#error").val(JSON.stringify(data));
						$("#warning").modal('show');
					}else{
						//hide dataset block, open files block
						$("#clowder-dataset-block").hide();
						$("#clowder-files-block").show();
		
						//put id in the files block
						var datasetID = data.id;
						$("#datasetID").val(datasetID);
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
	// if select an old dataset
	else{
		//hide dataset block, open files block
		$("#clowder-dataset-block").hide();
		$("#clowder-files-block").show();
		
		//put id in the files block
		var datasetID = $("#selectDataset option:selected").val();
		$("#datasetID").val(datasetID);
	}
		
	
}