/*------------------------------invoke clowder modal-------------------------------*/
function invoke_clowder(){
	$.ajax({
		type:'POST',
		url:'check-clowder-login', 
		data: {},			
		success:function(data){
			// if logged, move on to the next modal
			if (data === 'logged'){
				$("#clowder-modal").modal('show');
			
			// if not, prompt to log in first
			}else{
				$("#clowder-login-modal").modal('show');
			}
		},
		error: function(jqXHR, exception){
			$("#error").val(jqXHR.responseText);
			$("#warning").modal('show');				
		} 
	}); 
}

// if modal show, generate_data_list
$('#clowder-modal').on('shown.bs.modal', function (e) {
	generate_data_list();
})

function generate_data_list(){
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
				$("#error").val(jqXHR.responseText);
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
					$("#clowder-login-modal").modal('hide').on('hidden.bs.modal',function(){
						$("#clowder-modal").modal('show');
					});
				}
			},
			error: function(jqXHR, exception){
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');
			} 
		}); 
	}
	
}

/*-------------------------------create new dataset---------------------------------*/
$("#selectDataset").on('change',function(){
	if ($("#selectDataset option:selected" ).val() === 'newDataset'){
		$("#clowder-new-dataset").modal('show');
		
		// disable the next button incase people accidently hit it without dataID available
		$("#clowder_next").prop('disabled',true);
	}else if ($("#selectDataset option:selected" ).val() === 'Please Select...'){
		$("#clowder_next").prop('disabled',true);
	}else{
		$("#clowder_next").prop('disabled',false);
	}
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
		case 'files':
			if ($("#datasetID").val() === 'Please Select...' || $("#datasetID").val() === '' || $("#datasetID").val() === 'newDataset'){
				$("#modal-message").append(`<h4>You must provide a dataset that you want to upload files to, please go back to the last step!</h4>`);
				$("#alert").modal('show');
				return false;
			}
			
			if ($("#clowder-files-list").children().length <= 0){
				$("#modal-message").append(`<h4>You have no computation results to upload!</h4>`);
				$("#alert").modal('show');
				return false;
			}else{
				var flag = false;
				$("#clowder-files-list .form-control .form-check-input").each(function(i,cbox){
					if ($(cbox).attr('checked')){
						flag = true;
					}
				});
				if (!flag){
					$("#modal-message").append(`<h4>You must at least select one file to upload!</h4>`);
					$("#alert").modal('show');
					return false;
				}
			}
			
			break;
		
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

// CREATE button
function create_clowder_dataset(){
	
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
		
		var urls = [];
		$("#clowder-files-list .form-control .form-check-input").each(function(i,cbox){
			urls.push($(cbox).val());
		});
		
		$.ajax({
			type:'POST',
			url:'clowder-dataset', 
			data: JSON.stringify({'urls': urls}),	
			contentType: "application/json",			
			success:function(data){
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					console.log(data);
				}
			},
			error: function(jqXHR, exception){
				$("#modal-message").append(`<h4>Please enter a value before you save it.</h4>`);
				$("#alert").modal('show');					
			} 
		}); 
	}
	
	
}

// NEXT Button
function submit_clowder_dataset(){
	//put id in the files block
	var datasetID = $("#selectDataset option:selected").val();
	$("#datasetID").val(datasetID);
	
	//hide dataset block, open files block
	$(".clowder-dataset-block").hide();
	$(".clowder-files-block").show();
}

// PREVIOUS button
function prev_clowder_dataset(){
	// clear out dataset id
	$("#datasetID").val('');
	
	// refresh the dataset list to include the newly created onerror
	generate_data_list();
	
	//hide files block, open dataset block
	$(".clowder-dataset-block").show();
	$(".clowder-files-block").hide();
}

// UPLOAD button
function submit_clowder_files(){
	if (clowder_form_validation('files')){
		$.ajax({
			type:'POST',
			url:'clowder-files', 
			data: JSON.stringify(urls),	
			contentType: "application/json",			
			success:function(data){
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					//close this new modal 
					$("#clowder-new-dataset").modal('hide')
					
					//put id in the files block
					var datasetID = data.id;
					$("#datasetID").val(datasetID);
					
					//switch to files block
					$(".clowder-dataset-block").hide();
					$(".clowder-files-block").show();
					
				}
			},
			error: function(jqXHR, exception){
				$("#modal-message").append(`<h4>Please enter a value before you save it.</h4>`);
				$("#alert").modal('show');					
			} 
		}); 
	};
}