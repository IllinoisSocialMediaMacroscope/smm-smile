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
$(document).ready(function(){
	$('#clowder-modal').on('shown.bs.modal', function (e) {
		generate_data_list();
	})
});

function generate_data_list(){
		// lodading gif
		$(".clowder-dataset-block").find('img').show();
		$("#selectDataset").hide();
		
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
					
					// hide loading bar show selectDataset
					$(".clowder-dataset-block").find('img').hide();
					$("#selectDataset").show();
				}
			},
			error: function(jqXHR, exception){
				$("#error").val(jqXHR.responseText);
				$("#warning").modal('show');				
			} 
		}); 
	}

/*--------------------------------login---------------------------------------------*/
function login_request(){
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

function submit_clowder_login(){
	login_request();
}


$("#clowderPassword").on('keypress',function(e){
	if (e.keyCode === 13 || e.keycode == 10){
		e.preventDefault(); 
		login_request();
	}
});



/*-------------------------------create new dataset---------------------------------*/

	$("#selectDataset").on('change',function(){
		if ($("#selectDataset option:selected" ).val() === 'newDataset'){
			$("#clowder-new-dataset").modal('show');
			
			// disable the next button incase people accidently hit it without dataID available
			$("#clowder-next").prop('disabled',true);
		}else if ($("#selectDataset option:selected" ).val() === 'Please Select...'){
			$("#clowder-next").prop('disabled',true);
		}else{
			$("#clowder-next").prop('disabled',false);
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
										<button class="btn btn-primary" style="margin:auto 5px;" onclick="saveMeta('#` 
											+selected.val()+ `')">Save</button>
										<button class="btn btn-warning" onclick="removeMeta('#`
											+selected.val()+ `')">remove</button>
									</div>
								</div>`);
	}else{
		$("#modal-message").append(`<h4>You have already selected this metadata field!</h4>`);
		$("#alert").modal('show');
	};
});

//tags
$('#datasetTags').tagsinput({
	freeInput: true
});


