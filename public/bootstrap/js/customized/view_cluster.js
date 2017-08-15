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
		$("#selectFileHeader-container").empty();
		$.ajax({
			type:'POST',
			url:'/render', 
			data: {"foldername":foldername, "directory":directory},				
			success:function(data){
				if (data){
					var allowed_field_list = [
						// tweet
						'id','id_str','_source.id','retweet_count','favourite_count','retweeted','favorited','possibly_sensitive','truncated','lang','is_quote_status',
						'user.author_id','user.author_id_str','user.name','user.screen_name','user.tweets_count', 'user.followers_count','user.friends_count',
						'user.listed_count','user.favourites_count','user.statuses_count','user.protected','user.verified','user.is_translator','user.contributors_enabled',
						'user.geo_enabled','user.lang',
						// stream
						'_score','_source.id','_source.id_str','_source.retweet_count','_source.favourite_count','_source.retweeted','_source.favorited','_source.possibly_sensitive',
						'_source.truncated','_source.lang','_source.is_quote_status','_source.user.author_id','_source.user.author_id_str','_source.user.screen_name','_source.user.name',
						'_source.user.tweets_count','_source.user.friends_count','_source.user.followers_count', '_source.user.listed_count',
						'_source.user.favourites_count','_source.user.statuses_count','_source.user.protected','_source.user.verified','_source.user.is_translator',
						'_source.user.contributors_enabled','_source.user.geo_enabled','_source.user.lang',
						// twtUser
						'author_id','author_id_str','screen_name','name','tweets_count','followers_count','friends_count','listed_count','favourites_count','statuses_count','protected',
						'verified','is_translator','contributors_enabled','geo_enabled','lang',
						// reddit
						'over18','display_names','subscribers','subreddit_type',
						'author_name','controversiality','downs','ups','name','num_comments','over_18','parent_id','score',
						'subreddit_id','subreddit_display_name','created'];
					
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
					
					$("#selectFileHeader-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
					$("#selectFileHeader").append(extractHeader1(numCat_data));
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
	if ($("input[name='fields']:checked").val() === '' ||$("input[name='fields']:checked").val() === undefined){
		alert("Please select a column of the text to analyze!");
		return false;			
	}else if ($("input[name='fields']:checked").length < 2){
		alert("Must select at least two columns!");
		return false;
	}
	if ($("#model option:selected").val() === '' || $("#model option:selected").val() === undefined){
		alert("Please select a model to perform!");
		$("#model").focus();
		return false;
	}
	if ($("#n_clusters").val()< 2 || $("#n_clusters").val() > 20){
		alert("The valid number of cluster is between 0 to 20!");
		$("#n_clusters").focus();
		return false;
	}
	
	return true;
	
}