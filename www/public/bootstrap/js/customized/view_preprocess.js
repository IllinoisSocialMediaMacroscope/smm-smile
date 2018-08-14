google.charts.load('current', {packages:['wordtree']});

function drawWordTree(name,table,root){
	
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title">
							<h2>`+ name +`</h2>
						</div>
						<div class="x_content"> 
							<div class="note">
								<li>word tree reads from <b>left to right</b>, and each branch is a sentence/phrase</li>					
								<li><b>click</b> on the word will expand or collapse the tree</li>
								<li>size of the word stands for the <b>weight</b> of the word, which is proportional to their usage</li>
								<li>details please consult 
									<a href="https://developers.google.com/chart/interactive/docs/gallery/wordtree" target="_blank">
										<img src="bootstrap/img/logo/google-sm-logo.png" width="18px"/>Google Chart API
									</a>
								</li>
							</div>
						</div>
						<div class="x_content" id="chart_div">
						</div>`);
	
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
						/* the text fields are:  text, user.description(tweet), description(twtUser),
						body(redditComment), selftext,title(redditSearch), 
						public description, description(redditSearchSubreddit)*/

						var allowedFieldList = ['text','user.description','_source.text', '_source.user.description',
							'description', 'body','title','_source.body','_source.title', 'contents'];
						text_data = previewSelectedFile(allowedFieldList, data);

						// hide loading bar
						$("#preview-loading").hide();
						
						$("#selectFilePreview-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">preview data</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFilePreview"></div></div>`)				
						$("#selectFilePreview").append(arrayToTable(text_data.slice(0, 11) ,'#selectFileTable'));
						
						$("#selectFileHeader-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
						$("#selectFileHeader").append(extractHeader2(text_data));
						
						$(".dataset").val(prefix);
						$(".length").val(text_data.length-1);
						
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
	
	$("#tagger").on('change',function(){
		$("#citation-container").hide();
		$("#citation-notice").empty();
		
		var algorithm = $(this).children(":selected").val();
		if (algorithm === 'posTag'){
			$("#citation-notice").append(
				`<p><b>Thank you for using our tool, if you use these results please cite it and the NLTK python library:</b></p>
				<ul>
					<li>Yun, J. T., Vance, N., Wang, C., Troy, J., Marini, L., Booth, R., Nelson, T., Hetrick, A., Hodgekins, H. (2018). 
					The Social Media Macroscope. In Gateways 2018.&nbsp<a href="https://doi.org/10.6084/m9.figshare.6855269.v2" target="_blank">
					https://doi.org/10.6084/m9.figshare.6855269.v2</a>
					</li>
					<li><a href="https://scholar.google.com/scholar?hl=en&as_sdt=0%2C14&q=NLTK%3A+the+natural+l
					anguage+toolkit.+In+Proceedings+of+the+COLING%2FACL+on+Interactive++++++++presentation+sessi
					ons+%28pp.+69-72%29.+Association+for+Computational+Linguistics&btnG=" target="_blank">
					Bird, S. (2006, July). NLTK: the natural language toolkit. In Proceedings of the COLING/ACL on Interactive 
						presentation sessions (pp. 69-72). Association for Computational Linguistics.</a>
					</li>
				</ul>`
			);
			$("#citation-container").show();
		}
		
	});
	
	// lambda vs batch
	$("#submit").on('click',function(){
			//console.log($(".length").val());
			if($(".length").val() === undefined){
				// pop error
				$("#modal-message").val("Cannot perform analysis on this dataset. Check if it exists!");
				$("#alert").modal('show');
			}else if ( $(".length").val() <= 20000 ){
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
	if ($("#model option:selected").val() === 'Please Select...' || $("#model option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a preprocess step!</h4>`);
		$("#alert").modal('show');
		$("#model").focus();
		return false;
	}
	
	if ($("#tagger option:selected").val() === 'Please Select...' || $("#tagger option:selected").val() === undefined){
		$("#modal-message").append(`<h4>Please select a tagging step!</h4>`);
		$("#alert").modal('show');
		$("#tagger").focus();
		return false;
	}
	
	if ($("input[name='selectFileColumn']:checked").val() === '' ||$("input[name='selectFileColumn']:checked").val() === undefined){
		$("#modal-message").append(`<h4>Please select a column of the text to analyze!</h4>`);
		$("#alert").modal('show');
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
