//create new dataset
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
		
		$("#datasetMeta").after(`<div class="form-group" id="`+ selected.val()+ `">
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
		alert('You have already selected this metadata field!');
	};
});

//save metadata
function saveMeta_D(metaID){
	// if value has content, save; if not, do not allow to save
	var value = $(metaID + ' :input[type=text]').val();
	if ( value !== '' && value !== undefined ){
		$(metaID + ' :input[type=text]').prop('disabled', true);
	}else{
		alert('Please enter a value');
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