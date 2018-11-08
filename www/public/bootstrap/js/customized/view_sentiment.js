google.charts.load('current', {'packages':['gauge']});
/*--------------------------------draw gaudge---------------------------------------*/
function drawGauge(name,compound) {
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title"><h2>`+ name +`</h2></div></div><div class="x_content" id="chart_div"></div>`);
	
	var data = google.visualization.arrayToDataTable([
		['Label', 'Value'],	['Compound', compound],
	]);
	
	console.log($("#gaudge").width());
	var options = {
		width: $("#gaudge").width()*0.25, height: $("#gaudge").width()*0.25,
		
		greenFrom:0.5, greenTo:1.0,
		redFrom: -1, redTo: -0.5,
		yellowFrom:-0.75, yellowTo: 0.5,
		minorTicks: 0.5,
		min:-1,
		max:1
	};

	var chart = new google.visualization.Gauge(document.getElementById('chart_div'));
	chart.draw(data, options);
	
}


$(document).ready(function(){
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
	
	// preview
	$("#selectFile").on('change',function(){
		var prefix = $(this).children(":selected").val();
		var directory = $(this).children(":selected").attr("class");
		$("#selectFilePreview-container").empty();
		$("#selectFileHeader-container").empty();
		
		// add loading bar here for preview
		$("#preview-loading").show();
		
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
						// the text fields are:  text, user.description(tweet), description(twtUser),
						// body(redditComment), selftext,title(redditSearch), 
						// public description, description(redditSearchSubreddit)
						// _source.text, _source.user.description(streaming)
						var allowedFieldList = ['text','user.description','description',
						'_source.text', '_source.user.description','body','title','_source.body','_source.title','contents'];
                        text_data = previewSelectedFile(allowedFieldList, data);
						
						// hide loading bar
						$("#preview-loading").hide();
						
						$("#selectFilePreview-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
						$("#selectFilePreview").append(arrayToTable(text_data.slice(0,11),'#selectFileTable'));
						//$("#selectFileTable").DataTable();
						
						$("#selectFileHeader-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
						$("#selectFileHeader").append(extractHeader2(text_data));
						
						// hidden field here to divide using aws lambda or batch
						$(".length").val(text_data.length-1);
						$(".dataset").val(prefix);
						
						// offer crawling for reddit comments modal
						if(directory === 'reddit-Post' || directory === 'reddit-Historical-Post' || directory === 'reddit-Search'){
							$("#getComment").show(); //button
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
	
	// citation
	$("#algorithm").on('change',function(){
		$("#citation-container").hide();
		$("#citation-notice").empty();
		
		var algorithm = $(this).children(":selected").val();
		if (algorithm === 'vader'){
			$("#citation-notice").append(
				`<p><b>Thank you for using our tool, if you use these results please cite it and the Vader method:</b></p>
				<ul>
					<li>Yun, J. T., Vance, N., Wang, C., Troy, J., Marini, L., Booth, R., Nelson, T., Hetrick, A., Hodgekins, H. (2018). 
					The Social Media Macroscope. In Gateways 2018.&nbsp<a href="https://doi.org/10.6084/m9.figshare.6855269.v2" target="_blank">
					https://doi.org/10.6084/m9.figshare.6855269.v2</a>
					</li>
					<li><a href="http://www.aaai.org/ocs/index.php/ICWSM/ICWSM14/paper/download/8109/8122" target="_blank">
					Hutto, C.J. & Gilbert, E.E. (2014). VADER: A Parsimonious Rule-based Model for Sentiment Analysis of Social Media Text. 
						Eighth International Conference on Weblogs and Social Media (ICWSM-14). Ann Arbor, MI, June 2014.</a>
					</li>
				</ul>`
			);
			$("#citation-container").show();
		}else if (algorithm === 'sentiWordNet'){
            $("#citation-notice").append(
                `<p><b>Thank you for using our tool, if you use these results please cite it and the Vader method:</b></p>
				<ul>
					<li>Yun, J. T., Vance, N., Wang, C., Troy, J., Marini, L., Booth, R., Nelson, T., Hetrick, A., Hodgekins, H. (2018). 
					The Social Media Macroscope. In Gateways 2018.&nbsp<a href="https://doi.org/10.6084/m9.figshare.6855269.v2" target="_blank">
					https://doi.org/10.6084/m9.figshare.6855269.v2</a>
					</li>
					<li><a href="http://nmis.isti.cnr.it/sebastiani/Publications/LREC10.pdf" target="_blank">
					Baccianella, Stefano, Andrea Esuli, and Fabrizio Sebastiani. "Sentiwordnet 3.0: an enhanced lexical 
					resource for sentiment analysis and opinion mining." Lrec. Vol. 10. No. 2010. 2010.</a>
					</li>
				</ul>`
            );
            $("#citation-container").show();
		}
		
	});
	
	// lambda vs batch
	$("#submit").on('click',function(){
		
			if($(".length").val() === undefined){
				// pop error
				$("#modal-message").val("Cannot perform analysis on this dataset. Check if it exists!");
				$("#alert").modal('show');
			}else if ( $(".length").val() <= 10000 ){
				ajaxSubmit(`#analytics-config`,'lambda');
			}else{
				$("#aws-batch").modal('show');
			}
	});
});

/*----------------------form validation ----------------------------*/
function formValidation(aws_identifier){
	
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
	if ($("input[name='selectFileColumn']:checked").val() === '' ||$("input[name='selectFileColumn']:checked").val() === undefined){
		$("#modal-message").append(`<h4>Please select a column of the text to analyze!</h4>`);
		$("#alert").modal('show');
		return false;			
	}
	
	if ($("#algorithm option:selected").val() === 'Please Select...' || $("#algorithm option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select an algorithm</h4>`);
		$("#alert").modal('show');
		$("#algorithm").focus();
		return false;
	}	
	
	if (aws_identifier === 'batch'){
		if($(".dataset").val() === '' || $(".dataset").val() === undefined){
			$("#modal-message").append(`<h4>This dataset you select is invalid.</h4>`);
			$("#alert").modal('show');
			return false
		}
	
		if($(".length").val() === '' 
			|| $(".length").val() === undefined
			|| $(".length").val() === 0){
				$("#modal-message").append(`<h4>This dataset you select has no data!</h4>`);
				$("#alert").modal('show');
				return false
		}
	
		if($("#batch-email-alert").val() === '' 
			|| $("#batch-email-alert").val() === undefined 
			|| $("#batch-email-alert").val().indexOf('@')<= -1){
				$("#modal-message").append(`<h4>Please provide a valid email address so we can reach to you once your collection has completed!</h4>`);
				$("#alert").modal('show');
				return false
		}
	}
	
	return true;
	
}