//save metadata
function saveMeta(metaID){
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
function removeMeta(metaID){
	$(metaID).remove();
}

// CREATE button
function create_clowder_dataset(){
	
	if (clowder_form_validation('dataset')){
		
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
		if ($("#clowder-new-dataset").find(".tag.label.label-info")[0]){
			data['tags'] = [];
			$("#clowder-new-dataset").find(".tag.label.label-info").each(function(i,val){
				data['tags'].push($(val).text());
			});
		}
		
		// loading gif
		$("#clowder-new-dataset .modal-dialog .modal-footer img").show();
		$("#clowder-create").hide();
	
		
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
					//loading gif resume
					$("#clowder-new-dataset .modal-dialog .modal-footer img").hide();
					$("#clowder-create").show();
					
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


/*---------------------------------------------------files---------------------------------------------------*/
function clowderFileGen(datalist){
	$.each(datalist, function(i,val){
		//id = url -->
		$("#clowder-files-list")
			.append(`<div class="form-control" style="margin:15px auto;height:100%;background-color:#eee;">
						<input type="checkbox" class="form-check-input" value="`+ val.content + `"/>
						<label class="form-check-label"> &nbsp; ` + val.name + `</label>
						<a onclick="clowderFileAdvanceToggle(this);" href="#">
							<span class="pull-right">
								<span class="glyphicon glyphicon-pencil" style="vertical-align:middle;">Edit</span>
							</span>
						</a>
						<div class="clowderFileAdvance" style="display:none;">
							<div class="control-group">
								<label class="control-label">Descriptions</label>
								<textarea class="form-control" rows="5" style="resize:none;" placeholder="A longer description"/>
							</div>
							<div class="control-group fileMeta">
								<label class="control-label">Add Metadata</label>
								<select class="form-control">
									<option value="Please Select...">Please Select...</option>
									<option value="CSDMSStandardName">CSDMS Standard Name</option>
									<option value="DateandTime">Date and Time</option>
									<option value="FundingInstitution">Funding Institution</option>
									<option value="GeoJSON">GeoJSON</option>
									<option value="GrantNumber">ODM2 Variable Name</option>
									<option value="PrimaryInitialPublication">Primary/Initial Publication</option>
									<option value="PrincipalInvestigator">Principal Investigator(s)</option>
									<option value="References">References</option>
									<option value="RelatedPublications">Related Publications</option>
									<option value="SASSpatialGeocode">SAS Spatial Geocode</option>
									<option value="SASVariableName">SAS Variable Name</option>
									<option value="TimePeriods">Time Periods</option>
									<option value="Unit">Unit</option>
								</select>
							</div>
							<div class="fileMeta-block"></div>
							<div class="control-group">
								<label class="control-label">Add Tags</label>
								<input type="text" class="fileTags" data-role="tagsinput" placeholder="Type, Enter, Backspace, L/R"/>
							</div>
						</div>
					</div>`);
	});
}

function clowderFileMeta(){
	$(".control-group.fileMeta select").on('change',function(){
		
		var selected = $(this).find(":selected");
		
		// first find the file block, then find fileMeta-block inside of this
		var fileMeta_block = $(this).parent().parent().find('.fileMeta-block');

		// need to make sure if this ID has already exist(means this field has already been modified
		if (selected.val() !== 'Please Select...' && $("#" + selected.val()).length == 0){
			
			fileMeta_block
				.append(`<div class="form-group" id="`+ selected.val()+ `">
							<div class="col-md-4 col-md-4 col-xs-12">
								<p style="float:right;margin-top:5px;">` + selected.text() +`</p>
							</div>
							<div class="col-md-4 col-md-4 col-xs-12">
								<input type="text" class="form-control" placeholder="field value">
							</div>
							<div class="col-md-4 col-md-4 col-xs-12">
								<button class="btn btn-primary" style="margin:auto 5px;" onclick="saveMeta('#` 
									+selected.val()+ `')">Save</button>
								<button class="btn btn-warning" onclick="removeMeta('#`
									+selected.val()+ `')">remove</button>
							</div>
						</div>`);
		}else{
			$("#modal-message").append(`<h4>You have already selected this metadata field!</h4>`);
			$("#alert").modal('show');
		};
	});
}

// toggle effect
function clowderFileAdvanceToggle(e){
	$(e).parent().find('.clowderFileAdvance').toggle();
}

// UPLOAD button
function submit_clowder_files(){
	
	if (clowder_form_validation('files')){
		
		/***************effects***********************************/
		$("#clowder-modal .modal-dialog .modal-footer img").show();
		$("#clowder-upload").hide();
		$("#clowder-prev").hide();
		
		/***************collect data******************************/
		var data = {}
		data['dataset_id'] = $("#datasetID").val();
		
		// loop through each file
		$("#clowder-files-list .form-control").each(function(i,file){
			if ($(file).find(".form-check-input").is(':checked')){
				var url = $(file).find(".form-check-input").val();
				data[url] = {};
				
				// descriptions
				if ($(file).find("textarea").val() !== ''){
					data[url]['descriptions'] = $(file).find("textarea").val();
				}
				// metadata
				if ($(file).find(".fileMeta-block").children().length >0){
					var metadata = {};
					$.each($(file).find(".fileMeta-block").children(), function(i,val){
						//map it back to the field name in the select
						var metadata_id = val.id;
						var metadata_field = $('#datasetMeta option[value="' + metadata_id +'"]').text();
						var metadata_value = $("#" + metadata_id).find('input:disabled').val();
						// field must be saved (disabled)
						if (metadata_value !== '' && metadata_value !== undefined){
							metadata[metadata_field] = metadata_value
						}
					});
					data[url]['metadata'] = metadata;
				}
				// tags
				if ($(file).find(".tag.label.label-info")[0]){
					data[url]['tags'] = [];
					$(file).find(".tag.label.label-info").each(function(i,val){
						data[url]['tags'].push($(val).text());
					});
				}	
			}
		});
		
		$.ajax({
			type:'POST',
			url:'clowder-files', 
			data: JSON.stringify(data),	
			contentType: "application/json",			
			success:function(data){
				if ('ERROR' in data){
					$("#error").val(JSON.stringify(data));
					$("#warning").modal('show');
				}else{
					//loading gif resume
					$("#clowder-modal .modal-dialog .modal-footer img").hide();
					$("#clowder-upload").show();
					$("#clowder-prev").show();
					
					$("#clowder-message").text(data.info);
					$("#file-links").empty();
					$.each(data.ids, function(i,id){
						$("#file-links").append(`<a style="display:block;font-size:15px;" href="https://socialmediamacroscope.ncsa.illinois.edu/clowder/files/`
						+ id +`">https://socialmediamacroscope.ncsa.illinois.edu/clowder/files/` + id + `</a>`);
					});
					// hide upoad modal, show confirmation modal
					$("#clowder-modal").modal('hide').on('hidden.bs.modal',function(){
						$("#clowder-confirmation").modal('show');
					});
				}
			},
			error: function(jqXHR, exception){
				$("#modal-message").append(`<h4>Please enter a value before you save it.</h4>`);
				$("#alert").modal('show');					
			} 
		}); 
	};
}

/*---------------------------------validation--------------------------------------------*/
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
					if ($(cbox).is(':checked')){
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
