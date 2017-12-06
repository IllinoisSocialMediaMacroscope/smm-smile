google.charts.load('current', {packages:['wordtree']});

function drawWordTree(name,table,root){
	
	$('#gaudge').empty();
	$('#gaudge').append(`<div class="x_title">
							<h2>`+ name +`</h2>
						</div>
						<div class="x_content"> 
							<div class="note">
								<li>word tree reads from <b>left to right</b>, and each branch is a sentence/phrase</li>					
								<li><b>click</b><img src="bootstrap/img/logo/img-materials/mouse.png" width="20px"/> on the word will expand or collapse the tree</li>
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
						/* the text fields are:  text, user.description(tweet), description(twtUser),
						body(redditComment), selftext,title(redditSearch), 
						public description, description(redditSearchSubreddit)*/
						var allowed_field_list = ['text','user.description','_source.text', '_source.user.description','description',
						'body','title','_source.body','_source.title'];
						
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
						$("#selectFilePreview").append(arrayToTable(text_data.slice(0,11) ,'#selectFileTable'));
						//$("#selectFileTable").DataTable();
						
						$("#selectFileHeader-container").append(`<div class="form-group">
						<label class="control-label col-md-2 col-md-2 col-xs-12">Select Column to Analyze</label>
						<div class="col-md-8 col-md-8 col-xs-12" id="selectFileHeader"></div></div>`);
						$("#selectFileHeader").append(extractHeader2(text_data));
						
						// offer crawling for reddit comments modal
						if(directory === 'reddit-Post' || directory === 'reddit-Historical-Post' || directory === 'reddit-Search'){
							$("#dataset").val(directory + "/" + foldername + "/" + foldername + ".csv");
							$("#length").val(text_data.length-1);
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
					<li>Yun, J. T., Wang, C., Troy, J., Vance, N. P., Marini, L., Booth, R., Nelson, T., Hetrick, 
						A., & Hodgkins, H. (September, 2017) – Social Media Macroscope, <a href="http://socialmediamacroscope.org" target="_blank">
						http://socialmediamacroscope.org</a>.
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

});

/*----------------------form validation ----------------------------*/
function formValidation(){
	
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
		

	return true;
	
}
