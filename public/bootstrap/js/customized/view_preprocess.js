google.charts.load('current', {packages:['wordtree']});

function drawWordTree(name,table,root){
	
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
	
	var data = google.visualization.arrayToDataTable(table);
	var options = {
          wordtree: {
            format: 'implicit',
			word:root.toLowerCase()
          }
        };
	var chart = new google.visualization.WordTree(document.getElementById('chart_div'));
        chart.draw(data, options);
}

$(document).ready(function(){
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
					/* the text fields are:  text, user.description(tweet), description(twtUser),
					body(redditComment), selftext,title(redditSearch), 
					public description, description(redditSearchSubreddit)*/
					var allowed_field_list = ['text','user.description','_source.text', '_source.user.description','description','body','selftext', 'title', 'public_description', 
						'description'];
					
					var index = [];
					$.each(data.preview[0],function(i,val){
						if (allowed_field_list.indexOf(val) >=0){
							index.push(i)
						}
					});
					var text_data = [];
					$.each(data.preview,function(i,val){
						var line = [];
						$.each(index,function(i,indice){
							line.push(val[indice]);
						});
						text_data.push(line);
					});
					
					$("#selectFilePreview-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
					$("#selectFilePreview").append(arrayToTable(text_data ,'#selectFileTable'));
					//$("#selectFileTable").DataTable();
					
					$("#selectFileHeader-container").append(`<div class="form-group">
					<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
					<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
					$("#selectFileHeader").append(extractHeader2(text_data));
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
	if ($("#file").is(":checked")){
		
		if ($("#selectFile option:selected").val() === 'Please Select...' || $("#selectFile option:selected").val() === undefined){
			alert("Please select a csv file from your folder!");
			$("#selectFile").focus();
			return false;
		}
		
		if ($("#model option:selected").val() === '' || $("#model option:selected").val() === undefined){
			alert("Please select a preprocess step!");
			$("#model").focus();
			return false;
		}
		
		if ($("#tagger option:selected").val() === '' || $("#tagger option:selected").val() === undefined){
			alert("Please select a tagging step!");
			$("#tagger").focus();
			return false;
		}
		
		if ($("input[name='selectFileColumn']:checked").val() === '' ||$("input[name='selectFileColumn']:checked").val() === undefined){
			alert("Please select a column of the text to analyze!");
			return false;			
		}
		
	}else if ($("#URL").is(":checked")){
		if ($("#link").val() === '' || $("#link").val() === undefined){
			alert("Please input the URL of the document that you want t !");
			$("#link").focus();
			return false;
		}
		
		if ($("#model option:selected").val() === '' || $("#model option:selected").val() === undefined){
			alert("Please select a preprocess step!");
			$("#model").focus();
			return false;
		}
		
		if ($("#tagger option:selected").val() === '' || $("#tagger option:selected").val() === undefined){
			alert("Please select a tagging step!");
			$("#tagger").focus();
			return false;
		}
	}else{
		alert("Please select the format between File and URL!");
		return false;
	}
	
	return true;
	
}
